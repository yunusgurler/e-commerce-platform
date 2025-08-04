"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spin, Alert, Button } from "antd";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const email = params.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (token && email) {
      window.location.href = `http://localhost:4000/api/auth/verify-email?token=${encodeURIComponent(
        token
      )}&email=${encodeURIComponent(email)}`;
    }
  }, [token, email]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4">Verifying your email...</div>
          </div>
        )}
        {status === "success" && (
          <Alert
            type="success"
            message="Verified"
            description={
              <>
                {message} <br />
                <Link href="/login">
                  <Button type="primary" className="mt-2">
                    Go to Login
                  </Button>
                </Link>
              </>
            }
          />
        )}
        {status === "error" && (
          <Alert type="error" message="Error" description={message} />
        )}
      </div>
    </div>
  );
}
