import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGoogleAuthCode,
  fetchGoogleUserProfile,
  isGoogleOAuthConfigured,
  verifyGoogleOAuthState,
} from "@/lib/auth/native/google-oauth";
import { completeNativeOAuthSignIn } from "@/lib/auth/native/complete-oauth-sign-in";
import { prisma } from "@/lib/db/prisma";
import { getAppUrl } from "@/lib/app-url";

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/sign-in?error=Google+sign-in+is+not+configured", getAppUrl()),
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL(
        "/sign-in?error=" + encodeURIComponent(error ?? "Google sign-in was cancelled"),
        getAppUrl(),
      ),
    );
  }

  try {
    const statePayload = await verifyGoogleOAuthState(state);
    if (!statePayload) {
      return NextResponse.redirect(
        new URL("/sign-in?error=" + encodeURIComponent("Invalid OAuth state"), getAppUrl()),
      );
    }

    const { accessToken } = await exchangeGoogleAuthCode(code);
    const profile = await fetchGoogleUserProfile(accessToken);

    // Find or create user
    let authUser = await prisma.auth_users.findFirst({
      where: { email: profile.email },
      select: { id: true, email: true },
    });

    if (!authUser) {
      // Create new user via oauth
      const now = new Date();
      authUser = await prisma.auth_users.create({
        data: {
          id: crypto.randomUUID(),
          email: profile.email,
          email_confirmed_at: now,
          raw_user_meta_data: {
            full_name: profile.name,
            avatar_url: profile.picture,
            provider: "google",
            sub: profile.sub,
          } as never,
          raw_app_meta_data: { provider: "google", providers: ["google"] } as never,
          created_at: now,
          updated_at: now,
        },
        select: { id: true, email: true },
      });

      // Create public user profile
      await prisma.public_users.upsert({
        where: { id: authUser.id },
        create: {
          id: authUser.id,
          email: profile.email,
          full_name: profile.name,
          token_identifier: profile.email,
          created_at: now,
          updated_at: now,
        },
        update: {
          full_name: profile.name ?? undefined,
          updated_at: now,
        },
      });
    }

    // Complete sign-in — handles 2FA and cookie setting
    return await completeNativeOAuthSignIn(authUser.id, statePayload.nextPath);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(
        "/sign-in?error=" + encodeURIComponent("Google sign-in failed. Please try again."),
        getAppUrl(),
      ),
    );
  }
}
