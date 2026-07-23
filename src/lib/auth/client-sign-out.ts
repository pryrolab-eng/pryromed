/** Clear native session cookie and redirect to sign-in. */
export async function signOutClient(): Promise<void> {
  const { signOutAction } = await import("@/app/actions");
  await signOutAction();
}
