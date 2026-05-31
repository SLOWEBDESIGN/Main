// Testimonials data
export interface Testimonial {
  id: string;
  name: string;
  business: string;
  text: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Martinez',
    business: 'Martinez Digital Marketing',
    text: 'SLO Web Design transformed our outdated website into a modern, high-converting platform. Their attention to detail and personalized approach made all the difference. We\'ve seen a 40% increase in leads.',
  },
  {
    id: '2',
    name: 'Michael Chen',
    business: 'Local Bakery & Café',
    text: 'As a small business owner, I needed someone who understood our vision. The team at SLO Web Design delivered exactly what we wanted—a clean, modern site that represents our brand perfectly. Highly recommended.',
  },
  {
    id: '3',
    name: 'Jennifer Walsh',
    business: 'Walsh & Associates Consulting',
    text: 'Professional, reliable, and local. We appreciate being able to meet in person and work with a team that truly understands San Luis Obispo. Our new website has been essential to our growth.',
  },
];
