
import type { Request } from "express";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

import User from "../models/User.js";

interface TokenPayload extends jwt.JwtPayload {
  userId: string;
  role: string;
  tokenVersion: number;
}

export interface AuthContext {
  user: {
    userId: string;
    role: string;
  } | null;
}

const buildContext = async (
  req: Request
): Promise<AuthContext> => {
  const authorization = req.headers.authorization;

  // No token means the user is not authenticated.
  if (!authorization) {
    return { user: null };
  }

  // Check Bearer authentication format.
  if (!authorization.startsWith("Bearer ")) {
    throw new GraphQLError("Invalid authorization format.");
  }

  const token = authorization.slice(7).trim();
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    throw new GraphQLError(
      "Invalid authentication credentials."
    );
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      !decoded.userId ||
      !decoded.role ||
      typeof decoded.tokenVersion !== "number"
    ) {
      throw new Error("Invalid token payload.");
    }

    const payload = decoded as TokenPayload;

    // Check the user's current account and session version.
    const user = await User.findById(payload.userId)
      .select("role isActive tokenVersion");

    if (!user || !user.isActive) {
      throw new Error("Account not found or inactive.");
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new Error("Session has been invalidated.");
    }

    // Also ensure the role in the token is still current.
    if (user.role !== payload.role) {
      throw new Error("User role has changed.");
    }

    return {
      user: {
        userId: user._id.toString(),
        role: user.role,
      },
    };
  } catch {
    throw new GraphQLError(
      "Invalid, expired, or revoked authentication token. Please log in again."
    );
  }
};

export default buildContext;
