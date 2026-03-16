import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6).max(50),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(50),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string().min(1),
  }),
});