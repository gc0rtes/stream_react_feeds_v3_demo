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

// ============================================================
// POST
// ============================================================
export const PostValidation = z.object({
  text: z
    .string()
    .min(5, { message: "Minimum 5 characters." })
    .max(2200, { message: "Maximum 2,200 caracters" }),
  file: z.array(z.string()),
  custom_location: z
    .string()
    .min(1, { message: "This field is required" })
    .max(1000, { message: "Maximum 1000 characters." }),
  interest_tags: z.string(),
});
