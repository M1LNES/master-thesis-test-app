import { createContext, useContext, useMemo, useState } from "react";

const BUG_MODES = [
  "login_500",
  "login_no_error",
  "task_no_validation",
  "delete_btn_missing",
  "modal_wont_close",
  "filter_broken",
  "status_toggle_fail",
  "rbac_leak",
  "admin_menu_visible",
  "register_password_bypass",
  "toast_missing",
] as const;

export type BugMode = (typeof BUG_MODES)[number] | null;

const BUG_CODE_TO_MODE = {
  q7m2vn4k: "login_500",
  p3x9ha1t: "login_no_error",
  n8r4bf6q: "task_no_validation",
  d5k7mt2z: "delete_btn_missing",
  v1s8yl3c: "modal_wont_close",
  f6j2qp9w: "filter_broken",
  t4h9eu5m: "status_toggle_fail",
  c2n7zr8p: "rbac_leak",
  a9u3kd1x: "admin_menu_visible",
  r8w5gb2n: "register_password_bypass",
  y1p6ls4v: "toast_missing",
} as const satisfies Record<string, Exclude<BugMode, null>>;

const MODE_TO_BUG_CODE = Object.fromEntries(
  Object.entries(BUG_CODE_TO_MODE).map(([code, mode]) => [mode, code]),
) as Record<Exclude<BugMode, null>, string>;

type BugContextValue = {
  bug: BugMode;
  bugCode: string | null;
  isBug: (mode: Exclude<BugMode, null>) => boolean;
};

const BugContext = createContext<BugContextValue | undefined>(undefined);

function parseBugFromUrl(): BugMode {
  const queryValue = new URLSearchParams(window.location.search).get("b");

  if (queryValue && queryValue in BUG_CODE_TO_MODE) {
    const mode = BUG_CODE_TO_MODE[queryValue as keyof typeof BUG_CODE_TO_MODE];
    if (BUG_MODES.includes(mode)) {
      return mode;
    }
  }

  return null;
}

export function BugProvider({ children }: { children: React.ReactNode }) {
  const [bug] = useState<BugMode>(() => parseBugFromUrl());

  const value = useMemo(
    () => ({
      bug,
      bugCode: bug ? MODE_TO_BUG_CODE[bug] : null,
      isBug: (mode: Exclude<BugMode, null>) => mode === bug,
    }),
    [bug],
  );

  return <BugContext.Provider value={value}>{children}</BugContext.Provider>;
}

export function useBug() {
  const context = useContext(BugContext);

  if (!context) {
    throw new Error("useBug must be used inside BugProvider");
  }

  return context;
}
