import 'package:flutter/material.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            const Header(),
            const SizedBox(height: 60),
            HeroSection(context: context), // Pass context to the HeroSection
            const SizedBox(height: 100),
            const WhyChooseSection(),
            const SizedBox(height: 100),
            const HowItWorksSection(),
            const SizedBox(height: 100),
            const TestimonialsSection(),
            const SizedBox(height: 100),
            const CallToActionFooter(),
          ],
        ),
      ),
    );
  }
}

class Header extends StatelessWidget {
  const Header({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'FreelanceHub',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2D3748),
            ),
          ),
          TextButton(
            onPressed: () {
              // Action for Browse Jobs
            },
            child: const Text(
              'Browse Jobs',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Color(0xFF4A5568),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class HeroSection extends StatelessWidget {
  const HeroSection({Key? key, required this.context}) : super(key: key);
  final BuildContext context;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        children: [
          const Chip(
            label: Text(
              'Connecting Students & Businesses',
              style: TextStyle(
                fontSize: 12,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
            backgroundColor: Color(0xFF2D3748),
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          const SizedBox(height: 20),
          const Text(
            'The Future of Student Freelancing',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 42,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A202C),
              height: 1.1,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'A secure, streamlined platform where students showcase their skills and businesses find fresh talent. From project posting to payment, we handle everything.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              color: Color(0xFF4A5568),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () {
              // Navigate to the student login/signup page
              Navigator.of(context).pushNamed('/student_auth');
            },
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(60),
              backgroundColor: const Color(0xFF1A202C),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.school_outlined, color: Colors.white),
                SizedBox(width: 10),
                Text(
                  'Join as Student',
                  style: TextStyle(fontSize: 18, color: Colors.white),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              // Navigate to the business login/signup page
              Navigator.of(context).pushNamed('/business_auth');
            },
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(60),
              backgroundColor: Colors.white,
              side: const BorderSide(color: Color(0xFFCBD5E0)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.business_center_outlined, color: Color(0xFF1A202C)),
                SizedBox(width: 10),
                Text(
                  'Join as Business',
                  style: TextStyle(fontSize: 18, color: Color(0xFF1A202C)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class WhyChooseSection extends StatelessWidget {
  const WhyChooseSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        children: [
          const Text(
            'Why Choose FreelanceHub?',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A202C),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            "We've built everything you need for successful freelance collaborations",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Color(0xFF4A5568)),
          ),
          const SizedBox(height: 40),
          FeatureCard(
            icon: Icons.shield_outlined,
            title: 'Secure Escrow',
            description:
                'Protected payments ensure both parties are satisfied before funds are released',
          ),
          const SizedBox(height: 20),
          FeatureCard(
            icon: Icons.chat_bubble_outline,
            title: 'Built-in Chat',
            description:
                'Collaborate seamlessly with integrated messaging and file sharing',
          ),
          const SizedBox(height: 20),
          FeatureCard(
            icon: Icons.star_border,
            title: 'Rating System',
            description:
                'Build your reputation through verified reviews and ratings',
          ),
        ],
      ),
    );
  }
}

class FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const FeatureCard({
    Key? key,
    required this.icon,
    required this.title,
    required this.description,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 2,
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: const Color(0xFF1A202C)),
          const SizedBox(height: 16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2D3748),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16, color: Color(0xFF718096)),
          ),
        ],
      ),
    );
  }
}

class HowItWorksSection extends StatelessWidget {
  const HowItWorksSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        children: [
          const Text(
            'How It Works',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A202C),
            ),
          ),
          const SizedBox(height: 40),
          HowItWorksStep(
            number: 1,
            title: 'Post or Browse',
            description:
                'Businesses post jobs, students browse and submit proposals',
          ),
          const SizedBox(height: 40),
          HowItWorksStep(
            number: 2,
            title: 'Collaborate',
            description:
                'Use built-in chat and project management tools to work together',
          ),
          const SizedBox(height: 40),
          HowItWorksStep(
            number: 3,
            title: 'Get Paid',
            description:
                'Secure escrow ensures safe payments for completed work',
          ),
        ],
      ),
    );
  }
}

class HowItWorksStep extends StatelessWidget {
  final int number;
  final String title;
  final String description;

  const HowItWorksStep({
    Key? key,
    required this.number,
    required this.title,
    required this.description,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF1A202C),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              number.toString(),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF2D3748),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          description,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 16, color: Color(0xFF718096)),
        ),
      ],
    );
  }
}

class TestimonialsSection extends StatelessWidget {
  const TestimonialsSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        children: [
          const Text(
            'What Our Users Say',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A202C),
            ),
          ),
          const SizedBox(height: 40),
          TestimonialCard(
            rating: 5,
            quote:
                '“FreelanceHub helped me land my first web development project. The platform is so easy to use!”',
            name: 'Sarah Chen',
            role: 'Computer Science Student',
          ),
          const SizedBox(height: 20),
          TestimonialCard(
            rating: 5,
            quote:
                '“We found amazing student developers who delivered quality work on time and within budget.”',
            name: 'Tech Startup Inc.',
            role: 'Business',
          ),
        ],
      ),
    );
  }
}

class TestimonialCard extends StatelessWidget {
  final int rating;
  final String quote;
  final String name;
  final String role;

  const TestimonialCard({
    Key? key,
    required this.rating,
    required this.quote,
    required this.name,
    required this.role,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 2,
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(
              rating,
              (index) => const Icon(Icons.star, color: Colors.amber, size: 20),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            quote,
            style: const TextStyle(
              fontSize: 16,
              fontStyle: FontStyle.italic,
              color: Color(0xFF4A5568),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            name,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2D3748),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            role,
            style: const TextStyle(fontSize: 14, color: Color(0xFF718096)),
          ),
        ],
      ),
    );
  }
}

class CallToActionFooter extends StatelessWidget {
  const CallToActionFooter({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: const Color(0xFF1A202C),
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 80.0),
      child: Column(
        children: [
          const Text(
            'Ready to Get Started?',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Join thousands of students and businesses already using FreelanceHub',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.white70),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () {
              // Action for Start Freelancing
            },
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(60),
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.school_outlined, color: Color(0xFF1A202C)),
                SizedBox(width: 10),
                Text(
                  'Start Freelancing',
                  style: TextStyle(fontSize: 18, color: Color(0xFF1A202C)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              // Action for Hire Talent
            },
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(60),
              backgroundColor: Colors.white,
              side: const BorderSide(color: Color(0xFFCBD5E0)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.business_center_outlined, color: Color(0xFF1A202C)),
                SizedBox(width: 10),
                Text(
                  'Hire Talent',
                  style: TextStyle(fontSize: 18, color: Color(0xFF1A202C)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
