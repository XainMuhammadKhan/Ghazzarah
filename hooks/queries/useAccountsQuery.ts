import { useUser } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query/keys";
import { getAccounts } from "../../lib/services/accounts";
import { useSupabase } from "../useSupabase";

export function useAccountsQuery() {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.accounts(user?.id),
    queryFn: () => getAccounts(supabase, user!.id),
    enabled: !!user,
    // CHANGED: added staleTime. This query is used by both Home and
    // Transactions (for the account filter chips), and had no staleTime
    // before, so it refetched on every mount too. Accounts change rarely
    // (user adds/removes a bank account occasionally, not every session),
    // so a longer cache window here is safe and cuts one more network
    // call out of every tab switch.
    staleTime: 60_000,
  });
}