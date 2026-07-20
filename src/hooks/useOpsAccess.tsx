import { useEffect, useState } from "react";
import { opsSupabase } from "@/lib/opsSupabase";

export type OpsRole = "admin" | "travel_admin" | "event_staff" | null;

export function useOpsAccess(email: string | null | undefined) {
  const [role, setRole] = useState<OpsRole>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!email) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    opsSupabase
      .from("app_admins")
      .select("email, display_name, role")
      .eq("email", email.toLowerCase())
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("useOpsAccess:", error);
          setRole(null);
        } else {
          setRole((data?.role as OpsRole) ?? null);
          setDisplayName(data?.display_name ?? null);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  return { role, displayName, loading };
}
