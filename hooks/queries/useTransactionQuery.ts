import { useUser } from "@clerk/expo";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../hooks/useSupabase";
import { queryKeys } from "../../lib/query/keys";
import {
  getTransactions,
  getTransactionsPage,
  getTransactionsSince,
  TransactionFilters,
} from "../../lib/services/transactions";

const TRANSACTIONS_PAGE_SIZE = 40;

export function useTransactionsQuery(filters: TransactionFilters = {}) {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.transactions(user?.id, filters),
    queryFn: () => getTransactions(supabase, user!.id, filters),
    enabled: !!user,
  });
}

export function useInfiniteTransactionsQuery(
  filters: TransactionFilters = {}
) {
  const { user } = useUser();
  const supabase = useSupabase();

  return useInfiniteQuery({
    queryKey: queryKeys.transactionPages(user?.id, filters),
    queryFn: ({ pageParam }) =>
      getTransactionsPage(
        supabase,
        user!.id,
        filters,
        pageParam,
        TRANSACTIONS_PAGE_SIZE
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled: !!user,
  });
}

export function useTransactionsSinceQuery(
  filters: TransactionFilters,
  since: Date,
  enabled = true
) {
  const { user } = useUser();
  const supabase = useSupabase();
  const sinceIso = since.toISOString();

  return useQuery({
    queryKey: queryKeys.transactionsSince(user?.id, filters, sinceIso),
    queryFn: () => getTransactionsSince(supabase, user!.id, since, filters),
    enabled: !!user && enabled,
    staleTime: 60_000,
  });
}
