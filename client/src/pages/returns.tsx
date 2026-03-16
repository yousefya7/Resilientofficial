import { useSEO } from "@/hooks/use-seo";
import { ShieldAlert, Mail } from "lucide-react";

export default function ReturnsPage() {
  useSEO({
    title: "Returns Policy | Resilient Official",
    description:
      "Resilient Official returns policy. All sales are final. Contact us at info@resilientofficial.com if you have any issues with your order.",
  });

  return (
    <div className="min-h-screen bg-background" data-testid="page-returns">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <p className="text-accent-blue/70 text-xs font-mono tracking-luxury uppercase mb-3">
          Policies
        </p>
        <h1 className="font-display text-4xl tracking-luxury uppercase mb-4">
          Returns
        </h1>
        <p className="text-muted-foreground text-sm font-mono mb-16 max-w-lg">
          Please read our returns policy before placing your order.
        </p>

        <div className="space-y-8">
          <section className="border-2 border-accent-blue/40 bg-accent-blue/5 p-8">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-accent-blue mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-display text-sm tracking-luxury uppercase mb-4 text-white">
                  All Sales Are Final
                </h2>
                <p className="text-muted-foreground text-sm font-mono leading-relaxed">
                  We do not accept returns or exchanges. Every purchase is final. Please review your order carefully before completing checkout.
                </p>
              </div>
            </div>
          </section>

          <section className="border-2 border-border/50 p-8">
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-accent-blue mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-display text-sm tracking-luxury uppercase mb-3">Need Help?</h2>
                <p className="text-muted-foreground text-sm font-mono leading-relaxed mb-4">
                  If you have any issues with your order — damaged item, wrong size, or a fulfillment error — please reach out and we will do our best to assist you.
                </p>
                <a
                  href="mailto:info@resilientofficial.com"
                  className="inline-flex items-center gap-2 text-accent-blue text-sm font-mono hover:underline transition-all"
                  data-testid="link-contact-email"
                >
                  <Mail className="w-4 h-4" />
                  info@resilientofficial.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
