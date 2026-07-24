/** Clear native session cookies, purge browser caches/storage, and redirect to sign-in. */
export async function signOutClient(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Failed to clear local storage on sign out:", e);
    }
  }

  const { signOutAction } = await import("@/app/actions");
  await signOutAction();

  if (typeof window !== "undefined") {
    window.location.href = "/sign-in";
  }
}
