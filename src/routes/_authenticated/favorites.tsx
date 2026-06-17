import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MapPin, Star, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({ meta: [{ title: "Saved vendors — RedeemServe" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase
      .from("favorites" as any)
      .select("vendor_id, vendors(*)")
      .eq("user_id", u.user.id);
    setVendors(((data as any) ?? []).map((r: any) => r.vendors).filter(Boolean));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(vendorId: string) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("favorites" as any).delete().eq("user_id", u.user.id).eq("vendor_id", vendorId);
    setVendors((vs) => vs.filter((v) => v.id !== vendorId));
  }

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-emerald-soft/40">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
          <h1 className="font-display text-3xl font-extrabold text-emerald-deep sm:text-4xl">Saved vendors</h1>
          <p className="mt-2 text-sm text-emerald-deep/65">Your shortlisted vendors for the next service.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
        {loading ? (
          <p className="text-sm text-emerald-deep/60">Loading…</p>
        ) : vendors.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-emerald-deep/15 bg-surface p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-emerald-deep/40" />
            <p className="mt-4 font-display text-xl font-bold text-emerald-deep">No saved vendors yet</p>
            <p className="mt-1 text-sm text-emerald-deep/60">Tap the heart on any vendor to keep it here.</p>
            <Link to="/discover" className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
              Browse vendors <ArrowRight className="h-4 w-4"/>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((v) => (
              <div key={v.id} className="rounded-2xl border border-emerald-deep/10 bg-surface p-5 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-emerald-soft px-2.5 py-1 text-[11px] font-semibold text-emerald-deep">{v.category}</span>
                  <button onClick={() => remove(v.id)} className="grid h-8 w-8 place-items-center rounded-full text-rose-500 hover:bg-rose-50" aria-label="Remove">
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-emerald-deep">{v.business_name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-emerald-deep/65">{v.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-emerald-deep/65">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-deep"><Star className="h-3.5 w-3.5 fill-gold text-gold"/> {Number(v.rating).toFixed(1)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> Zone {v.zone}</span>
                </div>
                <Link to="/vendor/$id" params={{ id: v.id }} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-deep px-4 py-2 text-xs font-semibold text-cream hover:bg-emerald">
                  Open vendor <ArrowRight className="h-3.5 w-3.5"/>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
