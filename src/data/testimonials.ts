// Testimonials data — intentionally empty.
// The previous entries (named clients, "40% increase in leads") were
// unverified, so they were removed rather than presented as fact.
// Add real, confirmed testimonials here when Ben supplies them.

export interface Testimonial {
  id: string;
  name: string;
  business: string;
  text: string;
}

export const testimonials: Testimonial[] = [];
