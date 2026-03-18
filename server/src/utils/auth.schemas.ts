import { z } from "zod";

/**
 * Zod validation schemas for auth endpoints.
 * These are used by the `validate` middleware — if a request body doesn't
 * match the schema, the middleware returns a 400 before the controller runs.
 */

// POST /auth/register — requires username, email, and a password
export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6).max(50),
  }),
});

// POST /auth/login — username + password login
export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(50),
  }),
});

// POST /auth/refresh — client sends its refresh token to get a new access token
export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

// POST /auth/google — client sends the raw Google credential (ID token) from the Google button
export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string().min(1),
  }),
});

// PUT /users/me — optional bio (max 300) and/or username update
export const updateProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(300).optional(),
    username: z.string().min(3).max(30).optional(),
  }),
});