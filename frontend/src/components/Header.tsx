"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Button, Dropdown, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

export default function Header() {
  const { user, logout } = useAuth();

  const menuItems = [
    user?.role === "admin"
      ? {
          key: "dashboard",
          label: (
            <Link href="/admin/dashboard" className="text-black">
              Admin Dashboard
            </Link>
          ),
        }
      : null,
    {
      key: "account",
      label: (
        <Link href="/account" className="text-black">
          My Account
        </Link>
      ),
    },
    {
      key: "logout",
      label: (
        <div
          className="text-black cursor-pointer"
          onClick={() => {
            logout();
          }}
        >
          Logout
        </div>
      ),
    },
  ].filter(Boolean) as any[];

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-black">
          E-Commerce Platform
        </Link>
        <nav className="hidden sm:flex gap-4">
          <Link href="/products" className="hover:underline text-black">
            Products
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <div className="flex items-center gap-2 cursor-pointer text-black">
              <Avatar icon={<UserOutlined />} size="small" />
              <span className="hidden sm:inline">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </Dropdown>
        ) : (
          <>
            <Link href="/login">
              <Button type="text" className="text-black">
                <span className="text-black">Login</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                type="primary"
                style={{ background: "#1f6feb", borderColor: "#1f6feb" }}
              >
                <span className="text-white">Sign Up</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
