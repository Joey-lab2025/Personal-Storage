"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("请输入邮箱和密码");
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw error;
      }

      router.push("/admin");
      router.refresh();

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f5f1]">

      <div className="w-full max-w-md px-8">

        <h1 className="text-5xl mb-10">
          Admin Login
        </h1>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              border
              p-4
              w-full
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
              border
              p-4
              w-full
            "
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="
              border
              p-4
              w-full
              hover:bg-black
              hover:text-white
            "
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>

        </div>

      </div>

    </main>
  );
}