interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export async function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 px-6 py-5 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-5xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
          {subtitle ? <p className="max-w-2xl text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  );
}
