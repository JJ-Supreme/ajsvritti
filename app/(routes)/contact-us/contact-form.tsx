"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  subject: z.string().trim().min(3, "Please enter a subject").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

type FormValues = z.infer<typeof schema>;

const ContactForm = () => {
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ type: "error", text: json.error || "We couldn't send your message. Please try again." });
        return;
      }
      reset();
      setStatus({ type: "success", text: "Thank you! Your message has been sent. We will get back to you within 24–48 hours." });
    } catch {
      setStatus({ type: "error", text: "We couldn't send your message. Please check your connection and try again." });
    }
  };

  const fieldError = (msg?: string) => (msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 space-y-4 not-prose">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium">Name *</label>
          <Input id="contact-name" placeholder="Your name" disabled={isSubmitting} {...register("name")} />
          {fieldError(errors.name?.message)}
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-medium">Email *</label>
          <Input id="contact-email" type="email" placeholder="you@example.com" disabled={isSubmitting} {...register("email")} />
          {fieldError(errors.email?.message)}
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="text-sm font-medium">Subject *</label>
        <Input id="contact-subject" placeholder="How can we help?" disabled={isSubmitting} {...register("subject")} />
        {fieldError(errors.subject?.message)}
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium">Message *</label>
        <Textarea id="contact-message" className="min-h-[120px]" placeholder="Tell us about your enquiry" disabled={isSubmitting} {...register("message")} />
        {fieldError(errors.message?.message)}
      </div>

      {status && (
        <p
          role="status"
          className={`text-sm rounded-md px-3 py-2 ${
            status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status.text}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
};

export default ContactForm;
