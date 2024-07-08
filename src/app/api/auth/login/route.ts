import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || "bitch";

export async function POST(request: any) {
  const { email, password } = await request.json();

  // Validate the request
  if (!email || !password) {
    return NextResponse.json(
      {
        errors: [
          { field: "email", message: "Email is required" },
          { field: "password", message: "Password is required" },
        ],
      },
      { status: 4422 }
    );
  }

  // Remove white spaces
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: trimmedEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          errors: [{ field: "email", message: "Invalid credentials" }],
        },
        { status: 4422 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      trimmedPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: "Authentication failed",
        },
        { status: 401 }
      );
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        data: {
          accessToken: token,
          user: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
          },
        },
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        errors: [
          { field: "email", message: "Email is required" },
          { field: "password", message: "Password is required" },
        ],
      },
      { status: 4422 }
    );
  }
}
