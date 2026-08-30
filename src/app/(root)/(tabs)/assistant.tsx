import { useBudgetQuery } from "../../../../hooks/queries/useBudgetQuery";
import { useTransactionsQuery } from "../../../../hooks/queries/useTransactionQuery";
import {
  HERO_GRADIENT_COLORS,
  HERO_GRADIENT_END,
  HERO_GRADIENT_LOCATIONS,
  HERO_GRADIENT_START,
} from "../../../../constants/theme";
import { askAssistant } from "../../../../lib/services/assistant";
import { useUserStore } from "../../../../store/userStore";
import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "How much did I spend on food this month?",
  "What's my biggest expense this week?",
  "Am I over budget anywhere?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi! Ask me anything about your spending or budgets in last 30 days.",
  },
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <View className={`mb-3 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}>
      {isUser ? (
        <View className="overflow-hidden rounded-2xl">
        <LinearGradient
          colors={HERO_GRADIENT_COLORS}
          locations={HERO_GRADIENT_LOCATIONS}
          start={HERO_GRADIENT_START}
          end={HERO_GRADIENT_END}
        >
          <View className="px-3.5 py-2.5">
            <Text className="text-sm text-white">{message.content}</Text>
          </View>
        </LinearGradient>
        </View>
      ) : (
        <View className="rounded-2xl border border-[#E8E6DF] bg-white px-3.5 py-2.5">
        <Text className="text-sm text-brand-bg">
          {message.content}
        </Text>
        </View>
      )}
    </View>
  );
}

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const currency = useUserStore((s) => s.currency);
  const { refetch: refetchTransactions } = useTransactionsQuery();
  const { refetch: refetchBudget } = useBudgetQuery();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending || !user) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const [{ data: transactions = [] }, { data: budget = null }] =
        await Promise.all([refetchTransactions(), refetchBudget()]);
      const reply = await askAssistant(text, transactions, budget, currency);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: reply },
      ]);
    } catch (err) {
      console.error("Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, something went wrong answering that. Try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <View className="px-5 pt-3 pb-2">
        <Text className="text-brand-bg text-xl font-semibold">Assistant</Text>
      </View>

      <View className="flex-1">
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 12,
          }}
          ListFooterComponent={
            sending ? (
              <View className="self-start mb-3 bg-white border border-[#E8E6DF] rounded-2xl px-3.5 py-2.5">
                <ActivityIndicator size="small" color="#4A9EFF" />
              </View>
            ) : null
          }
        />

        <KeyboardStickyView offset={{ closed: 0, opened: 12 }}>
        {messages.length <= 1 && (
          <View className="px-5 pb-2 gap-2 bg-brand-body">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                onPress={() => sendMessage(prompt)}
                className="bg-white rounded-xl border border-[#E8E6DF] px-3.5 py-2.5 self-start"
              >
                <Text className="text-brand-text-secondary text-xs">
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View
          className="flex-row items-center gap-2 px-5 pt-2 bg-brand-body"
          style={{
            paddingBottom: keyboardVisible
              ? 12
              : Math.max(insets.bottom, 10) + 104,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your money..."
            placeholderTextColor="#8A8D96"
            editable={!sending}
            className="flex-1 bg-white border border-[#E8E6DF] rounded-full px-4 py-3 text-sm text-brand-bg"
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={sending}
            className="w-11 h-11 rounded-full bg-brand-red items-center justify-center"
            style={{ opacity: sending ? 0.6 : 1 }}
          >
            <Feather name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        </KeyboardStickyView>
      </View>
    </SafeAreaView>
  );
}
