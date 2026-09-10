type Props = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Blurs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </main>
  );
}