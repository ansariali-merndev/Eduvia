import { Features } from "../components/block/Features";
import { Hero } from "../components/block/Hero";
import { Pricing } from "../components/block/Pricing";
import { Testimonials } from "../components/block/Testimonials";

export const Landing = () => {
  return (
    <main className="container mx-auto px-4">
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
    </main>
  );
};
