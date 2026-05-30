"use client";

import { CheckCircle2, LoaderCircle, Send, TriangleAlert } from "lucide-react";
import { type FormEvent, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

const serviceOptions = [
  "Website modernization",
  "New website",
  "Landing page",
  "Maintenance",
  "SEO foundations",
  "Hosting guidance",
];

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = new URLSearchParams(
      Array.from(formData.entries(), ([key, value]) => [key, String(value)]),
    );

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      name="project-inquiry"
      method="POST"
      action="/"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="rounded-[1.25rem] border border-line bg-paper p-5 shadow-[0_18px_55px_rgba(30,59,51,0.08)] sm:p-7"
    >
      <input type="hidden" name="form-name" value="project-inquiry" />
      <p className="hidden">
        <label>
          Do not fill this out if you are human:
          <input name="bot-field" />
        </label>
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" required>
          <input
            className="field"
            type="text"
            name="full-name"
            autoComplete="name"
            required
          />
        </FormField>
        <FormField label="Business name" required>
          <input
            className="field"
            type="text"
            name="business-name"
            autoComplete="organization"
            required
          />
        </FormField>
        <FormField label="Email" required>
          <input
            className="field"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </FormField>
        <FormField label="Phone number">
          <input
            className="field"
            type="tel"
            name="phone"
            autoComplete="tel"
          />
        </FormField>
        <FormField label="Existing website URL">
          <input
            className="field"
            type="url"
            name="existing-website"
            placeholder="https://"
            autoComplete="url"
          />
        </FormField>
        <FormField label="Business type" required>
          <input className="field" type="text" name="business-type" required />
        </FormField>
        <FormField label="Budget range" required>
          <select className="field" name="budget-range" defaultValue="" required>
            <option value="" disabled>
              Select a range
            </option>
            <option value="$1,500 - $2,499">$1,500 - $2,499</option>
            <option value="$2,500 - $3,999">$2,500 - $3,999</option>
            <option value="$4,000+">$4,000+</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </FormField>
        <FormField label="Preferred contact method" required>
          <select
            className="field"
            name="preferred-contact-method"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select a method
            </option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Either">Either</option>
          </select>
        </FormField>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-bold text-charcoal">
          Services needed
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {serviceOptions.map((service) => (
            <label
              key={service}
              className="flex items-center gap-3 rounded-xl border border-line bg-white/60 px-3 py-3 text-sm text-charcoal"
            >
              <input
                type="checkbox"
                name="services-needed"
                value={service}
                className="h-4 w-4 accent-forest"
              />
              {service}
            </label>
          ))}
        </div>
      </fieldset>

      <FormField label="Project description" required className="mt-6">
        <textarea
          className="field min-h-36 resize-y"
          name="project-description"
          placeholder="Tell us a little about your goals, current website, and timeline."
          required
        />
      </FormField>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-5 text-muted">
          Your information is used only to respond to your inquiry. Expect a
          personal reply within one business day.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-light disabled:cursor-wait disabled:opacity-70"
        >
          {status === "submitting" ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="h-4 w-4" />
          )}
          {status === "submitting" ? "Sending..." : "Send inquiry"}
        </button>
      </div>

      <div aria-live="polite" className="mt-4">
        {status === "success" && (
          <p className="flex items-center gap-2 rounded-xl bg-[#e8f3ed] px-4 py-3 text-sm font-bold text-forest">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            Thank you. Your inquiry has been sent successfully.
          </p>
        )}
        {status === "error" && (
          <p className="flex items-center gap-2 rounded-xl bg-[#f8eae7] px-4 py-3 text-sm font-bold text-[#7b3d35]">
            <TriangleAlert aria-hidden="true" className="h-4 w-4" />
            Something went wrong. Please email contact@slowebdesign.com.
          </p>
        )}
      </div>
    </form>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

function FormField({
  label,
  children,
  required = false,
  className,
}: FormFieldProps) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-sm font-bold text-charcoal">
        {label}
        {required && <span className="text-[#a25d4c]"> *</span>}
      </span>
      {children}
    </label>
  );
}
