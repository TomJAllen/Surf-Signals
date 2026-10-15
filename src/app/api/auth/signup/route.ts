import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { MIN_PASSWORD_LENGTH, normaliseEmail } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normaliseEmail(body?.email);
    const password = body?.password;
    const name =
      typeof body?.name === "string" && body.name.trim() ? body.name.trim().slice(0, 100) : null;

    if (!email) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (password.length > 200) {
      return NextResponse.json({ error: "Password is too long" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
