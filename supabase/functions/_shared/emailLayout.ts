// Logo hosted in the public "email-assets" Supabase Storage bucket (see
// scripts/email_assets_bucket.sql) — email clients only load images from a
// public URL, they can't reach local app assets.
const LOGO_URL = Deno.env.get("EMAIL_LOGO_URL");

// Shared HTML wrapper so both scheduled emails look consistent and
// reasonably professional without pulling in a templating library.
export function wrapEmail(bodyHtml: string) {
  return `
  <div style="background:#F5F5F4;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E8E6DF;box-shadow:0 12px 32px rgba(0,0,0,0.08);">
      <div style="background:#000000;background-image:linear-gradient(135deg,#000000 0%,#DC1E3D 72%,#000000 100%);padding:22px 28px;">
        ${
          LOGO_URL
            ? `<img src="${LOGO_URL}" alt="Welth" height="28" style="display:block;height:28px;width:auto;" />`
            : `<span style="color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:0.2px;">Welth</span>`
        }
      </div>
      <div style="padding:28px;color:#1A1D26;font-size:14px;line-height:1.6;">
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #E8E6DF;background:#F5F5F4;">
        <span style="color:#8A8D96;font-size:11px;">You're receiving this because you have an account with Welth. Manage your budget anytime in the app.</span>
      </div>
    </div>
  </div>`;
}
