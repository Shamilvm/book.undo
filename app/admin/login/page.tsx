"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, syncAdminSession } from "@/lib/admin-api";
import "@/styles/admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    syncAdminSession().then((data) => {
      if (data) router.replace("/admin");
    });
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = new FormData(e.currentTarget);
    const username = data.get("username") as string;
    const password = data.get("password") as string;

    try {
      await adminLogin(username, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="login-body">
      <div className="login-card card">
        <span className="login-emoji">🔐</span>
        <h1>Admin sign in</h1>
        <p className="muted">Manage books, libraries, and borrow requests.</p>

        <form id="login-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="error" id="login-error">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary full">
            Sign in
          </button>
        </form>
        <Link href="/" className="back-link">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
