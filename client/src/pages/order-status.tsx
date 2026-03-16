import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Package, Truck, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

type OrderLookupResult = {
  id: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  items: { productName?: string; name?: string; size: string; quantity: number; price: string }[];
  total: string;
  shippingAddress: { name: string; street: string; city: string; state: string; zip: string } | null;
  createdAt: string | null;
};

const CARRIER_URLS: Record<string, string> = {
  USPS: "https://tools.usps.com/go/TrackConfirmAction?tLabels=",
  UPS: "https://www.ups.com/track?tracknum=",
  FedEx: "https://www.fedex.com/fedextrack/?trknbr=",
  DHL: "https://www.dhl.com/us-en/home/tracking.html?tracking-id=",
};

function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const base = CARRIER_URLS[carrier] ?? "";
  if (!base) return "";
  return `${base}${encodeURIComponent(trackingNumber)}`;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "shipped") return <Truck className="w-5 h-5 text-accent-blue" />;
  if (status === "delivered") return <CheckCircle className="w-5 h-5 text-green-400" />;
  if (status === "cancelled") return <XCircle className="w-5 h-5 text-red-400" />;
  if (status === "paid" || status === "processing") return <Package className="w-5 h-5 text-accent-blue" />;
  return <Clock className="w-5 h-5 text-muted-foreground" />;
}

function StatusLabel({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "text-muted-foreground" },
    processing: { label: "Processing", color: "text-yellow-400" },
    paid: { label: "Paid — Preparing to Ship", color: "text-accent-blue" },
    shipped: { label: "Shipped", color: "text-accent-blue" },
    delivered: { label: "Delivered", color: "text-green-400" },
    cancelled: { label: "Cancelled", color: "text-red-400" },
  };
  const { label, color } = map[status] ?? { label: status, color: "text-muted-foreground" };
  return <span className={`font-mono font-bold uppercase tracking-widest text-sm ${color}`}>{label}</span>;
}

export default function OrderStatusPage() {
  const [, navigate] = useLocation();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderLookupResult | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both your order ID and email address.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/orders/lookup?orderId=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Order not found. Please check your order ID and email.");
        return;
      }
      setResult(await res.json());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const showTracking = result && (result.status === "shipped" || result.status === "delivered");
  const trackingUrl = result?.carrier && result?.trackingNumber
    ? getTrackingUrl(result.carrier, result.trackingNumber)
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal nav */}
      <div className="border-b-2 border-border/30 px-6 py-4">
        <button onClick={() => navigate("/")} className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Store
        </button>
      </div>

      <div className="max-w-xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-blue mb-3">RESILIENT</p>
          <h1 className="font-archivo-black text-3xl uppercase tracking-tight mb-2">Order Status</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Look up your order using your order ID and the email address you used at checkout.
          </p>
        </div>

        {/* Lookup form */}
        {!result && (
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Order ID</label>
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. A1B2C3D4"
                className="border-2 border-border/60 bg-background font-mono text-sm h-11"
                data-testid="input-order-id"
              />
              <p className="text-[11px] text-muted-foreground/60 font-mono">Found in your order confirmation email</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-2 border-border/60 bg-background font-mono text-sm h-11"
                data-testid="input-lookup-email"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 font-mono border border-red-400/30 bg-red-400/5 px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-mono text-xs uppercase tracking-[0.2em] border-0"
              data-testid="button-track-order"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Looking up...</> : "Track Order"}
            </Button>
          </form>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6" data-testid="order-status-result">
            {/* Status block */}
            <div className="border-2 border-border/60 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Order</span>
                <span className="font-mono text-xs text-accent-blue">#{result.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <StatusIcon status={result.status} />
                <StatusLabel status={result.status} />
              </div>
              {result.createdAt && (
                <p className="text-xs text-muted-foreground font-mono">
                  Ordered: {new Date(result.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>

            {/* Tracking block — only if shipped/delivered */}
            {showTracking && result.carrier && result.trackingNumber && (
              <div className="border-2 border-green-500/40 bg-green-500/5 p-6 space-y-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-green-400 mb-1">Tracking</p>
                  <p className="font-mono text-xs text-muted-foreground mb-1">{result.carrier}</p>
                  <p className="font-mono font-bold text-lg text-foreground tracking-wider" data-testid="text-tracking-number">
                    {result.trackingNumber}
                  </p>
                </div>
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full justify-center bg-accent-blue text-white font-mono text-xs uppercase tracking-[0.2em] py-3 px-6 hover:bg-accent-blue/90 transition-colors"
                    data-testid="link-track-my-order"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Track My Order
                  </a>
                )}
              </div>
            )}

            {/* Items */}
            <div className="border-2 border-border/30 p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Items</p>
              <div className="space-y-3">
                {result.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center" data-testid={`order-item-${i}`}>
                    <div>
                      <p className="text-sm font-mono font-bold">{item.productName || item.name || "Item"}</p>
                      <p className="text-xs text-muted-foreground font-mono">Size: {item.size} · Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-mono text-accent-blue">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/30 flex justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Total</span>
                <span className="font-mono font-bold">${Number(result.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping address */}
            {result.shippingAddress && (
              <div className="border-2 border-border/30 p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Ship To</p>
                <div className="font-mono text-sm text-muted-foreground space-y-0.5">
                  <p>{result.shippingAddress.name}</p>
                  <p>{result.shippingAddress.street}</p>
                  <p>{result.shippingAddress.city}, {result.shippingAddress.state} {result.shippingAddress.zip}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => { setResult(null); setOrderId(""); setEmail(""); }}
              className="w-full text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground border-2 border-border/30 py-3 transition-colors"
              data-testid="button-lookup-again"
            >
              Look Up Another Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
