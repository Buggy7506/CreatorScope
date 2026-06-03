import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CreditCard, Globe2, PlugZap, ShieldCheck, UserRound } from "lucide-react";
import type { AuthUser } from "../lib/auth";
import { apiBaseUrl } from "../lib/api";

type SettingsSection = "profile" | "integrations" | "billing" | "settings";

type ProfileForm = {
  name: string;
  email: string;
  niche: string;
  timezone: string;
};

interface SettingsPageProps {
  section?: SettingsSection;
  user?: AuthUser | null;
}

const PROFILE_KEY = "creatorscope_profile_preferences";
const BILLING_MESSAGE_KEY = "creatorscope_billing_message";

const getSavedProfile = (user?: AuthUser | null): ProfileForm => {
  const fallback = {
    name: user?.name ?? "Creator",
    email: user?.email ?? "creator@creatorscope.app",
    niche: "Short-form education, lifestyle, and brand partnerships",
    timezone: "America/New_York",
  };

  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
  } catch {
    return fallback;
  }
};

const integrations = [
  {
    platform: "YouTube",
    status: "Connect YouTube",
    href: `${apiBaseUrl}/connect/youtube`,
    description: "OAuth channel stats, videos, snapshots, watch time, subscribers, CTR, Shorts velocity, and revenue-ready ingestion.",
    tone: "bg-red-50 text-red-700 border-red-100",
  },
  {
    platform: "TikTok",
    status: "Prepare TikTok sync",
    href: `${apiBaseUrl}/connect/tiktok`,
    description: "Video views, follower analytics, completion rate, trending audio, profile actions, and engagement-rate workspaces.",
    tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    platform: "Instagram",
    status: "Prepare Instagram sync",
    href: `${apiBaseUrl}/connect/instagram`,
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

export default function SettingsPage({ section = "settings", user }: SettingsPageProps) {
  const [profileSaved, setProfileSaved] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(() => getSavedProfile(user));
  const [billingMessage, setBillingMessage] = useState(() => localStorage.getItem(BILLING_MESSAGE_KEY) ?? "Stripe customer portal is ready to be wired to live Stripe keys.");
  
  const showProfile = section === "profile" || section === "settings";
  const showIntegrations = section === "integrations" || section === "settings";
  const showSettings = section === "settings";
  const showBilling = section === "billing" || section === "settings";
  
  const sectionTitle = useMemo(() => {
    if (section === "profile") return "Profile";
    if (section === "integrations") return "Integrations";
    if (section === "billing") return "Billing";
    return "Settings";
  }, [section]);

  useEffect(() => {
    localStorage.setItem(BILLING_MESSAGE_KEY, billingMessage);
  }, [billingMessage]);

  useEffect(() => {
    document.getElementById(section)?.scrollIntoView({ block: "start" });
  }, [section]);

  const handleProfileChange = (key: keyof ProfileForm, value: string) => {
    setProfileSaved(false);
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem("creatorscope_user", JSON.stringify({ name: profile.name, email: profile.email }));
    setProfileSaved(true);
  };

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

      {showProfile || showIntegrations ? (
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {showProfile ? (
        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)] scroll-mt-8" id="profile">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><UserRound /></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Profile</p>
              <h2 className="text-2xl font-black text-zinc-950">Creator identity</h2>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleProfileSubmit}>
            <label className="block text-sm font-bold text-zinc-700">
              Name
              <input className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" value={profile.name} onChange={(event) => handleProfileChange("name", event.target.value)} />
            </label>
            <label className="block text-sm font-bold text-zinc-700">
              Email
              <input className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" value={profile.email} onChange={(event) => handleProfileChange("email", event.target.value)} />
            </label>
            <label className="block text-sm font-bold text-zinc-700">
              Creator niche
              <input className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" value={profile.niche} onChange={(event) => handleProfileChange("niche", event.target.value)} />
            </label>
            <label className="block text-sm font-bold text-zinc-700">
              Timezone
              <select className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-emerald-500" value={profile.timezone} onChange={(event) => handleProfileChange("timezone", event.target.value)}>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="UTC">UTC</option>
              </select>
            </label>
            <button type="submit" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/10">
              Save profile
            </button>
            {profileSaved ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Profile preferences saved locally and will stay after refresh.</p> : null}
          </form>
        </article>
        ) : null}

        {showIntegrations ? (
        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)] scroll-mt-8" id="integrations">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><PlugZap /></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">API & OAuth</p>
              <h2 className="text-2xl font-black text-zinc-950">Connected integrations</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {integrations.map((integration) => (
              <div key={integration.platform} className={`rounded-3xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${integration.tone}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-lg font-black">{integration.platform}</h3>
                  <Globe2 size={24} className="opacity-80" />
                </div>
                <p className="mt-4 min-h-28 text-sm leading-6 font-medium opacity-90">{integration.description}</p>
                <a href={integration.href} className="mt-5 block text-center rounded-2xl bg-white/80 hover:bg-white px-4 py-3 text-sm font-black shadow-md transition-all duration-150">
                  {integration.status}
                </a>
              </div>
            ))}
          </div>
        </article>
        ) : null}
      </section>
      ) : null}

      {showSettings ? (
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
      ) : null}

      {showBilling ? (
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
      ) : null}
    </div>
  );
}
