export function getOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("ybudget:onboardingComplete") === "true";
}

export function setOnboardingComplete(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    "ybudget:onboardingComplete",
    value ? "true" : "false",
  );
}
