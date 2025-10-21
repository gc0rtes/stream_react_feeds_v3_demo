import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import * as z from "zod";

import { Link } from "react-router-dom";

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

import { SignUpValidation } from "@/lib/validation";
import Loader from "./shared/Loader";
import { createUserAccount } from "@/lib/appwrite/api";
import { useState } from "react";

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SignUpValidation>>({
    resolver: zodResolver(SignUpValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof SignUpValidation>) {
    setIsLoading(true);
    console.log("data", data);
    const newUser = await createUserAccount(data);
    console.log("newUser", newUser);

    setIsLoading(false);
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <img src="/assets/images/logo.svg" alt="logo" />
      <Card className="w-full bg-dark-1  text-white border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Create a new account
          </CardTitle>
          <CardDescription>
            To use our platform, please enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-name">Name</FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      id="form-rhf-demo-name"
                      aria-invalid={fieldState.invalid}
                      placeholder=""
                      autoComplete="name"
                      className="bg-dark-4 border-none"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-username">
                      Username
                    </FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      id="form-rhf-demo-username"
                      aria-invalid={fieldState.invalid}
                      placeholder=""
                      autoComplete="username"
                      className="bg-dark-4 border-none"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-email">Email</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      id="form-rhf-demo-email"
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
              className="w-full bg-primary-500 hover:bg-primary-500 text-light-1 flex gap-2"
            >
              {isLoading ? (
                <div className="flex-center gap-2">
                  <Loader /> Loading ...
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>
          </Field>
          <p className="text-small-regular text-light-2 text-center">
            Already have an account?{" "}
            <Link className="text-primary-500" to="/sign-in">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
