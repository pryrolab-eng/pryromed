"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";
import { POST_AUTH_ENTRY_PATH, RESET_PASSWORD_PATH } from "@/lib/middleware/auth-routes";
import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

export type SignInFormState = {
  error?: string;
  unconfirmed?: boolean;
  email?: string;
} | null;

async function api(path: string, options?: RequestInit) {
  const { url } = resolveApiUrl(path);
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  // Server Actions run in Node, where fetch requires an absolute URL. Keep
  // browser calls relative so the production rewrite can proxy them to Nest.
  const requestUrl = url.startsWith("/") && host ? `${protocol}://${host}${url}` : url;
  const cookieStore = await cookies();
  const secureAuthCookie = cookieStore.get("__Secure-pryrox_session")?.value;
  const authCookie = secureAuthCookie ?? cookieStore.get("pryrox_session")?.value;
  const headersObj: Record<string, string> = { "Content-Type": "application/json", ...(options?.headers as Record<string, string>) };
  if (authCookie) {
    const cookieName = secureAuthCookie ? "__Secure-pryrox_session" : "pryrox_session";
    headersObj["Cookie"] = `${cookieName}=${authCookie}`;
  }
  const res = await fetch(requestUrl, { ...options, headers: headersObj });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data, status: res.status, res };
}

async function setCookieValue(name: string, value: string) {
  const store = await cookies();
  store.set(name, value, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

async function clearCookie(name: string) {
  const store = await cookies();
  store.set(name, "", { path: "/", maxAge: 0 });
}

async function forwardSessionCookies(res: Response) {
  const cookieHeader = res.headers.get("set-cookie");
  if (!cookieHeader) return;
  const names = /(?:^|,\s*)((?:__Secure-)?pryrox_(?:session|refresh))=([^;,]+)/g;
  for (const match of Array.from(cookieHeader.matchAll(names))) {
    const [, name, value] = match;
    if (name && value) {
      await setCookieValue(name, value);
    }
  }
}

export const signInAction = async (_prevState: SignInFormState, formData: FormData): Promise<SignInFormState> => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const trimmedEmail = email.trim();

  const { ok, data, res } = await api("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email: trimmedEmail, password }),
  });

  if (!ok) {
    return { error: data?.error || "Sign-in failed", email: trimmedEmail, unconfirmed: data?.unconfirmed || undefined };
  }

  if (data.needsTwoFactor) {
    return redirect(`/verify-2fa?session=${data.sessionToken}`);
  }

  await forwardSessionCookies(res);
  redirect(POST_AUTH_ENTRY_PATH);
};

export const signUpAction = async (formData: FormData) => {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const full_name = ((formData.get("full_name") as string) || "").trim();

  const { ok, data, res } = await api("/api/auth/sign-up", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName: full_name }),
  });

  if (!ok) {
    return encodedRedirect("error", "/sign-up", data?.error || "Could not create account");
  }

  await forwardSessionCookies(res);
  const params = new URLSearchParams({ email });
  redirect(`/verify-email?${params.toString()}`);
};

export const signInWithGoogleAction = async () => {
  redirect("/api/auth/google");
};

export const signOutAction = async () => {
  await api("/api/auth/sign-out", { method: "POST" });
  await Promise.all([
    clearCookie("pryrox_session"),
    clearCookie("pryrox_refresh"),
    clearCookie("__Secure-pryrox_session"),
    clearCookie("__Secure-pryrox_refresh"),
  ]);
  redirect("/sign-in");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = (formData.get("email") as string)?.trim();
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required.");
  }

  const { ok, data } = await api("/api/auth/recovery-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!ok) {
    return encodedRedirect("error", "/forgot-password", data?.error || "Failed to send recovery email");
  }

  return encodedRedirect("success", "/forgot-password", "Check your email for a password reset link.");
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect("error", RESET_PASSWORD_PATH, "Password fields are required.");
  }
  if (password !== confirmPassword) {
    return encodedRedirect("error", RESET_PASSWORD_PATH, "Passwords do not match.");
  }
  if (password.length < 6) {
    return encodedRedirect("error", RESET_PASSWORD_PATH, "Password must be at least 6 characters.");
  }

  const nativeToken = (formData.get("native_token") as string | null)?.trim();

  if (nativeToken) {
    const { ok, data } = await api("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: nativeToken, password }),
    });

    if (!ok) {
      return encodedRedirect("error", RESET_PASSWORD_PATH, data?.error || "Your reset link expired or is invalid.");
    }

    clearCookie("pryrox_session");
    clearCookie("pryrox_refresh");
    clearCookie("__Secure-pryrox_session");
    clearCookie("__Secure-pryrox_refresh");

    return encodedRedirect("success", "/sign-in", "Your password was updated. Sign in with your new password.");
  }

  return encodedRedirect("error", RESET_PASSWORD_PATH, "Your reset link expired or is invalid. Request a new one from Forgot password.");
};
