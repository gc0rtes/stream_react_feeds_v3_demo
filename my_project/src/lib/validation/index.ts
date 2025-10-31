import * as z from "zod";

export const SignUpValidation = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const SignInValidation = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().max(100, "Password must be at most 100 characters"),
});

export const CreateMessageValidation = z.object({
  message: z.string().min(1, "Message is required"),
  file: z.custom<File[]>().optional(),
  location: z.string().optional(),
  tags: z.string().optional(),
});
