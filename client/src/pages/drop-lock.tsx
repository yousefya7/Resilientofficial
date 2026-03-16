import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, ArrowRight, Bell } from "lucide-react";

function DustParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.06 + 0.02,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, Math.random() * 60 - 30, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, Math.random() * 60 - 30, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function DropLock({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showShutter, setShowShutter] = useState(false);
  const [smsSubmitting, setSmsSubmitting] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnlocking(true);
    try {
      const res = await apiRequest("POST", "/api/auth/unlock", { password });
      if (res.ok) {
        setShowShutter(true);
        setTimeout(() => {
          onUnlock();
        }, 1200);
      }
    } catch {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Try again.",
        variant: "destructive",
      });
    }
    setIsUnlocking(false);
  };

  const handleSmsSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setSmsSubmitting(true);
    try {
      await apiRequest("POST", "/api/sms-subscribe", { phone });
      setSmsSuccess(true);
      toast({
        title: "You're In",
        description: "You'll be the first to know about drops.",
      });
    } catch (err: any) {
      const msg: string = err?.message || "";
      if (msg.includes("Already subscribed") || err?.status === 409) {
        setSmsSuccess(true);
        toast({
          title: "Already On The List",
          description: "You're already subscribed. We'll text you when the drop goes live.",
        });
      } else {
        toast({
          title: "Error",
          description: "Could not subscribe. Try again.",
          variant: "destructive",
        });
      }
    }
    setSmsSubmitting(false);
  };

  return (
    <>
      <AnimatePresence>
        {showShutter && (
          <>
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: "-100%" }}
              transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 z-[100] bg-neutral-900"
              style={{ height: "50vh", top: 0 }}
            />
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: "100%" }}
              transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 z-[100] bg-neutral-900"
              style={{ height: "50vh", top: "50vh" }}
            />
          </>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#0A0A0A] overflow-hidden" data-testid="page-drop-lock">
        <DustParticles />

        <div
          className="absolute inset-0 z-[2] opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-md w-full px-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-32 h-32 mb-12"
          >
            <img
              src="/images/logo-icon.png"
              alt="Resilient"
              className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(59,130,246,0.35)] drop-shadow-[0_0_80px_rgba(59,130,246,0.15)]"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-white font-display text-3xl tracking-luxury uppercase mb-2"
          >
            Resilient
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-white/40 text-sm font-mono tracking-wide uppercase mb-12"
          >
            Exclusive Access
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="w-full space-y-4 mb-16"
          >
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 transition-colors group-focus-within:text-accent-blue" />
              <Input
                data-testid="input-password"
                type="password"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/10 text-white placeholder:text-white/30 pl-12 h-12 text-sm font-mono tracking-wide focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-300 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              />
            </div>
            <Button
              data-testid="button-unlock"
              type="submit"
              disabled={isUnlocking || !password}
              className="w-full h-12 bg-accent-blue text-white border-2 border-accent-blue text-sm tracking-luxury uppercase font-medium no-default-hover-elevate no-default-active-elevate btn-liquid btn-liquid-light transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              {isUnlocking ? "Verifying..." : "Enter"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="w-full"
          >
            <div className="border-t-2 border-white/10 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-white/40" />
                <span className="text-white/60 text-xs tracking-luxury uppercase">
                  SMS Drop Alerts
                </span>
              </div>

              {smsSuccess ? (
                <p className="text-white/40 text-sm font-mono" data-testid="text-sms-success">
                  You're on the list. Stay ready.
                </p>
              ) : (
                <form onSubmit={handleSmsSignup} className="flex gap-3">
                  <Input
                    data-testid="input-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-white/5 border-2 border-white/10 text-white placeholder:text-white/30 h-10 text-sm font-mono focus:border-accent-blue focus:ring-0 transition-all duration-300 focus:bg-white/[0.08]"
                  />
                  <Button
                    data-testid="button-sms-subscribe"
                    type="submit"
                    variant="outline"
                    disabled={smsSubmitting}
                    className="border-2 border-white/20 text-white text-xs tracking-wide uppercase no-default-hover-elevate no-default-active-elevate transition-all duration-300 hover:border-accent-blue hover:text-accent-blue"
                  >
                    {smsSubmitting ? "..." : "Notify Me"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
