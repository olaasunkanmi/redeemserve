import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, X, Check, CalendarDays, Plus, Trash2, LogOut, Lock } from "lucide-react";

const ADMIN_EMAIL = "purebliss572@gmail.com";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — RedeemServe" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setIsAdmin(null); return; }
    if (session.user.email !== ADMIN_EMAIL) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [session?.user?.id]);

  if (checking) return <SiteLayout><div className="p-20 text-center text-emerald-deep/60">Loading…</div></SiteLayout>;
  if (!session) return <AdminLogin />;
  if (session.user.email !== ADMIN_EMAIL || isAdmin === false) return <AccessDenied />;
  if (isAdmin === null) return <SiteLayout><div className="p-20 text-center text-emerald-deep/60">Verifying access…</div></SiteLayout>;
  return <AdminDashboard />;
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setLoading(false); setErr("Access restricted to the platform admin."); return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-8 shadow-card">
          <div className="flex items-center gap-2 text-gold"><Lock className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-wider">Admin portal</span></div>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-emerald-deep">Platform admin sign in</h1>
          <p className="mt-1 text-sm text-emerald-deep/60">Restricted access — authorized administrator only.</p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input autoFocus type="email" required placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-emerald-deep/15 bg-cream px-3 py-2.5 text-sm" />
            <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-emerald-deep/15 bg-cream px-3 py-2.5 text-sm" />
            {err && <p className="text-xs text-rose-600">{err}</p>}
            <button disabled={loading} className="w-full rounded-full bg-emerald-deep px-5 py-3 text-sm font-semibold text-cream disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}

function AccessDenied() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl p-20 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-emerald-deep/30" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-emerald-deep">Admins only</h1>
        <p className="mt-2 text-sm text-emerald-deep/60">This account doesn't have admin permissions.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 inline-flex rounded-full bg-emerald-deep px-5 py-3 text-sm font-semibold text-cream">Sign out</button>
      </div>
    </SiteLayout>
  );
}

function AdminDashboard() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [rev, setRev] = useState({ gross: 0, commission: 0, count: 0, subs: 0 });
  const [counts, setCounts] = useState({ users: 0, orders: 0, products: 0, reviews: 0 });
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<any[]>([]);

  async function reloadAll() {
    const [{ data: vs }, { data: os }, { count: uc }, { count: pc }, { count: rc }, { data: ro }] = await Promise.all([
      supabase.from("vendors").select("*").order("created_at", { ascending: false }),
      supabase.from("orders" as any).select("subtotal_naira,commission_naira,total_naira,status"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("products" as any).select("id", { count: "exact", head: true }),
      supabase.from("reviews" as any).select("id", { count: "exact", head: true }),
      supabase.from("orders" as any).select("id,tracking_code,status,total_naira,fulfillment_type,created_at,vendor_id,vendors(business_name)").order("created_at", { ascending: false }).limit(10),
    ]);
    setVendors(vs ?? []);
    const rows = (os as any[]) ?? [];
    const subs = (vs ?? []).reduce((s: number, v: any) => s + (v.plan === "premium" ? 15000 : v.plan === "pro" ? 5000 : 0), 0);
    const active = rows.filter(r => r.status !== "cancelled");
    setRev({
      gross: active.reduce((s, r) => s + Number(r.subtotal_naira || 0), 0),
      commission: active.reduce((s, r) => s + Number(r.commission_naira || 0), 0),
      count: active.length, subs,
    });
    const map: Record<string, number> = {};
    rows.forEach(r => { map[r.status] = (map[r.status] || 0) + 1; });
    setByStatus(map);
    setCounts({ users: uc ?? 0, orders: rows.length, products: pc ?? 0, reviews: rc ?? 0 });
    setRecent((ro as any[]) ?? []);
  }

  useEffect(() => { reloadAll(); }, []);

  async function verify(id: string, val: boolean) {
    await supabase.from("vendors").update({ verified: val }).eq("id", id);
    setVendors((vs) => vs.map((v) => v.id === id ? { ...v, verified: val } : v));
  }

  async function setPlan(id: string, plan: string) {
    await supabase.from("vendors").update({ plan }).eq("id", id);
    setVendors((vs) => vs.map((v) => v.id === id ? { ...v, plan } : v));
  }

  async function deleteVendor(id: string) {
    if (!confirm("Delete this vendor and all its products? This cannot be undone.")) return;
    await supabase.from("vendors").delete().eq("id", id);
    setVendors((vs) => vs.filter((v) => v.id !== id));
  }

  const statusLabels: Record<string, string> = {
    pending: "Pending", accepted: "Accepted", preparing: "Preparing", ready: "Ready",
    out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled",
  };

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-emerald-deep text-cream">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-10 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">Admin portal</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Platform control</h1>
            <p className="mt-1 text-sm text-cream/70">{vendors.length} vendors · {counts.users} users · {counts.orders} orders</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-4 py-2 text-xs font-semibold text-cream hover:bg-cream/10"><LogOut className="h-3.5 w-3.5"/>Sign out</button>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["Gross GMV", `₦${rev.gross.toLocaleString()}`, `${rev.count} paid orders`],
            ["Commission revenue", `₦${rev.commission.toLocaleString()}`, "from orders"],
            ["Subscription MRR", `₦${rev.subs.toLocaleString()}`, "vendor plans"],
            ["Platform run-rate", `₦${(rev.commission + rev.subs).toLocaleString()}`, "monthly total"],
          ].map(([l, v, s]) => (
            <div key={l} className="rounded-2xl border border-emerald-deep/10 bg-surface p-5 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-deep/60">{l}</p>
              <p className="mt-2 font-display text-2xl font-extrabold text-emerald-deep tabular">{v}</p>
              <p className="mt-1 text-[11px] text-emerald-deep/55">{s}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          {[
            ["Total users", counts.users],
            ["Vendors", vendors.length],
            ["Products listed", counts.products],
            ["Reviews", counts.reviews],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-2xl border border-emerald-deep/10 bg-cream p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-deep/60">{l}</p>
              <p className="mt-2 font-display text-2xl font-extrabold text-emerald-deep tabular">{(v as number).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {Object.keys(byStatus).length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-deep/10 bg-surface p-5 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-deep/60">Orders by status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(byStatus).map(([k, v]) => (
                <span key={k} className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald-deep">{statusLabels[k] || k}: {v}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-8">
        <h2 className="font-display text-xl font-extrabold text-emerald-deep">Recent orders</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-deep/10 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-emerald-soft/50 text-left text-xs uppercase tracking-wider text-emerald-deep">
              <tr><th className="px-4 py-3">Tracking</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">When</th></tr>
            </thead>
            <tbody>
              {recent.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-emerald-deep/50">No orders yet.</td></tr>}
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-emerald-deep/10">
                  <td className="px-4 py-3 font-mono text-xs text-emerald-deep">{o.tracking_code || "—"}</td>
                  <td className="px-4 py-3 text-emerald-deep">{o.vendors?.business_name || "—"}</td>
                  <td className="px-4 py-3 text-emerald-deep/70">{o.fulfillment_type || "—"}</td>
                  <td className="px-4 py-3 text-emerald-deep/70">{statusLabels[o.status] || o.status}</td>
                  <td className="px-4 py-3 tabular text-emerald-deep">₦{Number(o.total_naira || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-deep/55">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
        <h2 className="font-display text-xl font-extrabold text-emerald-deep">Vendor management</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-deep/10 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-emerald-soft/50 text-left text-xs uppercase tracking-wider text-emerald-deep">
              <tr><th className="px-4 py-3">Business</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Zone</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Verified</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t border-emerald-deep/10">
                  <td className="px-4 py-3 font-semibold text-emerald-deep">{v.business_name}</td>
                  <td className="px-4 py-3 text-emerald-deep/70">{v.category}</td>
                  <td className="px-4 py-3 text-emerald-deep/70">Zone {v.zone}</td>
                  <td className="px-4 py-3">
                    <select value={v.plan ?? "free"} onChange={(e) => setPlan(v.id, e.target.value)} className="rounded-full border border-emerald-deep/15 bg-cream px-2 py-0.5 text-[11px] font-semibold">
                      {["free", "pro", "premium"].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-emerald-deep/70">{v.status}</td>
                  <td className="px-4 py-3">{v.verified ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"><ShieldCheck className="h-3 w-3"/>Yes</span> : <span className="text-emerald-deep/40">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {v.verified ? (
                        <button onClick={() => verify(v.id, false)} className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1 text-[11px] text-rose-600"><X className="h-3 w-3"/>Revoke</button>
                      ) : (
                        <button onClick={() => verify(v.id, true)} className="inline-flex items-center gap-1 rounded-full bg-emerald-deep px-3 py-1 text-[11px] text-cream"><Check className="h-3 w-3"/>Verify</button>
                      )}
                      <button onClick={() => deleteVendor(v.id)} className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1 text-[11px] text-rose-600"><Trash2 className="h-3 w-3"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <KycQueue vendors={vendors} reload={reloadAll} />
      <EventsManager />
    </SiteLayout>
  );
}

function EventsManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "", description: "", starts_at: "", ends_at: "",
    location: "Redemption City", expected_attendance: "", category: "Service", prep_tips: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("events" as any).select("*").order("starts_at", { ascending: true });
    setEvents((data as any) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setSaving(true);
    if (!form.name.trim() || !form.starts_at) { setErr("Name and start date are required."); setSaving(false); return; }
    const payload: any = {
      name: form.name.trim(), description: form.description || null,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      location: form.location || null,
      expected_attendance: form.expected_attendance ? parseInt(form.expected_attendance, 10) : null,
      category: form.category || "Service", prep_tips: form.prep_tips || null,
    };
    const { error } = await supabase.from("events" as any).insert(payload);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setForm({ name: "", description: "", starts_at: "", ends_at: "", location: "Redemption City", expected_attendance: "", category: "Service", prep_tips: "" });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events" as any).delete().eq("id", id);
    load();
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-8">
      <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gold" />
          <h2 className="font-display text-xl font-extrabold text-emerald-deep">Upcoming events</h2>
        </div>
        <p className="text-xs text-emerald-deep/60">Vendors see these on their dashboard so they can prepare ahead.</p>

        <form onSubmit={add} className="mt-6 grid gap-3 rounded-xl border border-emerald-deep/10 bg-cream p-4 sm:grid-cols-2">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Event name" className="rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-sm sm:col-span-2" />
          <input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-sm" />
          <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} placeholder="Ends" className="rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-sm" />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-sm" />
          <input type="number" min="0" value={form.expected_attendance} onChange={(e) => setForm({ ...form, expected_attendance: e.target.value })} placeholder="Expected attendance" className="rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-sm sm:col-span-2">
            {["Holy Ghost Service", "Convention", "Youth Convention", "Service", "Crusade", "Workshop"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" rows={2} className="rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-sm sm:col-span-2" />
          <textarea value={form.prep_tips} onChange={(e) => setForm({ ...form, prep_tips: e.target.value })} placeholder="Prep tips for vendors (e.g. stock 2× capacity)" rows={2} className="rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-sm sm:col-span-2" />
          {err && <p className="text-xs text-rose-600 sm:col-span-2">{err}</p>}
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-deep px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50 sm:col-span-2"><Plus className="h-4 w-4"/> {saving ? "Adding…" : "Add event"}</button>
        </form>

        {events.length > 0 && (
          <ul className="mt-6 divide-y divide-emerald-deep/10">
            {events.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-emerald-deep">{e.name} <span className="ml-2 text-[11px] font-normal text-emerald-deep/60">{e.category}</span></p>
                  <p className="text-xs text-emerald-deep/60">{new Date(e.starts_at).toLocaleString()} · {e.location} {e.expected_attendance ? `· ${e.expected_attendance.toLocaleString()}+ attendees` : ""}</p>
                </div>
                <button onClick={() => remove(e.id)} className="rounded-full border border-rose-300 px-3 py-1 text-[11px] font-semibold text-rose-600"><Trash2 className="inline h-3 w-3"/> Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function KycQueue({ vendors, reload }: { vendors: any[]; reload: () => void }) {
  const pending = vendors.filter((v) => v.kyc_status === "pending");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const map: Record<string, string> = {};
      for (const v of pending) {
        if (!v.kyc_doc_path) continue;
        const { data } = await supabase.storage.from("kyc-documents").createSignedUrl(v.kyc_doc_path, 600);
        if (data?.signedUrl) map[v.id] = data.signedUrl;
      }
      setUrls(map);
    })();
  }, [pending.length]);

  async function decide(id: string, status: "approved" | "rejected") {
    await supabase.rpc("admin_set_kyc" as any, { _vendor_id: id, _status: status, _notes: notes[id] || null });
    reload();
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-8">
      <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-emerald-deep">KYC review queue</h2>
        <p className="text-xs text-emerald-deep/60">{pending.length} document(s) awaiting review</p>
        {pending.length === 0 ? (
          <p className="mt-6 text-sm text-emerald-deep/55">All clear — no pending documents.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {pending.map((v) => (
              <div key={v.id} className="rounded-xl border border-emerald-deep/10 bg-cream p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-deep">{v.business_name}</p>
                    <p className="text-xs text-emerald-deep/60">{v.category} · Zone {v.zone} · submitted {v.kyc_submitted_at ? new Date(v.kyc_submitted_at).toLocaleString() : "—"}</p>
                  </div>
                  {urls[v.id] && <a href={urls[v.id]} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-deep underline">Open document</a>}
                </div>
                <textarea placeholder="Reviewer note (optional, shown to vendor if rejected)" value={notes[v.id] || ""} onChange={(e) => setNotes({ ...notes, [v.id]: e.target.value })} className="mt-3 w-full rounded-lg border border-emerald-deep/15 bg-surface px-3 py-2 text-xs" rows={2} />
                <div className="mt-3 flex gap-2">
                  <button onClick={() => decide(v.id, "approved")} className="inline-flex items-center gap-1 rounded-full bg-emerald-deep px-3 py-1 text-[11px] font-semibold text-cream"><Check className="h-3 w-3"/>Approve & verify</button>
                  <button onClick={() => decide(v.id, "rejected")} className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1 text-[11px] font-semibold text-rose-600"><X className="h-3 w-3"/>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
