// Scheduled weekly (see scripts/cron_jobs.sql). For every user with at least
// one transaction in the last 7 days, asks Gemini for a few short,
// personalized tips based on their spending and emails them.
import { getCategoryConfig } from "../../../constants/categories.ts";
import { wrapEmail } from "../_shared/emailLayout.ts";
import { sendEmail } from "../_shared/resend.ts";
import { createSupabaseAdmin } from "../_shared/supabaseAdmin.ts";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    tips: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
  },
  required: ["tips"],
};

async function generateTips(
  currency: string,
  byCategory: Record<string, number>,
  totalExpense: number,
  totalIncome: number
) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const breakdown = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => `${category}: ${amount.toFixed(2)} ${currency}`)
    .join(", ");

  const prompt = `You are a friendly personal finance coach. Based on this user's last 7 days of activity, write 2-4 short, specific, actionable tips (max 20 words each) to help them save money or manage their finances better. Be encouraging, not preachy. Don't repeat generic advice like "make a budget" unless it's clearly relevant.

Total income this week: ${totalIncome.toFixed(2)} ${currency}
Total expenses this week: ${totalExpense.toFixed(2)} ${currency}
Spending by category: ${breakdown || "none"}`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini request failed: ${await res.text()}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from Gemini");

  return (JSON.parse(text).tips as string[]) ?? [];
}

Deno.serve(async () => {
  const supabase = createSupabaseAdmin();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("clerk_id, email, name, currency");
  if (usersError) throw usersError;

  let sent = 0;

  for (const user of users ?? []) {
    if (!user.email) continue;

    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("type, amount, category")
      .eq("user_id", user.clerk_id)
      .gte("date", weekAgo.toISOString());
    if (txError) throw txError;
    if (!transactions || transactions.length === 0) continue;

    const totalExpense = transactions
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = transactions
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const byCategory: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type !== "EXPENSE") continue;
      byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
    }

    const currency = user.currency ?? "USD";
    const tips = await generateTips(currency, byCategory, totalExpense, totalIncome);
    if (tips.length === 0) continue;

    const net = totalIncome - totalExpense;
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => {
        // deno-lint-ignore no-explicit-any
        const label = getCategoryConfig(category as any)?.label ?? category;
        return `<li style="margin:0 0 8px;padding:10px 12px;background:#FFF1F4;border:1px solid #F7CDD5;border-radius:10px;color:#5A5A5F;">${label}: <strong style="color:#DC1E3D;">${amount.toFixed(2)} ${currency}</strong></li>`;
      })
      .join("");

    const subject = "Your Welth weekly recap & money tips";

    const html = wrapEmail(`
      <p style="margin:0 0 8px;color:#DC1E3D;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your weekly money update</p>
      <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#000000;">Hi ${user.name ?? "there"},</p>
      <p style="margin:0 0 20px;">Here's your weekly recap from Welth — a quick look at the last 7 days, plus a few tips to help you make the most of the week ahead.</p>
      <table style="width:100%;border-collapse:separate;border-spacing:0;margin-bottom:22px;background:#000000;background-image:linear-gradient(135deg,#000000 0%,#DC1E3D 72%,#000000 100%);border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:14px 16px;color:#D8D8DB;">Income</td>
          <td style="padding:14px 16px;text-align:right;font-weight:700;color:#3DDC84;">+${totalIncome.toFixed(2)} ${currency}</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;border-top:1px solid rgba(255,255,255,0.18);color:#D8D8DB;">Expenses</td>
          <td style="padding:14px 16px;border-top:1px solid rgba(255,255,255,0.18);text-align:right;font-weight:700;color:#FFFFFF;">-${totalExpense.toFixed(2)} ${currency}</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;border-top:1px solid rgba(255,255,255,0.18);font-weight:700;color:#FFFFFF;">Net</td>
          <td style="padding:14px 16px;border-top:1px solid rgba(255,255,255,0.18);text-align:right;font-weight:700;color:${net >= 0 ? "#3DDC84" : "#FFFFFF"};">${net >= 0 ? "+" : ""}${net.toFixed(2)} ${currency}</td>
        </tr>
      </table>
      ${
        topCategories
          ? `<p style="margin:0 0 10px;font-weight:700;color:#000000;">Where it went</p>
             <ul style="margin:0 0 22px;padding:0;list-style:none;">${topCategories}</ul>`
          : ""
      }
      <p style="margin:0 0 10px;font-weight:700;color:#000000;">Tips for you</p>
      <ol style="margin:0;padding:0;list-style-position:inside;">
        ${tips.map((tip) => `<li style="margin:0 0 8px;padding:11px 12px;background:#F5F5F4;border-left:3px solid #DC1E3D;border-radius:8px;color:#1A1D26;">${tip}</li>`).join("")}
      </ol>
    `);

    await sendEmail({ to: user.email, subject, html });

    sent++;
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
