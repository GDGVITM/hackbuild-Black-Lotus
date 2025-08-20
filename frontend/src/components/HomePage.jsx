// src/components/Homepage.jsx
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle, Star } from "lucide-react";

// Custom component for the numbered badges
const CardBadge = ({ number }) => {
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white text-lg font-bold">
      {number}
    </div>
  );
};

// Custom component for the star rating
const StarRating = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-5 w-5 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
    />
  ));
  return <div className="flex">{stars}</div>;
};

// SVG for the hero section background
const HeroSVG = () => (
  <svg
    className="absolute inset-0 w-full h-full object-cover z-0 opacity-20"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 320"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "#a8c0ff", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#3f2b96", stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "#f7971e", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#ff2d2d", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#blueGradient)"
      d="M0,96L60,106.7C120,117,240,139,360,133.3C480,128,600,96,720,101.3C840,107,960,149,1080,165.3C1200,181,1320,171,1380,165.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
    ></path>
    <path
      fill="url(#purpleGradient)"
      d="M0,192L60,181.3C120,171,240,149,360,133.3C480,117,600,107,720,112C840,117,960,139,1080,138.7C1200,139,1320,117,1380,106.7L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
      transform="translate(0, 100)"
    ></path>
  </svg>
);

// Main Homepage Component
export function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9F7FB] font-sans">
      {/* -------------------- Main Content Wrapper -------------------- */}
      <main>
        {/* -------------------- Hero Section -------------------- */}
        <section className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 text-center px-6 py-20">
          <HeroSVG />
          <div className="z-10 max-w-3xl mx-auto relative">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                The Student Freelance Ecosystem.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 mb-8 max-w-2xl mx-auto font-light">
              Connect with businesses, build your portfolio, and get paid for
              your skills—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
                onClick={() => (window.location.href = "/signup")}
              >
                Join as Student
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-blue-600 border-blue-600 bg-white hover:bg-blue-50 py-3 px-8 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105"
                onClick={() => (window.location.href = "/business-signup")}
              >
                Join as Business
              </Button>
            </div>
          </div>
        </section>

        {/* -------------------- "What Our Users Say" Section -------------------- */}
        <section
          id="testimonials"
          className="py-16 md:pt-24 md:pb-12 px-6 md:px-12"
        >
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-gray-800 tracking-tight">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-xl p-6 text-left border-2 border-transparent hover:border-blue-500 transition-all duration-300 transform hover:scale-[1.02]">
                <CardContent className="p-0">
                  <StarRating rating={5} />
                  <p className="text-gray-700 mt-4 leading-relaxed italic">
                    "FreelanceHub helped me land my first web development
                    project. The platform is so easy to use and the process is
                    seamless from start to finish."
                  </p>
                  <div className="mt-6">
                    <p className="font-semibold text-gray-900">Sarah Chen</p>
                    <p className="text-gray-500 text-sm">
                      Computer Science Student
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl p-6 text-left border-2 border-transparent hover:border-blue-500 transition-all duration-300 transform hover:scale-[1.02]">
                <CardContent className="p-0">
                  <StarRating rating={5} />
                  <p className="text-gray-700 mt-4 leading-relaxed italic">
                    "We found amazing student developers who delivered quality
                    work on time and within budget. This is now our go-to for
                    finding top talent."
                  </p>
                  <div className="mt-6">
                    <p className="font-semibold text-gray-900">
                      Tech Startup Inc.
                    </p>
                    <p className="text-gray-500 text-sm">Business</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        {/* -------------------- "Why Choose FreelanceHub?" Section -------------------- */}
        <section id="features" className="py-16 md:py-24 px-6 md:px-12">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-gray-800 tracking-tight">
              Why Choose FreelanceHub?
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center leading-relaxed">
              We provide the tools you need for seamless and secure freelance
              collaborations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-lg p-6 flex flex-col items-center text-center">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold">Secure Escrow</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    Protected payments ensure both parties are satisfied before
                    funds are released.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg p-6 flex flex-col items-center text-center">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold">Built-in Chat</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    Collaborate seamlessly with integrated messaging and file
                    sharing.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg p-6 flex flex-col items-center text-center">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold">Reputation System</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    Build your reputation and trust through verified reviews and
                    ratings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        {/* -------------------- "How It Works" Section -------------------- */}
        <section id="how-it-works" className="py-16 md:py-24 px-6 md:px-12">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-gray-800 tracking-tight">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-lg p-6 text-center">
                <CardHeader className="p-0 flex justify-center mb-4">
                  <CardBadge number="1" />
                </CardHeader>
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold">Post or Browse</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    Businesses post jobs; students browse and submit proposals
                    with portfolios.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg p-6 text-center">
                <CardHeader className="p-0 flex justify-center mb-4">
                  <CardBadge number="2" />
                </CardHeader>
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold">Collaborate</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    Work together using our integrated project management and
                    communication tools.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg p-6 text-center">
                <CardHeader className="p-0 flex justify-center mb-4">
                  <CardBadge number="3" />
                </CardHeader>
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold">Get Paid</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    Receive safe and secure payments for completed work via our
                    escrow system.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------- "Ready to Get Started?" Footer -------------------- */}
      <footer className="bg-gray-900 py-12 md:py-16 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <Button variant="secondary" size="lg">
          Sign Up Now
        </Button>
      </footer>
    </div>
  );
}
