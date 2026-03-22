import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { GripVertical, Plus, X, Star, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

type AdminSettings = {
  newArrivalsIds: string[];
  [key: string]: any;
};

function SortableProductRow({
  productId,
  products,
  onRemove,
}: {
  productId: string;
  products: Product[];
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: productId });
  const product = products.find((p) => String(p.id) === productId);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  if (!product) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-[hsl(0_0%_7%)] border-2 border-border/40 hover:border-accent-blue/30 transition-colors"
      data-testid={`new-arrival-row-${productId}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        data-testid={`drag-new-arrival-${productId}`}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-10 h-12 flex-shrink-0 overflow-hidden border border-border/30">
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold uppercase tracking-wide truncate">{product.name}</p>
        <p className="text-xs text-muted-foreground font-mono">${Number(product.price).toFixed(0)}</p>
      </div>
      <button
        onClick={onRemove}
        className="text-muted-foreground/50 hover:text-red-400 transition-colors flex-shrink-0"
        data-testid={`remove-new-arrival-${productId}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function NewArrivalsTab() {
  const { toast } = useToast();
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useQuery<AdminSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    if (settings?.newArrivalsIds && !isDirty) {
      setOrderedIds(settings.newArrivalsIds.map(String));
    }
  }, [settings?.newArrivalsIds, isDirty]);

  const saveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", { newArrivalsIds: ids });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Save failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/new-arrivals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
      setIsDirty(false);
      toast({ title: "New Arrivals Saved", description: "Homepage will reflect the changes immediately." });
    },
    onError: (err: any) => {
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedIds((ids) => {
        const oldIdx = ids.indexOf(String(active.id));
        const newIdx = ids.indexOf(String(over.id));
        return arrayMove(ids, oldIdx, newIdx);
      });
      setIsDirty(true);
    }
  };

  const addProduct = () => {
    if (!selectedToAdd || orderedIds.includes(selectedToAdd)) return;
    setOrderedIds((ids) => [...ids, selectedToAdd]);
    setSelectedToAdd("");
    setIsDirty(true);
  };

  const removeProduct = (id: string) => {
    setOrderedIds((ids) => ids.filter((i) => i !== id));
    setIsDirty(true);
  };

  const availableToAdd = allProducts.filter((p) => !orderedIds.includes(String(p.id)) && p.active !== false);

  if (settingsLoading || productsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="border-2 border-border/30 bg-[hsl(0_0%_5%)]">
        <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-border/30 bg-[hsl(0_0%_6%)]">
          <Star className="w-4 h-4 text-accent-blue" />
          <h3 className="font-display text-sm tracking-luxury uppercase">New Arrivals — Homepage</h3>
          <span className="ml-auto text-xs text-muted-foreground font-mono">{orderedIds.length} featured</span>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-muted-foreground font-mono">
            Drag to reorder. These products appear in the New Arrivals section on the homepage.
          </p>

          {orderedIds.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {orderedIds.map((id) => (
                    <SortableProductRow
                      key={id}
                      productId={id}
                      products={allProducts as Product[]}
                      onRemove={() => removeProduct(id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="border-2 border-dashed border-border/30 p-8 text-center">
              <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground font-mono">
                No new arrivals set. Add products below.
              </p>
            </div>
          )}

          {/* Add product */}
          <div className="border-t-2 border-border/20 pt-4">
            <p className="text-xs font-mono tracking-luxury uppercase text-muted-foreground mb-3">Add Product</p>
            <div className="flex gap-3 items-center">
              <Select value={selectedToAdd} onValueChange={setSelectedToAdd}>
                <SelectTrigger
                  className="flex-1 border-2 h-10 text-sm font-mono bg-transparent"
                  data-testid="select-add-new-arrival"
                >
                  <SelectValue placeholder="Select a product…" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.length === 0 ? (
                    <SelectItem value="_none" disabled>All products added</SelectItem>
                  ) : (
                    availableToAdd.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} — ${Number(p.price).toFixed(0)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={addProduct}
                disabled={!selectedToAdd}
                className="border-2 border-accent-blue bg-accent-blue text-white text-xs tracking-luxury uppercase h-10 btn-liquid no-default-hover-elevate no-default-active-elevate"
                data-testid="button-add-new-arrival"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Save */}
          <div className="border-t-2 border-border/20 pt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <Button
              onClick={() => saveMutation.mutate(orderedIds)}
              disabled={saveMutation.isPending || !isDirty}
              className="border-2 border-accent-blue bg-accent-blue text-white text-xs tracking-luxury uppercase h-10 btn-liquid no-default-hover-elevate no-default-active-elevate"
              data-testid="button-save-new-arrivals"
            >
              {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              Save New Arrivals
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
