import { createContext, useContext, useMemo, useState } from "react";

const BUG_MODES = [
  "login_500",
  "login_no_error",
  "task_no_validation",
  "delete_btn_missing",
  "modal_wont_close",
  "filter_broken",
  "status_toggle_fail",
] as const;

export type BugMode = (typeof BUG_MODES)[number] | null;

type BugContextValue = {
  bug: BugMode;
  isBug: (mode: Exclude<BugMode, null>) => boolean;
};

const BugContext = createContext<BugContextValue | undefined>(undefined);

function parseBugFromUrl(): BugMode {
  const queryValue = new URLSearchParams(window.location.search).get("bug");

  if (queryValue && BUG_MODES.includes(queryValue as Exclude<BugMode, null>)) {
    return queryValue as Exclude<BugMode, null>;
  }

  return null;
}

export function BugProvider({ children }: { children: React.ReactNode }) {
  const [bug] = useState<BugMode>(() => parseBugFromUrl());

  const value = useMemo(
    () => ({
      bug,
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
