import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { Sparkles, ShieldCheck } from "lucide-react";

export function LoginCard() {
  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl p-8 backdrop-blur-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/35 ring-4 ring-indigo-500/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight pt-2">
            Splinci Executive Console
          </h1>

          <p className="text-xs text-slate-400 font-medium">
            Splinci Commerce OS — Enterprise Autonomous AI ERP Platform
          </p>
        </div>

        <LoginForm />

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>256-Bit SSL Enterprise Encrypted Auth Session</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}