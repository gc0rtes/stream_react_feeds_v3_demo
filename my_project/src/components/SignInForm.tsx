import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { SignInValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations";
import { Loader } from "lucide-react";

export function SignInForm() {
  const { checkAuthUser } = useUserContext();

  const { mutateAsync: signInAccount, isPending: isSigningIn } =
    useSignInAccount();

  const navigate = useNavigate();

  const form = useForm<z.infer<typeof SignInValidation>>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof SignInValidation>) {
    console.log("📝 Starting signin process with data:", data);

    const session = await signInAccount({
      email: data.email,
      password: data.password,
    });

    if (!session) {
      return toast("Sign in failed, please try again.");
    }

    console.log("✅ Session created, checking localStorage...");
    console.log(
      "📦 cookieFallback after signin:",
      localStorage.getItem("cookieFallback")
    );

    const isLoggedIn = await checkAuthUser();
    console.log("🔐 Auth check result:", isLoggedIn);

    //if user is logged in, redirect to home page
    if (isLoggedIn) {
      form.reset();
      console.log("🎉 Login successful, navigating to home");
      navigate("/");
    } else {
      console.log("❌ Sign in failed. Please try again.");
      return toast.error("Something went wrong");
    }
  }
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <img src="/assets/images/logo.svg" alt="logo" />
      <Card className="w-full bg-dark-1 text-white border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Log in to your account
          </CardTitle>
          <CardDescription>
            Welcome back! Please enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">Email</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder=""
                      autoComplete="email"
                      className="bg-dark-4 border-none"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-password">
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      id="form-rhf-demo-password"
                      aria-invalid={fieldState.invalid}
                      placeholder=""
                      autoComplete="current-password"
                      className="bg-dark-4 border-none"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Field orientation="horizontal">
            <Button
              type="submit"
              form="form-rhf-demo"
              className="w-full bg-primary-500 hover:bg-primary-500  flex gap-2"
            >
              {isSigningIn ? (
                <div className="flex-center gap-2">
                  <Loader /> Loading ...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </Field>
          <p className="text-sm ">
            Don't have an account?{" "}
            <Link className="text-primary-500" to="/sign-up">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
