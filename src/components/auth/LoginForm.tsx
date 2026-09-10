"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/auth/useLogin";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login.mutateAsync({
        email,
        password,
      });

      router.replace("/");
      router.refresh();
    } catch {
      // Error is displayed below
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-indigo-400" />
          <span>Work Email</span>
        </label>
        <input
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-hidden font-medium"
          required
        />
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-indigo-400" />
          <span>Password</span>
        </label>
        <input
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-hidden font-medium"
          required
        />
      </div>

      {login.isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-semibold text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>
            {login.error instanceof Error ? login.error.message : "Invalid email or password credentials."}
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={login.isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
      >
        <LogIn className="h-4 w-4" />
        <span>{login.isPending ? "Authenticating Session..." : "Sign In to Executive Console"}</span>
      </button>
    </form>
  );
}