import { useAuth } from "@clerk/expo";
import { useEffect, useMemo, useRef } from "react";
import { createClerkSupabaseClient } from "../lib/supabase";

export function useSupabase() {
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const client = useMemo(
    () => createClerkSupabaseClient(() => getTokenRef.current?.()),
    [] // empty deps — create the client once, getToken is captured in the closure
  );

  return client;
}