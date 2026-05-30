import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CalendlyEmbed } from "@/components/calendly-embed";
import { ComparisonSlider } from "@/components/comparison-slider";
import { ContactForm } from "@/components/contact-form";
import { MotionReveal } from "@/components/motion-reveal";
import { SectionHeading } from "@/components/section-heading";
import {
  maintenancePlans,
  processSteps,
  projectPlans,
  services,
  trustPoints,
} from "@/data/site-data";
import { testimonials } from "@/data/testimonials";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: "SLO Web Design",
  url: "https://slowwebdesign.com",
  email: "contact@slowebdesign.com",
  telephone: "+1-530-215-5987",
  description:
    "Premium website modernization, custom web design, and ongoing website support for businesses in San Luis Obispo and across California.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Luis Obispo",
    addressRegion: "CA",
    addressCountry: "US",
  },
  areaServed: {
    "@type": "State",
    name: "California",
  },
  priceRange: "$$",
};

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-bold text-white transition duration-200 hover:bg-forest-light focus-visible:outline-2 focus-visible:outline-forest";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-forest/20 bg-white/60 px-5 py-3 text-sm font-bold text-forest transition duration-200 hover:border-forest/35 hover:bg-white focus-visible:outline-2 focus-visible:outline-forest";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <header className="border-b border-line bg-cream">
        <div className="section-shell flex min-h-20 items-center justify-between gap-6">
          <a
            href="#top"
            className="logo-script text-forest transition hover:text-forest-light"
            aria-label="SLO Web Design home"
          >
            SLO Web Design
          </a>
          <nav
            className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.12em] text-forest/75 lg:flex"
            aria-label="Main navigation"
          >
            <a className="transition hover:text-forest" href="#services">
              Services
            </a>
            <a className="transition hover:text-forest" href="#work">
              Transformation
            </a>
            <a className="transition hover:text-forest" href="#pricing">
              Pricing
            </a>
            <a className="transition hover:text-forest" href="#process">
              Process
            </a>
            <a className="transition hover:text-forest" href="#contact">
              Contact
            </a>
          </nav>
          <a href="#schedule" className={`${primaryButton} px-4 py-2.5`}>
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule consultation</span>
            <span className="sm:hidden">Schedule</span>
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-line bg-cream py-16 sm:py-24 lg:py-28">
          <div className="subtle-grid absolute inset-y-0 right-0 hidden w-[48%] opacity-70 lg:block" />
          <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#dfe9df]/70 blur-3xl" />
          <div className="section-shell relative grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr]">
            <MotionReveal>
              <div className="max-w-2xl">
                <p className="eyebrow flex items-center gap-2">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  San Luis Obispo, California
                </p>
                <h1 className="display-title mt-6 text-[3.5rem] leading-[0.89] text-forest sm:text-7xl lg:text-[5.5rem]">
                  A modern website for the business you have built.
                </h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                  SLO Web Design modernizes outdated websites and builds
                  thoughtful new ones from scratch. Local strategy, polished
                  design, and dependable communication from first conversation
                  through launch.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a href="#schedule" className={primaryButton}>
                    Schedule consultation
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                  <a href="#contact" className={secondaryButton}>
                    Request quote
                  </a>
                </div>
                <p className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  <CircleCheck
                    aria-hidden="true"
                    className="h-4 w-4 text-forest-light"
                  />
                  Personalized service for California businesses
                </p>
              </div>
            </MotionReveal>

            <MotionReveal delay={0.14}>
              <div className="relative mx-auto w-full max-w-[560px]">
                <div className="absolute -inset-5 rounded-[2rem] bg-[#dce8df] opacity-70 blur-2xl" />
                <div className="relative overflow-hidden rounded-[1.35rem] border border-forest/10 bg-paper shadow-[0_30px_70px_rgba(23,57,47,0.16)]">
                  <div className="flex h-12 items-center gap-2 border-b border-line bg-white/70 px-4">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#c68d7d]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d3bd77]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7cad8d]" />
                    <span className="ml-3 h-6 flex-1 rounded-full bg-forest/5" />
                  </div>
                  <div className="grid min-h-[380px] gap-5 p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className="logo-script text-xl text-forest">
                        Your Business
                      </span>
                      <div className="flex gap-2">
                        <span className="h-2 w-10 rounded-full bg-forest/15" />
                        <span className="h-2 w-10 rounded-full bg-forest/15" />
                        <span className="h-2 w-10 rounded-full bg-forest/15" />
                      </div>
                    </div>
                    <div className="grid items-center gap-5 sm:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <p className="eyebrow">Clear. Modern. Trusted.</p>
                        <div className="mt-3 h-7 w-full max-w-60 rounded-full bg-forest" />
                        <div className="mt-2 h-7 w-4/5 max-w-52 rounded-full bg-forest" />
                        <div className="mt-5 h-2.5 w-full rounded-full bg-forest/10" />
                        <div className="mt-2 h-2.5 w-4/5 rounded-full bg-forest/10" />
                        <div className="mt-6 h-9 w-28 rounded-full bg-forest-light" />
                      </div>
                      <div className="aspect-[4/5] rounded-t-full bg-gradient-to-b from-[#d2e1d7] to-[#b9cdbf] p-4">
                        <div className="h-full rounded-t-full border border-white/40 bg-white/20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {["01", "02", "03"].map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-line bg-white/55 p-3"
                        >
                          <p className="text-xs font-bold text-forest">{item}</p>
                          <div className="mt-3 h-2 w-4/5 rounded-full bg-forest/10" />
                          <div className="mt-2 h-2 w-3/5 rounded-full bg-forest/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-5 -left-3 rounded-xl border border-forest/10 bg-white/90 px-4 py-3 shadow-xl sm:-left-8">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.17em] text-muted">
                    Local service
                  </p>
                  <p className="mt-1 text-sm font-bold text-forest">
                    Strategy that feels personal
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>

          <div className="section-shell relative mt-20 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {trustPoints.map(({ title, detail, icon: Icon }) => (
              <div key={title} className="flex gap-4 bg-paper/90 p-5">
                <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 text-forest-light" />
                <div>
                  <p className="text-sm font-bold text-forest">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="bg-paper py-20 sm:py-28">
          <div className="section-shell">
            <MotionReveal>
              <SectionHeading
                eyebrow="Services"
                title="A better website starts with the right priorities."
                description="Whether your current website is showing its age or your business is starting fresh, every project is shaped around clarity, credibility, and the next step you want customers to take."
              />
            </MotionReveal>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {services.map(({ title, description, icon: Icon }, index) => (
                <MotionReveal key={title} delay={Math.min(index * 0.045, 0.2)}>
                  <article className="h-full bg-paper p-6 transition duration-300 hover:bg-[#fbf8f1] sm:p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6eee8] text-forest">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-charcoal">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {description}
                    </p>
                  </article>
                </MotionReveal>
              ))}
              <MotionReveal delay={0.2}>
                <article className="flex h-full flex-col justify-between bg-forest p-6 text-white sm:p-7">
                  <Sparkles aria-hidden="true" className="h-5 w-5 text-[#b8d2c8]" />
                  <div className="mt-10">
                    <p className="text-lg font-bold">
                      Not sure what your website needs?
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#c8d7d2]">
                      Start with a conversation. You will get a practical
                      recommendation without unnecessary extras.
                    </p>
                    <a
                      href="#schedule"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white"
                    >
                      Schedule a consultation
                      <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              </MotionReveal>
            </div>
          </div>
        </section>

        <section id="work" className="overflow-hidden bg-forest py-20 sm:py-28">
          <div className="section-shell">
            <MotionReveal>
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <SectionHeading
                  eyebrow="Before and after"
                  title="A thoughtful redesign changes the first impression."
                  description="An outdated website can quietly create doubt. A modernized experience gives visitors a clearer path, stronger confidence, and a better sense of the business behind the screen."
                  inverse
                />
                <p className="max-w-lg text-sm leading-6 text-[#b7cbc5] lg:ml-auto">
                  The strongest redesigns are not louder. They are easier to
                  understand, easier to trust, and easier to use. Move the
                  slider to see how a considered refresh can change the entire
                  experience.
                </p>
              </div>
            </MotionReveal>
            <MotionReveal delay={0.12} className="mt-11">
              <ComparisonSlider />
            </MotionReveal>
          </div>
        </section>

        <section id="pricing" className="bg-cream py-20 sm:py-28">
          <div className="section-shell">
            <MotionReveal>
              <SectionHeading
                eyebrow="Website project pricing"
                title="Clear starting points. A scope that fits the work."
                description="Every proposal is confirmed after a consultation, but these starting points make it easier to understand which type of project is likely to serve your business best."
              />
            </MotionReveal>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {projectPlans.map(
                ({ title, price, description, features, featured, icon: Icon }, index) => (
                  <MotionReveal key={title} delay={index * 0.08}>
                    <article
                      className={`relative h-full rounded-[1.2rem] border p-6 sm:p-7 ${
                        featured
                          ? "border-forest bg-forest text-white shadow-[0_20px_48px_rgba(23,57,47,0.17)]"
                          : "border-line bg-paper"
                      }`}
                    >
                      {featured && (
                        <p className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-[#d1e2db]">
                          Most popular
                        </p>
                      )}
                      <Icon
                        aria-hidden="true"
                        className={`h-6 w-6 ${
                          featured ? "text-[#b8d2c8]" : "text-forest-light"
                        }`}
                      />
                      <h3
                        className={`mt-6 text-xl font-bold ${
                          featured ? "text-white" : "text-charcoal"
                        }`}
                      >
                        {title}
                      </h3>
                      <p
                        className={`mt-2 text-3xl font-bold ${
                          featured ? "text-white" : "text-forest"
                        }`}
                      >
                        {price}
                      </p>
                      <p
                        className={`mt-4 text-sm leading-6 ${
                          featured ? "text-[#c8d7d2]" : "text-muted"
                        }`}
                      >
                        {description}
                      </p>
                      <ul className="mt-7 space-y-3">
                        {features.map((feature) => (
                          <li
                            key={feature}
                            className={`flex gap-3 text-sm ${
                              featured ? "text-[#e6efeb]" : "text-charcoal"
                            }`}
                          >
                            <Check
                              aria-hidden="true"
                              className={`mt-0.5 h-4 w-4 shrink-0 ${
                                featured ? "text-[#b8d2c8]" : "text-forest-light"
                              }`}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <a
                        href="#contact"
                        className={`mt-8 inline-flex items-center gap-2 text-sm font-bold ${
                          featured ? "text-white" : "text-forest"
                        }`}
                      >
                        Request a quote
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </a>
                    </article>
                  </MotionReveal>
                ),
              )}
            </div>
            <MotionReveal delay={0.1}>
              <div className="mt-6 flex gap-4 rounded-2xl border border-line bg-paper p-5 sm:p-6">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 h-6 w-6 shrink-0 text-forest-light"
                />
                <div>
                  <h3 className="font-bold text-charcoal">
                    Simpler is often the stronger choice.
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Most businesses do not need a secure login system. A
                    focused, professionally designed website is typically
                    faster to launch, easier to maintain, and better suited to
                    turning visitors into inquiries. Secure platforms are
                    available when the business need is real.
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        <section className="border-y border-line bg-paper py-20 sm:py-28">
          <div className="section-shell">
            <MotionReveal>
              <SectionHeading
                eyebrow="Monthly maintenance"
                title="Keep your website cared for after launch."
                description="Choose a practical level of ongoing support. Every plan is designed to keep your website reliable, accurate, and easier to manage as your business evolves."
              />
            </MotionReveal>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {maintenancePlans.map(
                ({ title, price, description, features, stripeLink, featured }, index) => (
                  <MotionReveal key={title} delay={index * 0.08}>
                    <article
                      className={`relative flex h-full flex-col rounded-[1.2rem] border p-6 sm:p-7 ${
                        featured
                          ? "border-forest-light bg-[#edf3ee] shadow-[0_16px_40px_rgba(23,57,47,0.1)]"
                          : "border-line bg-white"
                      }`}
                    >
                      {featured && (
                        <p className="absolute right-5 top-5 rounded-full bg-forest px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-white">
                          Recommended
                        </p>
                      )}
                      <h3 className="text-xl font-bold text-charcoal">{title}</h3>
                      <p className="mt-4 text-4xl font-bold tracking-tight text-forest">
                        {price}
                        <span className="text-sm font-bold text-muted">/month</span>
                      </p>
                      <p className="mt-4 text-sm leading-6 text-muted">
                        {description}
                      </p>
                      <ul className="mt-7 flex-1 space-y-3">
                        {features.map((feature) => (
                          <li key={feature} className="flex gap-3 text-sm text-charcoal">
                            <Check
                              aria-hidden="true"
                              className="mt-0.5 h-4 w-4 shrink-0 text-forest-light"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={stripeLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`${primaryButton} mt-8`}
                      >
                        Choose {title}
                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                      </a>
                    </article>
                  </MotionReveal>
                ),
              )}
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-muted">
              Secure checkout is handled by Stripe. Maintenance plans can be
              selected after launch or added to an existing website.
            </p>
          </div>
        </section>

        <section id="process" className="bg-forest py-20 sm:py-28">
          <div className="section-shell">
            <MotionReveal>
              <SectionHeading
                eyebrow="The process"
                title="A clear path from first conversation to launch."
                description="A professional website project should feel organized. Each stage keeps decisions focused and communication straightforward."
                inverse
              />
            </MotionReveal>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {processSteps.map(({ title, description }, index) => (
                <MotionReveal key={title} delay={index * 0.055}>
                  <article className="h-full bg-forest p-6 transition hover:bg-[#1c4338] sm:p-7">
                    <p className="text-xs font-bold tracking-[0.2em] text-[#9ebeb2]">
                      0{index + 1}
                    </p>
                    <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#b7cbc5]">
                      {description}
                    </p>
                  </article>
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-cream py-20 sm:py-28">
          <div className="section-shell">
            <MotionReveal>
              <SectionHeading
                eyebrow="Client experience"
                title="Thoughtful work. Straightforward communication."
                description="The website matters, and so does the experience of getting there. These placeholder testimonials are ready to replace with approved client feedback."
              />
            </MotionReveal>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {testimonials.map(({ quote, name, role, business }, index) => (
                <MotionReveal key={business} delay={index * 0.08}>
                  <figure className="flex h-full flex-col rounded-[1.2rem] border border-line bg-paper p-6 sm:p-7">
                    <Quote
                      aria-hidden="true"
                      className="h-6 w-6 text-forest-light"
                    />
                    <blockquote className="mt-6 flex-1 text-sm leading-7 text-charcoal">
                      “{quote}”
                    </blockquote>
                    <figcaption className="mt-7 border-t border-line pt-5">
                      <p className="text-sm font-bold text-forest">{name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {role}, {business}
                      </p>
                    </figcaption>
                  </figure>
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="border-y border-line bg-paper py-20 sm:py-28">
          <div className="section-shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
            <MotionReveal>
              <div>
                <p className="eyebrow">Request a quote</p>
                <h2 className="display-title mt-4 text-5xl leading-[0.96] text-forest">
                  Tell us where your website needs to go next.
                </h2>
                <p className="mt-5 text-base leading-7 text-muted">
                  Share a little about your business, current website, and
                  goals. You will receive a personal response with the right
                  next step for your project.
                </p>
                <div className="mt-8 space-y-4 border-t border-line pt-7">
                  <a
                    href="mailto:contact@slowebdesign.com"
                    className="flex items-center gap-3 text-sm font-bold text-charcoal transition hover:text-forest-light"
                  >
                    <Mail aria-hidden="true" className="h-5 w-5 text-forest-light" />
                    contact@slowebdesign.com
                  </a>
                  <a
                    href="tel:+15302155987"
                    className="flex items-center gap-3 text-sm font-bold text-charcoal transition hover:text-forest-light"
                  >
                    <Phone aria-hidden="true" className="h-5 w-5 text-forest-light" />
                    530-215-5987
                  </a>
                  <p className="flex items-center gap-3 text-sm font-bold text-charcoal">
                    <MapPin aria-hidden="true" className="h-5 w-5 text-forest-light" />
                    San Luis Obispo, California
                  </p>
                </div>
              </div>
            </MotionReveal>
            <MotionReveal delay={0.1}>
              <ContactForm />
            </MotionReveal>
          </div>
        </section>

        <section id="schedule" className="bg-cream py-20 sm:py-28">
          <div className="section-shell">
            <MotionReveal>
              <SectionHeading
                eyebrow="Schedule a consultation"
                title="Choose a time for a focused 30-minute conversation."
                description="Book a complimentary consultation to discuss your website, goals, and the most practical next step. Meetings are held through Google Meet for a simple, reliable start."
                align="center"
              />
            </MotionReveal>
            <MotionReveal
              delay={0.1}
              className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[1.2rem] border border-line bg-paper shadow-[0_18px_55px_rgba(30,59,51,0.08)]"
            >
              <CalendlyEmbed />
            </MotionReveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#102c24] py-12 text-white">
        <div className="section-shell grid gap-9 border-b border-white/10 pb-10 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <a href="#top" className="logo-script text-3xl text-white">
              SLO Web Design
            </a>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#b7cbc5]">
              Modern website design, thoughtful modernization, and ongoing
              support for businesses in San Luis Obispo and across California.
            </p>
          </div>
          <a
            href="#schedule"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-forest transition hover:bg-[#eaf1ed]"
          >
            Start with a consultation
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
        <div className="section-shell mt-7 flex flex-col gap-4 text-xs text-[#9ebeb2] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SLO Web Design. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <a className="transition hover:text-white" href="mailto:contact@slowebdesign.com">
              contact@slowebdesign.com
            </a>
            <a className="transition hover:text-white" href="tel:+15302155987">
              530-215-5987
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
