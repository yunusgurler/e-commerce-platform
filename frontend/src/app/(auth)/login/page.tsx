"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../../../../utils/validators";
import { useAuth } from "../../../../context/AuthContext";
import { Button, Card, Input, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("next") || "/"; // allow optional ?next=/somewhere

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      // after successful login, navigate
      router.push(redirectTo);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card
        title={<Typography.Title level={3}>Login</Typography.Title>}
        style={{ width: 400 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
            {errors.email && (
              <div className="text-red-500 text-xs">{errors.email.message}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => <Input.Password {...field} />}
            />
            {errors.password && (
              <div className="text-red-500 text-xs">
                {errors.password.message}
              </div>
            )}
          </div>
          <Button
            block
            type="primary"
            htmlType="submit"
            loading={isSubmitting as boolean}
          >
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}
