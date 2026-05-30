import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Code2,
  FileText,
  Gauge,
  LifeBuoy,
  MapPin,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type PricingPlan = {
  title: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
  icon: LucideIcon;
};

export type MaintenancePlan = {
  title: string;
  price: string;
  description: string;
  features: string[];
  stripeLink: string;
  featured?: boolean;
};

export const services: Service[] = [
  {
    title: "Website Modernization",
    description:
      "Turn an outdated website into a clear, polished experience that reflects the quality of your business today.",
    icon: Sparkles,
  },
  {
    title: "Custom Website Development",
    description:
      "Build a tailored website from the ground up with thoughtful structure, modern design, and dependable performance.",
    icon: Code2,
  },
  {
    title: "Local Business Websites",
    description:
      "Create a professional local presence that helps customers understand your services and take the next step.",
    icon: MapPin,
  },
  {
    title: "Landing Pages",
    description:
      "Give a specific service, campaign, or offer a focused page designed to turn interest into inquiries.",
    icon: FileText,
  },
  {
    title: "Website Maintenance",
    description:
      "Keep your website accurate, monitored, and cared for with responsive ongoing support.",
    icon: LifeBuoy,
  },
  {
    title: "SEO Foundations",
    description:
      "Start with clean technical structure, useful metadata, and local search essentials built into the site.",
    icon: Search,
  },
  {
    title: "Hosting Guidance",
    description:
      "Choose a practical hosting setup with clear recommendations and support through launch.",
    icon: Gauge,
  },
];

export const projectPlans: PricingPlan[] = [
  {
    title: "Website Modernization",
    price: "$1,500",
    description:
      "For established businesses ready to refresh an existing website and make a stronger first impression.",
    features: [
      "Redesign existing website",
      "Modern layout",
      "Responsive improvements",
      "SEO foundations",
      "Performance improvements",
    ],
    icon: PanelsTopLeft,
  },
  {
    title: "Custom Growth Website",
    price: "$2,500",
    description:
      "For businesses that want a custom digital presence designed to support their next stage of growth.",
    features: [
      "Complete custom website",
      "Premium design",
      "Animations",
      "Lead generation focus",
      "Advanced sections",
      "Local SEO setup",
    ],
    featured: true,
    icon: BriefcaseBusiness,
  },
  {
    title: "Secure Platform",
    price: "$4,000+",
    description:
      "For projects that truly require protected accounts, tailored workflows, or more involved application logic.",
    features: [
      "Authentication",
      "Secure user areas",
      "Dashboards",
      "Advanced functionality",
    ],
    icon: ShieldCheck,
  },
];

export const maintenancePlans: MaintenancePlan[] = [
  {
    title: "Essential Care",
    price: "$49",
    description: "Reliable oversight for a website that needs steady care.",
    features: [
      "Hosting oversight",
      "Security monitoring",
      "Minor content edits",
      "Contact form monitoring",
      "Email support",
    ],
    stripeLink: "https://buy.stripe.com/aFa3cvckDftkbPbeSGfMA00",
  },
  {
    title: "Growth Care",
    price: "$99",
    description: "Ongoing improvements for a website that supports growth.",
    features: [
      "Everything in Essential",
      "Monthly content updates",
      "Analytics review",
      "SEO monitoring",
      "Up to 1 hour of edits/month",
    ],
    stripeLink: "https://buy.stripe.com/bJe00jgAT0yq2eBcKyfMA01",
    featured: true,
  },
  {
    title: "Priority Care",
    price: "$199",
    description: "Priority attention for businesses that move quickly.",
    features: [
      "Everything in Growth",
      "Priority support",
      "Faster turnaround",
      "Up to 3 hours of edits/month",
      "Quarterly website optimization review",
    ],
    stripeLink: "https://buy.stripe.com/8x26oHbgz1Cu7yVbGufMA02",
  },
];

export const processSteps = [
  {
    title: "Consultation",
    description: "Start with a focused conversation about your business, goals, and current website.",
  },
  {
    title: "Planning",
    description: "Define the right pages, priorities, and scope before design work begins.",
  },
  {
    title: "Design",
    description: "Shape a calm, polished visual direction that feels aligned with your business.",
  },
  {
    title: "Development",
    description: "Build a responsive, high-performing website with thoughtful technical foundations.",
  },
  {
    title: "Launch",
    description: "Review the final details, connect your domain, and publish with confidence.",
  },
  {
    title: "Ongoing Support",
    description: "Keep your website current with practical maintenance and a real point of contact.",
  },
];

export const trustPoints = [
  { title: "Local perspective", detail: "Based in San Luis Obispo", icon: Building2 },
  { title: "Built for clarity", detail: "No unnecessary complexity", icon: PanelsTopLeft },
  { title: "Measured decisions", detail: "Strategy before decoration", icon: BarChart3 },
];
