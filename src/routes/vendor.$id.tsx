import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_META } from "@/lib/vendors";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { Star, MapPin, Clock, Phone, MessageCircle, Heart, Plus, Minus, ShoppingBag, Share2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/vendor/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Vendor — RedeemServe` },
      { name: "description", content: `Order from this vendor at Redemption City via RedeemServe.` },
      { property: "og:title", content: `RedeemServe vendor` },
      { property: "og:description", content: `Live availability, items and ordering for this Redemption City vendor.` },
    ],
  }),
  component: VendorPage,
});

function VendorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, add, count } = useCart();
  const [v, setV] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: "" });
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
    setV(data);
    const { data: rv } = await supabase.from("reviews" as any).select("*").eq("vendor_id", id).order("created_at", { ascending: false });
    setReviews((rv as any) ?? []);
    if (user) {
      const { data: f } = await supabase.from("favorites" as any).select("*").eq("user_id", user.id).eq("vendor_id", id).maybeSingle();
      setFav(!!f);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [id, user?.id]);

  async function toggleFav() {
    if (!user) { navigate({ to: "/auth" }); return; }
    if (fav) {
      await supabase.from("favorites" as any).delete().eq("user_id", user.id).eq("vendor_id", id);
    } else {
      await supabase.from("favorites" as any).insert({ user_id: user.id, vendor_id: id });
    }
    setFav(!fav);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { navigate({ to: "/auth" }); return; }
    setPosting(true);
    await supabase.from("reviews" as any).upsert({ vendor_id: id, buyer_id: user.id, rating: reviewForm.rating, body: reviewForm.body });
    setReviewForm({ rating: 5, body: "" });
    await load();
    setPosting(false);
  }

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: v?.business_name, url });
    else { navigator.clipboard.writeText(url); alert("Link copied"); }
  }

  if (loading) return <SiteLayout><div className="mx-auto max-w-[1400px] px-8 py-24 text-emerald-deep/60">Loading vendor…</div></SiteLayout>;
  if (!v) return <SiteLayout><div className="mx-auto max-w-[1400px] px-8 py-24 text-emerald-deep">Vendor not found.</div></SiteLayout>;

  const status = STATUS_META[(v.status === "closed" ? "sold-out" : v.status) as keyof typeof STATUS_META];
  const items: string[] = v.popular_items || [];
  const priceMatch = (v.price_range || "").match(/(\d[\d,]*)/g);
  const basePrice = priceMatch ? parseInt(priceMatch[0].replace(/,/g, ""), 10) : 1000;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : Number(v.rating).toFixed(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: v.business_name,
    description: v.description,
    image: v.image_url || undefined,
    telephone: v.phone || undefined,
    address: { "@type": "PostalAddress", addressLocality: `Zone ${v.zone}`, addressRegion: "Ogun", addressCountry: "NG" },
    priceRange: v.price_range || "₦₦",
    aggregateRating: reviews.length ? { "@type": "AggregateRating", ratingValue: Number(avgRating), reviewCount: reviews.length } : undefined,
  };



  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-gradient-to-br from-emerald-deep to-emerald text-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cream/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">{v.category}</span>
                {v.verified && <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold text-gold"><ShieldCheck className="h-3 w-3"/> Verified</span>}
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${status?.bg} ${status?.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status?.dot}`}/> {status?.label}
                </span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-5xl">{v.business_name}</h1>
              <p className="mt-3 max-w-xl text-cream/80">{v.description}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/85">
                <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold"/> {avgRating} · {reviews.length} reviews</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/> Zone {v.zone} · {v.location || "Redemption City"}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4"/> Opens {v.opens_at}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={toggleFav} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${fav ? "border-gold bg-gold text-emerald-deep" : "border-cream/30 text-cream hover:bg-cream/10"}`}>
                <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`}/> {fav ? "Saved" : "Save"}
              </button>
              <button onClick={share} className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-4 py-2 text-sm font-semibold text-cream hover:bg-cream/10">
                <Share2 className="h-4 w-4"/> Share
              </button>
              {v.phone && <a href={`tel:${v.phone}`} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-emerald-deep hover:brightness-95"><Phone className="h-4 w-4"/> Call</a>}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-extrabold text-emerald-deep">Menu / Items</h2>
            <p className="mt-1 text-sm text-emerald-deep/60">Price range: {v.price_range || "Contact vendor"}</p>
            <div className="mt-6 divide-y divide-emerald-deep/10">
              {items.length === 0 && <p className="py-6 text-sm text-emerald-deep/55">Vendor hasn't listed items yet. Contact them directly to order.</p>}
              {items.map((item, i) => {
                const price = basePrice + i * 250;
                return (
                  <div key={item} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-semibold text-emerald-deep">{item}</p>
                      <p className="text-xs text-emerald-deep/60 tabular">₦{price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => add(v.id, v.business_name, { name: item, unit_price_naira: price, quantity: 1 })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-deep px-4 py-2 text-xs font-semibold text-cream hover:bg-emerald">
                      <Plus className="h-3.5 w-3.5"/> Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-extrabold text-emerald-deep">Reviews</h2>
            <form onSubmit={submitReview} className="mt-5 rounded-xl bg-emerald-soft/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Leave a review</p>
              <div className="mt-3 flex items-center gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button type="button" key={n} onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}>
                    <Star className={`h-6 w-6 ${n <= reviewForm.rating ? "fill-gold text-gold" : "text-emerald-deep/30"}`}/>
                  </button>
                ))}
              </div>
              <textarea value={reviewForm.body} onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                placeholder={user ? "How was your experience?" : "Sign in to leave a review"} rows={2}
                className="mt-3 w-full resize-none rounded-lg border border-emerald-deep/15 bg-cream px-3 py-2 text-sm text-emerald-deep outline-none focus:border-emerald-deep"/>
              <button disabled={posting} className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-deep px-4 py-2 text-xs font-semibold text-cream disabled:opacity-50">
                {posting ? "Posting…" : "Post review"}
              </button>
            </form>
            <div className="mt-6 space-y-4">
              {reviews.length === 0 && <p className="text-sm text-emerald-deep/55">No reviews yet — be the first.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="border-t border-emerald-deep/10 pt-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold"/>)}
                  </div>
                  {r.body && <p className="mt-2 text-sm text-emerald-deep/85">{r.body}</p>}
                  <p className="mt-1 text-[11px] text-emerald-deep/50">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Your cart</p>
            {!cart || cart.vendor_id !== v.id ? (
              <p className="mt-3 text-sm text-emerald-deep/60">Add items to start an order.</p>
            ) : (
              <>
                <ul className="mt-4 space-y-2 text-sm">
                  {cart.items.map((i) => (
                    <li key={i.name} className="flex justify-between gap-2">
                      <span className="text-emerald-deep">{i.quantity}× {i.name}</span>
                      <span className="tabular text-emerald-deep/70">₦{(i.unit_price_naira * i.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-emerald-deep/10 pt-3 text-sm font-semibold text-emerald-deep">
                  <span>{count} item{count !== 1 && "s"}</span>
                  <span className="tabular">₦{(cart.items.reduce((s,i)=>s+i.unit_price_naira*i.quantity,0)).toLocaleString()}</span>
                </div>
                <Link to="/checkout" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-deep px-4 py-3 text-sm font-semibold text-cream hover:bg-emerald">
                  <ShoppingBag className="h-4 w-4"/> Checkout
                </Link>
              </>
            )}
            {v.whatsapp || v.phone ? (
              <a href={`https://wa.me/${(v.whatsapp ?? v.phone ?? "").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-deep px-4 py-3 text-sm font-semibold text-emerald-deep hover:bg-emerald-soft">
                <MessageCircle className="h-4 w-4"/> Or order on WhatsApp
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}
