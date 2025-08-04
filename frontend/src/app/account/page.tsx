"use client";

import React, { useEffect, useState } from "react";
import { Card, Button, Collapse, message, Spin } from "antd";
import { useAuth } from "../../../context/AuthContext";

type Address = {
  _id: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
  label?: string;
};

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addresses?: Address[];
  role?: string;
};

export default function ProfilePage() {
  const { accessToken, user, loading, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        }/api/auth/me`,
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to load profile");
      const { user: u } = await res.json();
      setProfile(u);
    } catch (e: any) {
      console.error(e);
      message.error("Could not load profile");
    }
  };

  useEffect(() => {
    if (!loading) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, accessToken]);

  if (loading || !profile)
    return (
      <div className="p-6">
        <Spin />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-medium text-gray-500">First Name</div>
            <div className="mt-1">{profile.firstName}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Last Name</div>
            <div className="mt-1">{profile.lastName}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Email</div>
            <div className="mt-1">{profile.email}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Phone</div>
            <div className="mt-1">{profile.phone || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Role</div>
            <div className="mt-1">{profile.role || "customer"}</div>
          </div>
        </div>
        <div className="mt-6">
          <Button type="default" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
