import { CreditCard, Globe2, PlugZap, ShieldCheck, UserRound } from "lucide-react";
import type { AuthUser } from "../lib/auth";

interface SettingsPageProps {
  user?: AuthUser | null;
}

const integrations = [
  {
    platform: "YouTube",
    status: "Connected",
    description: "Views, watch time, subscribers, demographic maps, CTR, and Shorts velocity.",
    tone: "bg-red-50 text-red-700 border-red-100",
  },
  {
    platform: "TikTok",
    status: "Connect",
    description: "Video views, follower analytics, trending audio, and real-time engagement rates.",
    tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    platform: "Instagram",
    status: "Connect",
    description: "Reach, impressions, follower demographics, Reels, and story engagement.",
    tone: "bg-purple-50 text-purple-700 border-purple-100",
  },
];

const invoices = [
  { id: "INV-1042", date: "May 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-1018", date: "Apr 1, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-0994", date: "Mar 1, 2026", amount: "$19.00", status: "Paid" },
];

export default function SettingsPage({ user }: SettingsPageProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-6 lg:px-8">
      <header className="rounded-[2rem] bg-zinc-950 p-8 text-white shadow-glow">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Settings</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Account, integrations, and billing</h1>
            <p className="mt-3 max-w-3xl text-zinc-300">
              Manage profile preferences, OAuth connections, Stripe subscriptions, payment methods, and invoice history from one operational panel.
            </p>
          </div>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Pro Creator trial
          </span>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)]">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><UserRound /></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Profile</p>
              <h2 className="text-2xl font-black text-zinc-950">Creator identity</h2>
            </div>
          </div>

          <form className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-zinc-700">
              Name
              <input className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" defaultValue={user?.name ?? "Creator"} />
            </label>
            <label className="block text-sm font-bold text-zinc-700">
              Email
              <input className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" defaultValue={user?.email ?? "creator@creatorscope.app"} />
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
            <button type="button" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/10">
              Save profile
            </button>
          </form>
        </article>

        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)]">
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
                <p className="mt-3 min-h-24 text-sm leading-6 opacity-80">{integration.description}</p>
                <button type="button" className="mt-4 w-full rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">
                  {integration.status}
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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
              <button type="button" className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-zinc-950">Update payment method</button>
              <button type="button" className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white">Open customer portal</button>
              <button type="button" className="rounded-full border border-rose-300/25 px-5 py-3 text-sm font-black text-rose-200">Cancel plan</button>
            </div>
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
