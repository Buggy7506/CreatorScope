import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PublicHeaderTemplate from "../templates/navigation/PublicHeaderTemplate";

const publicNav = [
  { label: "Home", path: "/", section: "home" },
  { label: "Features", path: "/features", section: "features" },
  { label: "Analytics", path: "/analytics", section: "analytics" },
  { label: "Integrations", path: "/integrations", section: "integrations" },
  { label: "Pricing", path: "/pricing", section: "pricing" },
];

const features = [
  "Unified TikTok, YouTube, and Instagram analytics",
  "Real-data dashboards with empty states instead of fake metrics",
  "Creator profile, billing, and integration controls that persist locally",
  "AI-ready growth insights for captions, timing, cohorts, and revenue",
];

const metrics = [
  { label: "Platforms", value: "3", detail: "YouTube, TikTok, Instagram" },
  { label: "Workspace areas", value: "7", detail: "Dashboard through billing" },
  { label: "Trial", value: "30 days", detail: "Starter access before upgrade" },
];

const integrations = [
  "YouTube OAuth and channel snapshots",
  "TikTok analytics sync workspace",
  "Instagram insights sync workspace",
];

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    const match = publicNav.find((item) => item.path === location.pathname);
    document.getElementById(match?.section ?? "home")?.scrollIntoView({ block: "start" });
  }, [location.pathname]);

  return (
    <div className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent" />
      <PublicHeaderTemplate />

      <main className="relative z-10 pt-24">
        <section id="home" className="mx-auto max-w-7xl px-5 pb-16 pt-6 scroll-mt-28 sm:px-6 lg:px-8">
          <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-zinc-900/70 p-8 shadow-glow backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr] lg:items-center sm:p-12">
            <div>
              <p className="inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
                Creator analytics without clutter
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
                One clean operating system for creator growth, content, and revenue.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                CreatorScope brings cross-platform analytics, workspace settings, integrations, and billing into a focused product that stays available until a visitor chooses to sign in.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-base font-semibold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300">
                  Open dashboard
                </Link>
                <Link to="/pricing" className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/80 px-6 py-3 text-base text-zinc-200 transition hover:border-emerald-400 hover:text-white">
                  View plans
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-xl shadow-emerald-500/10 ring-1 ring-white/5">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Workspace snapshot</p>
              <div className="mt-6 grid gap-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-sm text-zinc-400">{metric.label}</p>
                    <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
                    <p className="mt-1 text-sm text-zinc-400">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-12 scroll-mt-28 sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Features</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Everything important, nothing repeated.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 text-zinc-200">
                {feature}
              </div>
            ))}
          </div>
        </section>

        <section id="analytics" className="mx-auto max-w-7xl px-5 py-12 scroll-mt-28 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Analytics</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Real data first.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
              The signed-in dashboard keeps analytics honest by showing connected metrics when available and clear empty states when data is not connected yet.
            </p>
          </div>
        </section>

        <section id="integrations" className="mx-auto max-w-7xl px-5 py-12 scroll-mt-28 sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Integrations</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {integrations.map((item) => (
              <div key={item} className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-6 text-zinc-200">
                <h2 className="text-xl font-semibold text-white">{item}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">Connect accounts, track sync health, and route metrics into CreatorScope dashboards.</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 py-16 scroll-mt-28 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              ["Starter", "$19 / mo", "Best for new creators validating cross-platform growth."],
              ["Pro Creator", "$49 / mo", "For creators who need analytics, revenue tracking, and AI-ready workflows."],
            ].map(([plan, price, detail]) => (
              <article key={plan} className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-8">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">{plan}</p>
                <h2 className="mt-4 text-4xl font-semibold">{price}</h2>
                <p className="mt-3 text-zinc-300">{detail}</p>
                <Link to="/login" className="mt-6 inline-flex rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-300">
                  Start free
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
