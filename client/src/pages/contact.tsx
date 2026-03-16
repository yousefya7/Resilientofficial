import { useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Instagram, CheckCircle, Loader2 } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  useSEO({
    title: "Contact Us | Resilient Official",
    description:
      "Get in touch with Resilient Official. Reach out with questions, collaborations, or order inquiries. We respond within 24–48 hours.",
  });

  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ContactForm) {
    try {
      await apiRequest("POST", "/api/contact", values);
      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-contact">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <p className="text-accent-blue/70 text-xs font-mono tracking-luxury uppercase mb-3">
          Get in Touch
        </p>
        <h1 className="font-display text-4xl tracking-luxury uppercase mb-4">
          Contact
        </h1>
        <p className="text-muted-foreground text-sm font-mono mb-16 max-w-lg leading-relaxed">
          We're here for you. Whether it's a question about your order, a collaboration inquiry, or just want to say something — drop us a message and we'll get back to you within 24–48 hours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-3">
            {submitted ? (
              <div className="border-2 border-accent-blue/40 bg-accent-blue/5 p-10 flex flex-col items-start gap-4" data-testid="contact-success">
                <CheckCircle className="w-8 h-8 text-accent-blue" />
                <div>
                  <h2 className="font-display text-sm tracking-luxury uppercase mb-2">Message Received</h2>
                  <p className="text-muted-foreground text-sm font-mono leading-relaxed">
                    Thanks for reaching out. We've sent a confirmation to your email and will get back to you within 24–48 hours.
                  </p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="form-contact">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-mono tracking-luxury uppercase text-muted-foreground">Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Your name"
                            className="border-2 border-border/50 bg-transparent focus:border-accent-blue transition-colors"
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-mono tracking-luxury uppercase text-muted-foreground">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your@email.com"
                            className="border-2 border-border/50 bg-transparent focus:border-accent-blue transition-colors"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-mono tracking-luxury uppercase text-muted-foreground">Subject</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Order inquiry, collab, etc."
                            className="border-2 border-border/50 bg-transparent focus:border-accent-blue transition-colors"
                            data-testid="input-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-mono tracking-luxury uppercase text-muted-foreground">Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell us what's on your mind..."
                            rows={6}
                            className="border-2 border-border/50 bg-transparent focus:border-accent-blue transition-colors resize-none"
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white border-0 tracking-luxury uppercase font-mono text-xs h-12"
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>

          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="text-xs tracking-luxury uppercase mb-4 font-bold">Email</p>
              <a
                href="mailto:info@resilientofficial.com"
                className="flex items-center gap-2 text-muted-foreground text-sm font-mono hover:text-accent-blue transition-colors"
                data-testid="link-email"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                info@resilientofficial.com
              </a>
            </div>
            <div>
              <p className="text-xs tracking-luxury uppercase mb-4 font-bold">Social</p>
              <div className="space-y-3">
                <a
                  href="https://instagram.com/resilientofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground text-sm font-mono hover:text-accent-blue transition-colors"
                  data-testid="link-instagram"
                >
                  <Instagram className="w-4 h-4 flex-shrink-0" />
                  @resilientofficial
                </a>
                <a
                  href="https://tiktok.com/@resilientofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground text-sm font-mono hover:text-accent-blue transition-colors"
                  data-testid="link-tiktok"
                >
                  <SiTiktok className="w-4 h-4 flex-shrink-0" />
                  @resilientofficial
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-luxury uppercase mb-3 font-bold">Response Time</p>
              <p className="text-muted-foreground text-sm font-mono leading-relaxed">
                We typically respond within 24–48 hours, Monday through Friday.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
