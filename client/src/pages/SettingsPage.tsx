import { useEffect, useMemo, useState } from "react";
import { CreditCard, Globe2, PlugZap, ShieldCheck, UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import type { AuthUser } from "../lib/auth";

interface SettingsPageProps {
  user?: AuthUser | null;
}

const integrations = [
  {
    platform: "YouTube",
    status: "Connect YouTube",
    href: "/api/v1/connect/youtube",
    description: "OAuth channel stats, videos, snapshots, watch time, subscribers, CTR, Shorts velocity, and revenue-ready ingestion.",
    tone: "bg-red-50 text-red-700 border-red-100",
  },
  {
    platform: "TikTok",
    status: "Prepare TikTok sync",
    href: "/api/v1/connect/tiktok",
    description: "Video views, follower analytics, completion rate, trending audio, profile actions, and engagement-rate workspaces.",
    tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    platform: "Instagram",
    status: "Prepare Instagram sync",
    href: "/api/v1/connect/instagram",
    description: "Reach, impressions, follower demographics, Reels plays, saves, story taps, and content performance history.",
    tone: "bg-purple-50 text-purple-700 border-purple-100",
  },
];

const invoices = [
  { id: "INV-1042", date: "May 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-1018", date: "Apr 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-0994", date: "Mar 1, 2026", amount: "$19.00", status: "Paid" },
];

const operationalSettings = [
  {
    title: "Workspace notifications",
    detail: "Alert routing for viral uploads, stale OAuth tokens, billing issues, unusual RPM movement, and failed sync jobs.",
    controls: ["Email digests", "In-app alerts", "Weekly executive summary"],
  },
  {
    title: "Security & access",
    detail: "Session controls, export permissions, least-privilege collaborator access, and workspace audit readiness.",
    controls: ["Session review", "Role templates", "Data export approval"],
  },
  {
    title: "Data governance",
    detail: "Retention windows, creator profile enrichment, platform consent tracking, and warehouse sync policies.",
    controls: ["Retention policy", "PII minimization", "Sync frequency"],
  },
];

export default function SettingsPage({ user }: SettingsPageProps) {
  const location = useLocation();
  const section = new URLSearchParams(location.search).get("section") ?? "settings";
  const [profileSaved, setProfileSaved] = useState(false);
  const [billingMessage, setBillingMessage] = useState("Stripe customer portal is ready to be wired to live Stripe keys.");
  const sectionTitle = useMemo(() => {
    if (section === "profile") return "Profile";
    if (section === "integrations") return "Integrations";
    if (section === "billing") return "Billing";
    return "Settings";
  }, [section]);

  useEffect(() => {
    document.getElementById(section)?.scrollIntoView({ block: "start" });
  }, [section]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-6 lg:px-8">
      <header className="rounded-[2rem] bg-zinc-950 p-8 text-white shadow-glow">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">{sectionTitle}</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Account, profile, integrations, and billing</h1>
            <p className="mt-3 max-w-3xl text-zinc-300">
              Manage creator identity, OAuth connections, TikTok and Instagram analytics readiness, Stripe subscriptions, payment methods, invoice history, and notification preferences.
            </p>
          </div>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Pro Creator trial
          </span>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)] scroll-mt-8" id="profile">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><UserRound /></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Profile</p>
              <h2 className="text-2xl font-black text-zinc-950">Creator identity</h2>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); setProfileSaved(true); }}>
            <label className="block text-sm font-bold text-zinc-700">
              Name
              <input className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" defaultValue={user?.name ?? "Creator"} />
            </label>
            <label className="block text-sm font-bold text-zinc-700">
              Email
              <input className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" defaultValue={user?.email ?? "creator@creatorscope.app"} />
            </label>
            <label className="block text-sm font-bold text-zinc-700">
              Creator niche
              <input className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" defaultValue="Short-form education, lifestyle, and brand partnerships" />
            </label>
            <label className="block text-sm font-bold text-zinc-700">
              Timezone
              <select className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" defaultValue="America/New_York">
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="UTC">UTC</option>
              </select>
            </label>
            <button type="submit" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/10">
              Save profile
            </button>
            {profileSaved ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Profile preferences saved locally for this workspace session.</p> : null}
          </form>
        </article>

        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)] scroll-mt-8" id="integrations">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><PlugZap /></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">API & OAuth</p>
              <h2 className="text-2xl font-black text-zinc-950">Connected integrations</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {integrations.map((integration) => (
              <div key={integration.platform} className={`rounded-3xl border p-5 ${integration.tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-black">{integration.platform}</h3>
                  <Globe2 size={19} />
                </div>
                <p className="mt-3 min-h-32 text-sm leading-6 opacity-80">{integration.description}</p>
                <a href={integration.href} className="mt-4 inline-flex w-full justify-center rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">
                  {integration.status}
                </a>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)] scroll-mt-8" id="settings">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><ShieldCheck /></span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Settings</p>
            <h2 className="text-2xl font-black text-zinc-950">Workspace operations</h2>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
          Configure the professional operating layer behind CreatorScope: notifications, access control, exports, data retention, and sync behavior for serious creator teams.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {operationalSettings.map((item) => (
            <article key={item.title} className="rounded-3xl border border-emerald-900/10 bg-white p-5">
              <h3 className="text-lg font-black text-zinc-950">{item.title}</h3>
              <p className="mt-3 min-h-24 text-sm leading-6 text-zinc-600">{item.detail}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.controls.map((control) => (
                  <span key={control} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {control}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] scroll-mt-8" id="billing">
        <article className="rounded-[2rem] bg-zinc-950 p-6 text-white shadow-glow">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-white/10 p-3 text-lime-300"><CreditCard /></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Billing</p>
              <h2 className="text-2xl font-black">Stripe subscription</h2>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Current plan</p>
                <p className="mt-2 text-3xl font-black">Pro Creator</p>
                <p className="mt-1 text-zinc-300">$49/month · renews July 1, 2026</p>
              </div>
              <ShieldCheck className="text-emerald-300" size={38} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setBillingMessage("Payment method update queued for Stripe checkout.")} className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-zinc-950">Update payment method</button>
              <button type="button" onClick={() => setBillingMessage("Customer portal launch requested. Add live Stripe portal URL in production.")} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white">Open customer portal</button>
              <button type="button" onClick={() => setBillingMessage("Cancellation request staged. Confirm cancellation in Stripe before changing subscription status.")} className="rounded-full border border-rose-300/25 px-5 py-3 text-sm font-black text-rose-200">Cancel plan</button>
            </div>
            <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-zinc-200">{billingMessage}</p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)]">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Invoice history</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950">Recent invoices</h2>
          <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-900/10">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-4 gap-3 border-b border-emerald-900/10 bg-white px-5 py-4 text-sm last:border-b-0">
                <span className="font-black text-zinc-950">{invoice.id}</span>
                <span className="text-zinc-600">{invoice.date}</span>
                <span className="font-bold text-zinc-900">{invoice.amount}</span>
                <span className="text-right font-bold text-emerald-700">{invoice.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
