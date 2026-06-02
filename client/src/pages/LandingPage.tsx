import { Link } from 'react-router-dom';

const publicNav = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'Pricing', href: '#pricing' },
];

const features = [
  {
    title: 'AI Trend Telemetry',
    description: 'Decode which sounds, topics, and formats are heating up across TikTok, YouTube, and Instagram in real time.',
  },
  {
    title: 'Viral Pulse Predictor',
    description: 'See which posts are most likely to blow up before you publish with momentum scoring and recommendation signals.',
  },
  {
    title: 'Creator DNA Heatmap',
    description: 'Visualize your strongest posting moments by weekday, hour, and content format so every upload lands at peak velocity.',
  },
  {
    title: 'Revenue Tracking',
    description: 'Monitor earnings, brand deals, and channel payouts across platforms with a simple growth dashboard.',
  },
  {
    title: 'Agency Package System',
    description: 'Sell creator services, sponsorship bundles, and managed packages from one platform-ready offering.',
  },
  {
    title: 'AI Caption Generator',
    description: 'Create keyword-rich captions and hooks fast so every post lands with improved reach and engagement.',
  },
];

const LandingPage = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3 text-white no-underline">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 font-black text-zinc-950 shadow-lg shadow-emerald-500/20">CS</span>
          <span>
            <span className="block text-lg font-black">CreatorScope</span>
            <span className="block text-xs uppercase tracking-[0.22em] text-emerald-200">Creator OS</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-zinc-950/60 p-1 text-sm text-zinc-200 backdrop-blur md:flex" aria-label="Public navigation">
          {publicNav.map((item) => (
            <a key={item.label} href={item.href} className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-300">Sign in</Link>
          <Link to="/login" className="hidden rounded-full bg-emerald-400 px-4 py-2 text-sm font-black text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 sm:inline-flex">Start free</Link>
        </div>
      </header>

      <section id="home" className="relative mx-auto max-w-7xl px-5 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-8 shadow-glow backdrop-blur-xl sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
                Creator automation styled for flow
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                CreatorScope — the only dashboard that turns TikTok, YouTube, and Instagram growth into one revenue automation engine.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Launch a premium website and analytics app that creators can use today. CreatorScope turns raw engagement into strategy, timing, and viral content signals you can act on instantly.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-base font-semibold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300">
                  Open the dashboard
                </Link>
                <a href="#pricing" className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/80 px-6 py-3 text-base text-zinc-200 transition hover:border-emerald-400 hover:text-white">
                  See pricing
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-6 shadow-xl shadow-emerald-500/10 ring-1 ring-white/5 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">30-day free trial</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Try the app risk-free for a month.</h3>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-300">Starter ready</span>
              </div>
              <div className="space-y-4 text-sm text-zinc-300">
                <p>One dashboard for TikTok, YouTube, Instagram</p>
                <p>AI-powered creator strategy, timing, and viral signals</p>
                <p>Live analytics view, heatmaps, top content, and growth alerts</p>
              </div>
              <div className="mt-8 rounded-3xl bg-zinc-900/90 p-5 shadow-inner shadow-zinc-950/40">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-zinc-950/60 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Live Reach</p>
                    <p className="mt-3 text-3xl font-semibold text-white">1.8M</p>
                    <p className="mt-2 text-sm text-zinc-400">Combined TikTok + Instagram</p>
                  </div>
                  <div className="rounded-3xl bg-zinc-950/60 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Watch Hours</p>
                    <p className="mt-3 text-3xl font-semibold text-white">48K</p>
                    <p className="mt-2 text-sm text-zinc-400">YouTube review insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-6 lg:px-8" id="analytics">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">CreatorScope compatible analytics</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">Overview, audience, content history, revenue, integrations, billing, settings, and profile are built into one signed-in workspace.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {['TikTok analytics', 'Instagram analytics', 'YouTube snapshots', 'Revenue cockpit'].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm font-semibold text-zinc-200">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8" id="features">
        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-emerald-500/5 transition hover:border-emerald-400/20 hover:bg-zinc-900/90">
              <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8" id="integrations">
        <div className="grid gap-6 md:grid-cols-3">
          {['YouTube OAuth + channel stats', 'TikTok creator analytics workspace', 'Instagram insights workspace'].map((item) => (
            <div key={item} className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-6 text-zinc-200">
              <h2 className="text-xl font-semibold text-white">{item}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Connect accounts, verify scopes, track sync health, and route metrics into CreatorScope dashboards.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8" id="pricing">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Launch-ready creator product</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              More than a landing page. Become a creator platform with analytics that actually moves the needle.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              Build a website and app experience for creators who want premium growth intelligence and cross-platform momentum. The dashboard is ready, the site is ready, and the next step is to connect real API data.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-glow">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">CreatorScope Plans</p>
                <p className="mt-4 text-4xl font-semibold text-white">Starter + Pro</p>
                <p className="mt-2 text-zinc-400">Perfect for new creators and mid-tier growth teams.</p>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/90 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Starter</p>
                  <p className="mt-4 text-4xl font-semibold text-white">$19 / mo</p>
                  <p className="mt-2 text-zinc-400">Best for new creators and launch bundles.</p>
                  <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                    <li>✔ 30-day free trial</li>
                    <li>✔ TikTok, YouTube, Instagram basics</li>
                    <li>✔ Starter revenue tracking</li>
                  </ul>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-zinc-900/90 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Pro Creator</p>
                  <p className="mt-4 text-4xl font-semibold text-white">$49 / mo</p>
                  <p className="mt-2 text-zinc-400">Perfect for mid-tier creators with 10K–500K followers.</p>
                  <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                    <li>✔ All analytics, revenue, and agency package support</li>
                    <li>✔ AI caption suggestions and viral insights</li>
                    <li>✔ Stripe billing and subscription management</li>
                  </ul>
                </div>
              </div>
              <Link to="/login" className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-base font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300">
                Start the demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
