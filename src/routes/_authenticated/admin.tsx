import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, X, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — RedeemServe" }] }),
  component: Admin,
});

function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      if (data) {
        const { data: vs } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
        setVendors(vs ?? []);
      }
    })();
  }, [user?.id]);

  async function verify(id: string, val: boolean) {
    await supabase.from("vendors").update({ verified: val }).eq("id", id);
    setVendors((vs) => vs.map((v) => v.id === id ? { ...v, verified: val } : v));
  }

  if (isAdmin === null) return <SiteLayout><div className="p-20 text-center text-emerald-deep/60">Checking access…</div></SiteLayout>;
  if (!isAdmin) return (
    <SiteLayout><div className="mx-auto max-w-xl p-20 text-center">
      <ShieldCheck className="mx-auto h-12 w-12 text-emerald-deep/30"/>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-emerald-deep">Admins only</h1>
      <p className="mt-2 text-sm text-emerald-deep/60">Your account doesn't have admin permissions.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-emerald-deep px-5 py-3 text-sm font-semibold text-cream">Home</Link>
    </div></SiteLayout>
  );

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-emerald-deep text-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Admin portal</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Vendor verification</h1>
          <p className="mt-1 text-sm text-cream/70">{vendors.length} vendors · {vendors.filter(v=>v.verified).length} verified</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-emerald-deep/10 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-emerald-soft/50 text-left text-xs uppercase tracking-wider text-emerald-deep">
              <tr><th className="px-4 py-3">Business</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Zone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Verified</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t border-emerald-deep/10">
                  <td className="px-4 py-3 font-semibold text-emerald-deep">{v.business_name}</td>
                  <td className="px-4 py-3 text-emerald-deep/70">{v.category}</td>
                  <td className="px-4 py-3 text-emerald-deep/70">Zone {v.zone}</td>
                  <td className="px-4 py-3 text-emerald-deep/70">{v.status}</td>
                  <td className="px-4 py-3">{v.verified ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"><ShieldCheck className="h-3 w-3"/>Yes</span> : <span className="text-emerald-deep/40">—</span>}</td>
                  <td className="px-4 py-3">
                    {v.verified ? (
                      <button onClick={() => verify(v.id, false)} className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1 text-[11px] text-rose-600"><X className="h-3 w-3"/>Revoke</button>
                    ) : (
                      <button onClick={() => verify(v.id, true)} className="inline-flex items-center gap-1 rounded-full bg-emerald-deep px-3 py-1 text-[11px] text-cream"><Check className="h-3 w-3"/>Verify</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SiteLayout>
  );
}
