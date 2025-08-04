// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "../../context/AuthContext";
import Header from "../components/Header";

export const metadata = {
  title: "E-commerce platform",
  description: "E-commerce platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
