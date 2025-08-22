import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MessageCircle, Star, Award } from "lucide-react";

// Custom component for the numbered badges
const CardBadge = ({ number }) => {
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-500 text-white text-lg font-bold">
      {number}
    </div>
  );
};

// Custom component for the star rating
const StarRating = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-5 w-5 ${
        index < rating ? "text-yellow-400 fill-current" : "text-gray-600"
      }`}
    />
  ));
  return <div className="flex">{stars}</div>;
};

// New component for the feature cards with icons
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <Card className="bg-slate-900 border-slate-700 shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:scale-[1.02] border-none">
    <div className={`p-4 rounded-full mb-4`} style={{ backgroundColor: color }}>
      <Icon className="h-8 w-8 text-white" />
    </div>
    <CardContent className="p-0">
      <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

// Main Homepage Component
export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      {/* -------------------- Main Content Wrapper -------------------- */}
      <main>
        {/* -------------------- Hero Section -------------------- */}
        <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center px-6 py-20 md:py-32">
          <div className="z-10 max-w-4xl mx-auto relative">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-amber-500">
                Unlock Your Potential,
              </span>
              <br />
              <span className="text-slate-100">Connect to Opportunity.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              The platform where ambitious students connect with real-world
              businesses to build portfolios, gain experience, and get paid for
              their skills.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
                onClick={() => (window.location.href = "/signup")}
              >
                Join as Student
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-slate-700 bg-transparent hover:bg-slate-800 py-3 px-8 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105"
                onClick={() => (window.location.href = "/business-signup")}
              >
                Join as Business
              </Button>
            </div>
          </div>
        </section>

        {/* -------------------- "How It Works" Section -------------------- */}
        <section id="how-it-works" className="py-16 md:py-24 px-6 md:px-12">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-slate-400 mb-16 text-center leading-relaxed">
              A simple, three-step process for students and businesses alike.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Card className="bg-slate-900 border-slate-700 shadow-xl p-8 text-center transition-transform transform hover:scale-[1.02]">
                <CardHeader className="p-0 flex justify-center mb-6">
                  <CardBadge number="1" />
                </CardHeader>
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    Connect & Collaborate
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Businesses post projects and find talent, while students
                    browse and submit proposals with their portfolio.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700 shadow-xl p-8 text-center transition-transform transform hover:scale-[1.02]">
                <CardHeader className="p-0 flex justify-center mb-6">
                  <CardBadge number="2" />
                </CardHeader>
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    Create & Deliver
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Work together seamlessly using our integrated project
                    management and communication tools to deliver great results.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700 shadow-xl p-8 text-center transition-transform transform hover:scale-[1.02]">
                <CardHeader className="p-0 flex justify-center mb-6">
                  <CardBadge number="3" />
                </CardHeader>
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    Get Paid Securely
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Receive safe and secure payments for completed work via our
                    reliable escrow system.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* -------------------- Testimonials Section -------------------- */}
        <section
          id="testimonials"
          className="py-16 md:py-24 px-6 md:px-12 bg-slate-900"
        >
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white tracking-tight">
              What Our Users Say
            </h2>
            <p className="text-lg text-slate-400 mb-16 text-center leading-relaxed">
              Hear from the students and businesses who are building the future
              of freelance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="bg-slate-950 border-slate-700 shadow-xl p-8 text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <CardContent className="p-0">
                  <StarRating rating={5} />
                  <p className="text-slate-400 mt-6 leading-relaxed text-lg italic">
                    "This platform is a game-changer! It helped me land my first
                    web development project and build my portfolio with
                    confidence. The process was so easy and the support was
                    fantastic."
                  </p>
                  <div className="mt-8">
                    <p className="font-semibold text-slate-200">Sarah Chen</p>
                    <p className="text-slate-500 text-sm">
                      Computer Science Student
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-950 border-slate-700 shadow-xl p-8 text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <CardContent className="p-0">
                  <StarRating rating={5} />
                  <p className="text-slate-400 mt-6 leading-relaxed text-lg italic">
                    "We found amazing, skilled student developers who delivered
                    high-quality work on time and within budget. This is now our
                    go-to for finding top talent."
                  </p>
                  <div className="mt-8">
                    <p className="font-semibold text-slate-200">
                      Tech Startup Inc.
                    </p>
                    <p className="text-slate-500 text-sm">Business Partner</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        {/* -------------------- "Why Choose Us" Section -------------------- */}
        <section id="features" className="py-16 md:py-24 px-6 md:px-12">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white tracking-tight">
              A Platform Built for You
            </h2>
            <p className="text-lg text-slate-400 mb-16 text-center leading-relaxed">
              We provide the tools you need for seamless and secure freelance
              collaborations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={ShieldCheck}
                title="Secure Escrow"
                description="Our protected payment system ensures both parties are satisfied before funds are released."
                color="#0F172A"
              />
              <FeatureCard
                icon={MessageCircle}
                title="Integrated Chat"
                description="Collaborate seamlessly with built-in messaging and file sharing for every project."
                color="#14B8A6"
              />
              <FeatureCard
                icon={Award}
                title="Reputation System"
                description="Build trust and showcase your skills through verified reviews and ratings on your profile."
                color="#F59E0B"
              />
            </div>
          </div>
        </section>
      </main>

      {/* -------------------- Footer Call-to-Action -------------------- */}
      <footer className="bg-slate-800 py-20 md:py-24 text-center text-white relative">
        <div className="relative z-10 container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of students and businesses building the future of
            work, one project at a time.
          </p>
          <Button
            size="lg"
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-full shadow-xl transition-transform transform hover:scale-105"
            onClick={() => (window.location.href = "/signup")}
          >
            Sign Up Now
          </Button>
        </div>
      </footer>
    </div>
  );
}
