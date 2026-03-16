import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock } from "lucide-react";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("POST", "/api/admin/login", { password });
      onLogin();
    } catch {
      toast({
        title: "Access Denied",
        description: "Invalid admin credentials.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6" data-testid="page-admin-login">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        <div className="text-center mb-8">
          <Lock className="w-8 h-8 mx-auto mb-4 text-accent-blue" />
          <h1 className="font-display text-2xl tracking-luxury uppercase">Admin</h1>
          <p className="text-muted-foreground text-xs font-mono mt-2">Dashboard Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            data-testid="input-admin-password"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 text-sm border-2 font-mono"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-xs tracking-luxury uppercase border-2 border-accent-blue bg-accent-blue text-white btn-liquid no-default-hover-elevate no-default-active-elevate hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-shadow"
            data-testid="button-admin-login"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
