import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { PromoCode } from "@shared/schema";
import {
  Plus, Trash2, ToggleLeft, ToggleRight, Tag, Loader2, X, Check,
} from "lucide-react";

type PromoType = "percentage" | "fixed" | "free_shipping";

const TYPE_LABELS: Record<PromoType, string> = {
  percentage: "% Off",
  fixed: "$ Off",
  free_shipping: "Free Shipping",
};

const emptyForm = {
  code: "",
  type: "percentage" as PromoType,
  value: "",
  expirationDate: "",
  usageLimit: "",
  minOrderAmount: "",
};

export function PromoCodesTab() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [creating, setCreating] = useState(false);

  const { data: codes = [], isLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/promo-codes");
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/promo-codes/${id}`, { active });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/promo-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({ title: "Deleted", description: "Promo code removed." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return toast({ title: "Error", description: "Code is required", variant: "destructive" });
    if (form.type !== "free_shipping" && !form.value) {
      return toast({ title: "Error", description: "Discount value is required", variant: "destructive" });
    }

    setCreating(true);
    try {
      const payload: Record<string, any> = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: form.type === "free_shipping" ? "0" : form.value,
        active: true,
      };
      if (form.expirationDate) payload.expirationDate = new Date(form.expirationDate).toISOString();
      if (form.usageLimit) payload.usageLimit = parseInt(form.usageLimit, 10);
      if (form.minOrderAmount) payload.minOrderAmount = form.minOrderAmount;

      const res = await apiRequest("POST", "/api/admin/promo-codes", payload);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setForm({ ...emptyForm });
      setShowCreate(false);
      toast({ title: "Created", description: `Promo code ${payload.code} is live.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setCreating(false);
  };

  const discountLabel = (code: PromoCode) => {
    if (code.type === "free_shipping") return "Free Shipping";
    if (code.type === "percentage") return `${Number(code.value)}% off`;
    return `$${Number(code.value).toFixed(2)} off`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl tracking-luxury uppercase">Promo Codes</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Codes are synced to Stripe as Coupons automatically.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="border-2 border-accent-blue bg-accent-blue text-white text-xs tracking-luxury uppercase h-10 px-5 hover:bg-accent-blue/90"
          data-testid="button-create-promo"
        >
          {showCreate ? <X className="w-3 h-3 mr-2" /> : <Plus className="w-3 h-3 mr-2" />}
          {showCreate ? "Cancel" : "New Code"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="border-2 border-accent-blue/40 bg-[#0a1220] p-6 space-y-4"
          data-testid="form-create-promo"
        >
          <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-accent-blue mb-2">New Promo Code</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block mb-2">Code *</label>
              <Input
                data-testid="input-promo-name"
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="h-10 text-sm border-2 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block mb-2">Type *</label>
              <div className="flex gap-2">
                {(["percentage", "fixed", "free_shipping"] as PromoType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 h-10 text-[10px] uppercase tracking-widest font-bold border-2 transition-colors ${
                      form.type === t
                        ? "border-accent-blue bg-accent-blue/20 text-accent-blue"
                        : "border-border/40 text-muted-foreground hover:border-accent-blue/40"
                    }`}
                    data-testid={`button-promo-type-${t}`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {form.type !== "free_shipping" && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block mb-2">
                  {form.type === "percentage" ? "Percent Off *" : "Amount Off ($) *"}
                </label>
                <Input
                  data-testid="input-promo-value"
                  type="number"
                  min="0"
                  step={form.type === "percentage" ? "1" : "0.01"}
                  max={form.type === "percentage" ? "100" : undefined}
                  placeholder={form.type === "percentage" ? "20" : "10.00"}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="h-10 text-sm border-2 font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block mb-2">Min Order ($)</label>
              <Input
                data-testid="input-promo-min"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="h-10 text-sm border-2 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block mb-2">Usage Limit</label>
              <Input
                data-testid="input-promo-limit"
                type="number"
                min="1"
                placeholder="Unlimited"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="h-10 text-sm border-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block mb-2">Expiration Date</label>
              <Input
                data-testid="input-promo-expiry"
                type="date"
                value={form.expirationDate}
                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                className="h-10 text-sm border-2 font-mono"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={creating}
              className="border-2 border-accent-blue bg-accent-blue text-white text-xs tracking-luxury uppercase h-10 px-6 hover:bg-accent-blue/90"
              data-testid="button-submit-promo"
            >
              {creating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Check className="w-3 h-3 mr-2" />}
              Create Code
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowCreate(false); setForm({ ...emptyForm }); }}
              className="border-2 text-xs tracking-luxury uppercase h-10 px-5"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Codes Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-accent-blue" />
        </div>
      ) : codes.length === 0 ? (
        <div className="border-2 border-border/30 py-16 text-center">
          <Tag className="w-8 h-8 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground font-mono">No promo codes yet.</p>
          <p className="text-xs text-muted-foreground/50 font-mono mt-1">Create your first code above.</p>
        </div>
      ) : (
        <div className="border-2 border-border/30 overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-muted/20 border-b-2 border-border/30">
            {["Code", "Type / Value", "Used", "Expires", "Status", ""].map((h, i) => (
              <div
                key={h}
                className={`text-[10px] uppercase tracking-widest text-muted-foreground font-bold ${
                  i === 0 ? "col-span-3" : i === 1 ? "col-span-3" : i === 2 ? "col-span-2" : i === 3 ? "col-span-2" : i === 4 ? "col-span-1" : "col-span-1"
                }`}
              >
                {h}
              </div>
            ))}
          </div>

          {codes.map((code, idx) => (
            <div
              key={code.id}
              className={`grid grid-cols-2 md:grid-cols-12 gap-4 px-5 py-4 items-center transition-colors hover:bg-muted/10 ${
                idx < codes.length - 1 ? "border-b border-border/20" : ""
              }`}
              data-testid={`row-promo-${code.id}`}
            >
              {/* Code */}
              <div className="col-span-2 md:col-span-3 flex items-center gap-2 min-w-0">
                <Tag className="w-3 h-3 text-accent-blue flex-shrink-0" />
                <span className="font-mono font-bold text-sm truncate">{code.code}</span>
                {code.stripeCouponId && (
                  <span className="text-[9px] font-mono text-muted-foreground/50 hidden lg:block">stripe ✓</span>
                )}
              </div>

              {/* Type / value */}
              <div className="md:col-span-3">
                <span className={`text-xs font-mono font-bold px-2 py-1 border ${
                  code.type === "percentage"
                    ? "border-accent-blue/40 text-accent-blue bg-accent-blue/10"
                    : code.type === "fixed"
                    ? "border-green-500/40 text-green-400 bg-green-500/10"
                    : "border-purple-500/40 text-purple-400 bg-purple-500/10"
                }`}>
                  {discountLabel(code)}
                </span>
                {code.minOrderAmount && Number(code.minOrderAmount) > 0 && (
                  <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                    Min ${Number(code.minOrderAmount).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Usage */}
              <div className="md:col-span-2">
                <span className="text-sm font-mono text-muted-foreground">
                  {code.usageCount}
                  {code.usageLimit !== null && code.usageLimit !== undefined ? `/${code.usageLimit}` : ""}
                </span>
              </div>

              {/* Expires */}
              <div className="md:col-span-2">
                {code.expirationDate ? (
                  <span className={`text-xs font-mono ${
                    new Date(code.expirationDate) < new Date() ? "text-red-400" : "text-muted-foreground"
                  }`}>
                    {new Date(code.expirationDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-muted-foreground/40">Never</span>
                )}
              </div>

              {/* Active toggle */}
              <div className="md:col-span-1">
                <button
                  onClick={() => toggleMutation.mutate({ id: code.id, active: !code.active })}
                  disabled={toggleMutation.isPending}
                  className="transition-colors"
                  data-testid={`toggle-promo-${code.id}`}
                  title={code.active ? "Disable" : "Enable"}
                >
                  {code.active ? (
                    <ToggleRight className="w-5 h-5 text-accent-blue" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </button>
              </div>

              {/* Delete */}
              <div className="md:col-span-1 flex justify-end">
                <button
                  onClick={() => {
                    if (confirm(`Delete ${code.code}?`)) deleteMutation.mutate(code.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="text-muted-foreground/40 hover:text-red-400 transition-colors"
                  data-testid={`button-delete-promo-${code.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
