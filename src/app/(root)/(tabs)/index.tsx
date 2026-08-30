import { BudgetModal } from "../../../../components/BudegetModal";
import { TransactionRow } from "../../../../components/TransactionRow";
import { getCategoryConfig } from "../../../../constants/categories";
import {
  HERO_GRADIENT_COLORS,
  HERO_GRADIENT_END,
  HERO_GRADIENT_LOCATIONS,
  HERO_GRADIENT_START,
} from "../../../../constants/theme";
import { useAccountsQuery } from "../../../../hooks/queries/useAccountsQuery";
import { useBudgetQuery } from "../../../../hooks/queries/useBudgetQuery";
import { useDeleteTransaction } from "../../../../hooks/mutations/useTransactionMutations";
import { useTransactionsQuery } from "../../../../hooks/queries/useTransactionQuery";
import { Transaction } from "../../../../lib/services/transactions";
import { formatPrice } from "../../../../lib/utils";
import { useUserStore } from "../../../../store/userStore";
import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { isSameMonth } from "date-fns";
import { BlurTargetView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoLight from "../../../../assets/splash/logolight.svg";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  {
    icon: "camera",
    label: "AI Receipt Scan",
    action: "scan",
    color: "#1A85FF",
  },
  {
    icon: "mic",
    label: "Voice Entry",
    action: "voice",
    color: "#FF6B4A",
  },
  {
    icon: "plus",
    label: "Add Manually",
    action: "manual",
    color: "#3DDC84",
  },
] as const;

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const currency = useUserStore((s) => s.currency);
  const modalBlurTarget = useRef<View | null>(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      router.prefetch("/(root)/(tabs)/transactions");
    });

    return () => task.cancel();
  }, [router]);

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    isRefetching: accountsRefetching,
    refetch: refetchAccounts,
  } = useAccountsQuery();
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    isRefetching: transactionsRefetching,
    refetch: refetchTransactions,
  } = useTransactionsQuery();
  const { data: budget = null, refetch: refetchBudget } = useBudgetQuery();
  const { mutateAsync: removeTransaction } = useDeleteTransaction();

  const loading = accountsLoading || transactionsLoading;
  const refreshing = accountsRefetching || transactionsRefetching;

  const onRefresh = () => {
    refetchAccounts();
    refetchTransactions();
    refetchBudget();
  };

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts]
  );

  const monthTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => isSameMonth(new Date(tx.date), now));
  }, [transactions]);

  const monthIncome = useMemo(
    () =>
      monthTransactions
        .filter((tx) => tx.type === "INCOME")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions]
  );
  const monthExpense = useMemo(
    () =>
      monthTransactions
        .filter((tx) => tx.type === "EXPENSE")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions]
  );

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const handleDelete = useCallback((tx: Transaction) => {
    Alert.alert(
      "Delete transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await removeTransaction(tx);
            if (error) {
              Alert.alert("Error", "Couldn't delete this transaction.");
            }
          },
        },
      ]
    );
  }, [removeTransaction]);

  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] ?? 0) + tx.amount;
      });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category: category as Transaction["category"],
        amount,
        color: getCategoryConfig(category as Transaction["category"]).color,
      }));
  }, [monthTransactions]);

  return (
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
      <BlurTargetView ref={modalBlurTarget} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 bg-brand-body"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Dark hero header */}
        <View className="overflow-hidden rounded-b-[28px]">
          <LinearGradient
            colors={HERO_GRADIENT_COLORS}
            locations={HERO_GRADIENT_LOCATIONS}
            start={HERO_GRADIENT_START}
            end={HERO_GRADIENT_END}
          >
            <View className="px-5 pt-5 pb-[22px]">
          <View className="mb-[22px] w-full flex-row items-center justify-between">
            <View className="-ml-14 h-24 w-44">
              <LogoLight width="100%" height="100%" />
            </View>
            <View className="ml-auto flex-row items-center gap-[13px]">
              <View className="items-end">
                <Text className="text-[16px] text-brand-text-secondary">
                  {getGreeting()}
                </Text>
                <Text className="text-[21px] font-medium text-brand-text-primary">
                  {user?.firstName ?? "there"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/profile")}
                className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-[#1A1D26]"
              >
                {user?.imageUrl && user.hasImage ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={{ width: 50, height: 50 }}
                    contentFit="cover"
                  />
                ) : (
                  <Feather name="user" size={23} color="#8A8D96" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-[22px]">
            <Text className="text-brand-text-secondary text-xs mb-1.5">
              Total balance
            </Text>
            <Text className="text-brand-text-primary text-[38px] font-medium tracking-tight">
              {formatPrice(totalBalance, currency)}
            </Text>
            <View className="flex-row gap-3.5 mt-2.5">
              <View className="flex-row items-center gap-1.5">
                <Feather name="arrow-up-right" size={14} color="#3DDC84" />
                <Text className="text-brand-success text-[13px]">
                  {formatPrice(monthIncome, currency)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Feather name="arrow-down-right" size={14} color="#FF6B4A" />
                <Text className="text-brand-coral text-[13px]">
                  {formatPrice(monthExpense, currency)}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-2.5">
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() =>
                  router.push({
                    pathname: "/(root)/(tabs)/add-transaction",
                    params: { action: action.action },
                  })
                }
                activeOpacity={0.75}
                className="flex-1 items-center gap-2 rounded-2xl border border-white/30 bg-white/10 py-4"
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${action.color}26` }}
                >
                  <Feather name={action.icon} size={17} color={action.color} />
                </View>
                <Text className="text-[#B8BAC2] text-[11px] font-medium text-center">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
            </View>
          </LinearGradient>
        </View>

        {/* Light body */}
        <View className="px-5 pt-[18px] pb-5 android:pb-[130px]">
          <TouchableOpacity
            onPress={() => router.push("/(root)/(tabs)/assistant")}
            className="bg-white rounded-[18px] border border-[#E8E6DF] p-3.5 flex-row items-center gap-2.5 mb-[18px]"
          >
            <View className="w-[26px] h-[26px] rounded-full bg-[#4A9EFF1A] items-center justify-center">
              <View className="w-[7px] h-[7px] rounded-full bg-brand-blue" />
            </View>
            <Text className="text-brand-text-muted text-[13px] flex-1">
              Ask AI anything about your money
            </Text>
            <Feather name="arrow-right" size={16} color="#4A9EFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setBudgetModalOpen(true)}
            activeOpacity={0.85}
            className="bg-white rounded-[18px] border border-[#E8E6DF] p-4 mb-[18px]"
          >
            <View className="flex-row items-center justify-between mb-2.5">
              <Text className="text-[#1A1D26] text-sm font-medium">
                Monthly budget
              </Text>
              <Feather name="edit-2" size={13} color="#8A8D96" />
            </View>

            {budget ? (
              <>
                <Text className="text-brand-text-secondary text-xs mb-2">
                  {formatPrice(monthExpense, currency)} of{" "}
                  {formatPrice(budget.amount, currency)} spent
                </Text>
                <View className="h-2 rounded-full bg-[#F0EEE7] overflow-hidden">
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.round((monthExpense / budget.amount) * 100),
                        100
                      )}%`,
                      backgroundColor:
                        monthExpense >= budget.amount
                          ? "#FF6B4A"
                          : monthExpense >= budget.amount * 0.8
                          ? "#F7DC6F"
                          : "#3DDC84",
                    }}
                  />
                </View>
              </>
            ) : (
              <Text className="text-brand-text-secondary text-xs">
                Tap to set a monthly spending budget
              </Text>
            )}
          </TouchableOpacity>

          {expenseBreakdown.length > 0 && (
            <View className="bg-white rounded-[18px] border border-[#E8E6DF] p-4 mb-[18px]">
              <Text className="text-[#1A1D26] text-sm font-medium mb-3">
                Expense breakdown (this month)
              </Text>
              <View className="flex-row items-center">
                <PieChart
                  data={expenseBreakdown.map((c) => ({
                    value: c.amount,
                    color: c.color,
                  }))}
                  radius={60}
                  innerRadius={38}
                  innerCircleColor="#fff"
                />
                <View className="flex-1 ml-4 gap-1.5">
                  {expenseBreakdown.slice(0, 6).map((c) => (
                    <View
                      key={c.category}
                      className="flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-1.5">
                        <View
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <Text className="text-brand-text-secondary text-[11px]">
                          {getCategoryConfig(c.category).label}
                        </Text>
                      </View>
                      <Text className="text-brand-bg text-[11px] font-medium">
                        {formatPrice(c.amount, currency)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#1A1D26] text-sm font-medium">
              Recent transactions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/transactions")}
            >
              <Text className="text-brand-text-secondary text-xs">See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center py-6">
              <ActivityIndicator color="#4A9EFF" />
            </View>
          ) : recentTransactions.length === 0 ? (
            <View className="items-center py-6">
              <Feather name="inbox" size={28} color="#BDC3C7" />
              <Text className="text-brand-text-muted text-sm mt-3">
                No transactions yet
              </Text>
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} />
            ))
          )}
        </View>
        </ScrollView>
      </BlurTargetView>

      {user && (
        <BudgetModal
          visible={budgetModalOpen}
          budget={budget}
          blurTarget={modalBlurTarget}
          onClose={() => setBudgetModalOpen(false)}
          onSaved={() => setBudgetModalOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}
