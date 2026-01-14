import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHolding } from "@/lib/api";
import { toast } from "sonner";

const addAssetSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol too long"),
  name: z.string().min(1, "Name is required"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  avgBuyPrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Average buy price must be a positive number",
  }),
  color: z.string().optional(),
});

type AddAssetFormData = z.infer<typeof addAssetSchema>;

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_COLORS = [
  "#F7931A", // Bitcoin orange
  "#627EEA", // Ethereum blue
  "#00FFA3", // Solana green
  "#F3BA2F", // Binance yellow
  "#E84142", // Avalanche red
  "#8247E5", // Polygon purple
  "#2A5ADA", // Chainlink blue
];

export function AddAssetDialog({ open, onOpenChange }: AddAssetDialogProps) {
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddAssetFormData>({
    resolver: zodResolver(addAssetSchema),
    defaultValues: {
      color: DEFAULT_COLORS[0],
    },
  });
  const addMutation = useMutation({
    mutationFn: (data: AddAssetFormData) =>
      addHolding({
        symbol: data.symbol,
        name: data.name,
        amount: parseFloat(data.amount),
        avgBuyPrice: parseFloat(data.avgBuyPrice),
        color: selectedColor,
      }),
    onSuccess: () => {
      toast.success("Asset added successfully!");
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
      reset();
      setSelectedColor(DEFAULT_COLORS[0]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add asset");
    },
  });

  const onSubmit = (data: AddAssetFormData) => {
    addMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Add a new cryptocurrency asset to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol *</Label>
            <Input
              id="symbol"
              placeholder="BTC"
              {...register("symbol")}
              className={errors.symbol ? "border-destructive" : ""}
            />
            {errors.symbol && (
              <p className="text-sm text-destructive">{errors.symbol.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Bitcoin"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.5"
                {...register("amount")}
                className={errors.amount ? "border-destructive" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgBuyPrice">Avg Buy Price (₹) *</Label>
              <Input
                id="avgBuyPrice"
                type="number"
                step="any"
                placeholder="4200000"
                {...register("avgBuyPrice")}
                className={errors.avgBuyPrice ? "border-destructive" : ""}
              />
              {errors.avgBuyPrice && (
                <p className="text-sm text-destructive">{errors.avgBuyPrice.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? "border-primary scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addMutation.isLoading}>
              {addMutation.isLoading ? "Adding..." : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

