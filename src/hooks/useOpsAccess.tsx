import { useEffect, useState, useCallback } from "react";
import { opsSupabase } from "@/lib/opsSupabase";

export type OpsRole =
  | "super_admin"
  | "admin"
  | "travel_admin"
  | "event_staff"
  | "member"
  | null;

export type ModuleName =
  | "kanban"
  | "content_review"
  | "press"
  | "events"
  | "staff"
  | "users"
  | "world_team"
  | "marketing"
  | "compose"
  | "hermes"
  | "event_command"
  | "crm";

export type ModuleLevel = "viewer" | "editor" | "manager";

export type ModulePermissions = Partial<Record<ModuleName, ModuleLevel>>;

export function useOpsAccess(email: string | null | undefined) {
  const [role, setRole] = useState<OpsRole>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<ModulePermissions>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!email) {
      setRole(null);
      setPermissions({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const clean = email.toLowerCase();
    const [adminRes, permRes] = await Promise.all([
      opsSupabase
        .from("app_admins")
        .select("email, display_name, role")
        .eq("email", clean)
        .maybeSingle(),
      opsSupabase
        .from("module_permissions")
        .select("module, role")
        .eq("email", clean),
    ]);

    if (adminRes.error) console.error("useOpsAccess admin:", adminRes.error);
    setRole((adminRes.data?.role as OpsRole) ?? null);
    setDisplayName(adminRes.data?.display_name ?? null);

    if (permRes.error) console.error("useOpsAccess perms:", permRes.error);
    const map: ModulePermissions = {};
    for (const r of permRes.data ?? []) {
      map[r.module as ModuleName] = r.role as ModuleLevel;
    }
    setPermissions(map);
    setLoading(false);
  }, [email]);

  useEffect(() => {
    load();
  }, [load]);

  const isSuperAdmin = role === "super_admin";
  const isFullAdmin = role === "super_admin" || role === "admin" || role === "travel_admin";

  const canView = (m: ModuleName) => isFullAdmin || !!permissions[m];
  const canEdit = (m: ModuleName) =>
    isFullAdmin || permissions[m] === "editor" || permissions[m] === "manager";
  const canManage = (m: ModuleName) => isFullAdmin || permissions[m] === "manager";

  return {
    role,
    displayName,
    permissions,
    loading,
    isSuperAdmin,
    isFullAdmin,
    canView,
    canEdit,
    canManage,
    reload: load,
  };
}
