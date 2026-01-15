"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import SystemScrollCanvas from "@/components/SystemScrollCanvas";
import SectionTextOverlay from "@/components/SectionTextOverlay";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Scroll-driven experience */}
      <div className="relative">
        <SystemScrollCanvas />
        <SectionTextOverlay />
      </div>

      {/* Final CTA Section */}
      <section id="concepts" className="relative bg-background py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
              A learning instrument
              <span className="block text-muted mt-2">— not a course.</span>
            </h2>

            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              MLStudio Pro helps you understand how AI systems behave visually,
              so you can build with intuition — not just memorization.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full text-lg transition-all duration-300 hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
              >
                Start Exploring
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-accent/10 via-transparent to-accent/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
