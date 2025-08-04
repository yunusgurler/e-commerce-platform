"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../../../../utils/validators";
import { Button, Card, Input, Typography, Alert } from "antd";

export default function SignupPage() {
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        }/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Signup failed");

      if (json.verificationLink) {
        setVerificationLink(json.verificationLink);
        console.log("json.verificationLink", json.verificationLink);
        
      } else {
        Alert.success?.("Registered. Check your email for verification.");
      }
    } catch (e: any) {
      alert(e.message || "Signup error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {verificationLink && (
          <div className="mb-6">
            <Alert
              type="info"
              showIcon
              description={
                <div>
                  <p className="mb-1">
                    Email verification link (for dev/testing):
                  </p>
                  <a
                    href={verificationLink}
                    className="text-blue-600 underline break-all"
                  >
                    Verify Email
                  </a>
                </div>
              }
            />
          </div>
        )}
        <Card
          title={<Typography.Title level={3}>Sign Up</Typography.Title>}
          style={{ width: "100%" }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.firstName && (
                <div className="text-red-500 text-xs">
                  {errors.firstName.message}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.lastName && (
                <div className="text-red-500 text-xs">
                  {errors.lastName.message}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.email && (
                <div className="text-red-500 text-xs">
                  {errors.email.message}
                </div>
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
              loading={submitting}
              disabled={submitting}
            >
              Sign Up
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
