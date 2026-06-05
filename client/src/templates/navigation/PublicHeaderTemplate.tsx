import { Link } from "react-router-dom";

export const publicHeaderLinks = [
  { label: "Home", href: "/#home" },
  { label: "Features", href: "/features#features" },
  { label: "Analytics", href: "/analytics#analytics" },
  { label: "Integrations", href: "/integrations#integrations" },
  { label: "Pricing", href: "/pricing#pricing" },
];

type PublicHeaderTemplateProps = {
  variant?: "landing" | "auth";
};

const PublicHeaderTemplate = ({ variant = "landing" }: PublicHeaderTemplateProps) => {
  const isAuth = variant === "auth";

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="CreatorScope home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 font-black text-zinc-950 shadow-lg shadow-emerald-500/20">
            CS
          </span>
          <span>
            <span className="block text-sm font-black uppercase tracking-[0.24em] text-emerald-300">CreatorScope</span>
            <span className="block text-xs text-zinc-400">Creator operating system</span>
          </span>
        </Link>

        {!isAuth ? (
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-zinc-200 md:flex" aria-label="Public navigation">
            {publicHeaderLinks.map((link) => (
              <a key={link.label} href={link.href} className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          {isAuth ? (
            <Link to="/" className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-300">
              Back home
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-300">
                Sign in
              </Link>
              <Link to="/login" className="hidden rounded-full bg-emerald-400 px-4 py-2 text-sm font-black text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 sm:inline-flex">
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeaderTemplate;
