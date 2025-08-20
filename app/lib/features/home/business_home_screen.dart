import 'package:flutter/material.dart';
import 'package:app/features/home/student_home_screen.dart'; // Add this import

class BusinessHomeScreen extends StatelessWidget {
  const BusinessHomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FreelanceHub'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {
              // TODO: Handle notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {
              // TODO: Handle profile
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              // TODO: Handle logout
            },
          ),
        ],
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF1A202C),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Welcome back, Tech Startup Inc.!",
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "Here's what's happening with your projects",
                style: TextStyle(fontSize: 16, color: Color(0xFF4A5568)),
              ),
              const SizedBox(height: 40),
              _BusinessMetricsGrid(),
              const SizedBox(height: 40),
              _BusinessActions(),
              const SizedBox(height: 40),
              _RecentJobPostingsSection(),
            ],
          ),
        ),
      ),
    );
  }
}

class _BusinessMetricsGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        const DashboardMetricCard(
          // Now imported
          title: 'Total Spent',
          value: '\$15,200',
          icon: Icons.money_off_csred_outlined,
        ),
        const DashboardMetricCard(
          // Now imported
          title: 'Jobs Posted',
          value: '25',
          icon: Icons.article_outlined,
        ),
        const DashboardMetricCard(
          // Now imported
          title: 'Hires Made',
          value: '18',
          icon: Icons.group_outlined,
        ),
        const DashboardMetricCard(
          // Now imported
          title: 'Avg. Rating',
          value: '4.9',
          icon: Icons.star_border,
        ),
      ],
    );
  }
}

class _BusinessActions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const DashboardActionCard(
          // Now imported
          icon: Icons.add_circle_outline,
          title: 'Post a New Job',
          description: 'Start a new project and find talent',
        ),
        const SizedBox(height: 16),
        const DashboardActionCard(
          // Now imported
          icon: Icons.work_outline,
          title: 'Manage Job Postings',
          description: 'View proposals and manage active jobs',
        ),
        const SizedBox(height: 16),
        const DashboardActionCard(
          // Now imported
          icon: Icons.chat_bubble_outline,
          title: 'Messages',
          description: 'Check student communications',
        ),
      ],
    );
  }
}

class _RecentJobPostingsSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Job Postings',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A202C),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Track your job postings and proposals',
          style: TextStyle(fontSize: 14, color: Color(0xFF4A5568)),
        ),
        const SizedBox(height: 24),
        _BusinessJobCard(
          title: 'Marketing Automation Strategy',
          status: 'open',
          proposals: 5,
        ),
        const SizedBox(height: 16),
        _BusinessJobCard(
          title: 'Frontend Development for App',
          status: 'contracted',
          proposals: 12,
        ),
        const SizedBox(height: 16),
        _BusinessJobCard(
          title: 'Logo and Brand Guideline',
          status: 'completed',
          proposals: 8,
        ),
      ],
    );
  }
}

class _BusinessJobCard extends StatelessWidget {
  final String title;
  final String status;
  final int proposals;

  const _BusinessJobCard({
    Key? key,
    required this.title,
    required this.status,
    required this.proposals,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(status);
    final statusText = status.toUpperCase();

    return Container(
      padding: const EdgeInsets.all(20),
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(
                Icons.assignment_outlined,
                size: 20,
                color: Color(0xFF718096),
              ),
              const SizedBox(width: 8),
              Text(
                '$proposals proposals received',
                style: const TextStyle(fontSize: 14, color: Color(0xFF718096)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'open':
        return Colors.blue;
      case 'contracted':
        return Colors.green;
      case 'completed':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }
}
