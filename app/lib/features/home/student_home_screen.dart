// File: lib/features/student/student_home_screen.dart

import 'package:flutter/material.dart';

import 'package:app/features/browse_jobs/browse_jobs_screen.dart';
import 'package:app/features/messages/messages_screen.dart';
import 'package:app/features/projects/manage_projects_screen.dart';
import 'package:app/features/profile/profile_screen.dart';

class StudentHomeScreen extends StatelessWidget {
  const StudentHomeScreen({Key? key}) : super(key: key);

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
              // Navigate to the profile screen
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const ProfileScreen()),
              );
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
            children: const [
              Text(
                "Welcome back, Alex!",
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
              ),
              SizedBox(height: 8),
              Text(
                "Here's what's happening with your projects",
                style: TextStyle(fontSize: 16, color: Color(0xFF4A5568)),
              ),
              SizedBox(height: 40),
              DashboardMetricsGrid(),
              SizedBox(height: 40),
              DashboardActions(),
              SizedBox(height: 40),
              RecentProjectsSection(),
            ],
          ),
        ),
      ),
    );
  }
}

class DashboardMetricsGrid extends StatelessWidget {
  const DashboardMetricsGrid({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: const [
        DashboardMetricCard(
          title: 'Active Projects',
          value: '3',
          icon: Icons.work_outline,
        ),
        DashboardMetricCard(
          title: 'Completed',
          value: '12',
          icon: Icons.check_circle_outline,
        ),
        DashboardMetricCard(
          title: 'Total Earned',
          value: '\$2,450',
          icon: Icons.attach_money,
        ),
        DashboardMetricCard(
          title: 'Rating',
          value: '4.8',
          icon: Icons.star_outline,
        ),
        DashboardMetricCard(
          title: 'Profile Views',
          value: '324',
          icon: Icons.bar_chart,
        ),
      ],
    );
  }
}

class DashboardMetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const DashboardMetricCard({
    Key? key,
    required this.title,
    required this.value,
    required this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, size: 24, color: const Color(0xFF4A5568)),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 16, color: Color(0xFF4A5568)),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A202C),
            ),
          ),
        ],
      ),
    );
  }
}

class DashboardActions extends StatelessWidget {
  const DashboardActions({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            Navigator.of(context).pushNamed('/messages');
          },
          child: const DashboardActionCard(
            icon: Icons.chat_bubble_outline,
            title: 'Messages',
            description: 'Check client communications',
          ),
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () {
            Navigator.of(context).pushNamed('/manage_projects');
          },
          child: const DashboardActionCard(
            icon: Icons.work_outline,
            title: 'Manage Projects',
            description: 'Update progress and deliverables',
          ),
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () {
            // Navigate to the Browse Jobs page
            Navigator.of(context).pushNamed('/browse_jobs');
          },
          child: const DashboardActionCard(
            icon: Icons.search,
            title: 'Find New Work',
            description: 'Browse available opportunities',
          ),
        ),
      ],
    );
  }
}

class DashboardActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const DashboardActionCard({
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
      child: Row(
        children: [
          Icon(icon, size: 32, color: const Color(0xFF1A202C)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2D3748),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF718096),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class RecentProjectsSection extends StatelessWidget {
  const RecentProjectsSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Projects',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A202C),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Your active and recently completed work',
          style: TextStyle(fontSize: 14, color: Color(0xFF4A5568)),
        ),
        const SizedBox(height: 24),
        ProjectCard(
          title: 'E-commerce Website Development',
          client: 'TechStore Inc.',
          status: 'in progress',
          progress: 0.75,
          amount: 1500,
          dueDate: 'Dec 15, 2024',
        ),
        const SizedBox(height: 16),
        ProjectCard(
          title: 'Mobile App UI Design',
          client: 'StartupXYZ',
          status: 'completed',
          progress: 1.0,
          amount: 800,
          dueDate: 'Nov 28, 2024',
        ),
        const SizedBox(height: 16),
        ProjectCard(
          title: 'Content Management System',
          client: 'Local Business',
          status: 'pending review',
          progress: 0.95,
          amount: 1200,
          dueDate: 'Dec 10, 2024',
        ),
      ],
    );
  }
}

class ProjectCard extends StatelessWidget {
  final String title;
  final String client;
  final String status;
  final double progress;
  final int amount;
  final String dueDate;

  const ProjectCard({
    Key? key,
    required this.title,
    required this.client,
    required this.status,
    required this.progress,
    required this.amount,
    required this.dueDate,
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
              // Wrap the title text with Expanded to prevent overflow
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A202C),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
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
          const SizedBox(height: 8),
          Text(
            'Client: $client',
            style: const TextStyle(fontSize: 14, color: Color(0xFF718096)),
          ),
          const SizedBox(height: 16),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: const Color(0xFFE2E8F0),
            valueColor: AlwaysStoppedAnimation<Color>(statusColor),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '\$${amount}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A202C),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Due: $dueDate',
                  textAlign: TextAlign.right,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF718096),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'in progress':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'pending review':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }
}
