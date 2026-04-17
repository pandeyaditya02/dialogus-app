import { NextRequest, NextResponse } from "next/server";
import {
  verifySanityToken,
  createSessionPayload,
  signSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { sanityToken } = await request.json();

    if (!sanityToken || typeof sanityToken !== "string") {
      return NextResponse.json(
        { error: "Sanity API token is required" },
        { status: 400 }
      );
    }

    const user = await verifySanityToken(sanityToken);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid token or you are not a member of this Sanity project" },
        { status: 401 }
      );
    }

    const payload = createSessionPayload(user);
    const sessionCookie = await signSession(payload);

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
