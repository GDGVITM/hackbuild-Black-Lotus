// File: lib/features/browse_jobs/browse_jobs_screen.dart

import 'package:flutter/material.dart';

class BrowseJobsScreen extends StatelessWidget {
  const BrowseJobsScreen({Key? key}) : super(key: key);

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
                'Browse Jobs',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Find exciting freelance opportunities',
                style: TextStyle(fontSize: 16, color: Color(0xFF4A5568)),
              ),
              const SizedBox(height: 24),
              _FilterAndSearchBar(),
              const SizedBox(height: 24),
              // This is where the list of jobs will be rendered
              _JobCard(
                title: 'E-commerce Website Development',
                clientName: 'TechStore Inc.',
                clientRating: 4.8,
                postTime: '2 hours ago',
                location: 'Remote',
                description:
                    'Looking for a skilled developer to create a modern e-commerce platform with React and Node.js. Must have experience with payment integration and responsive design.',
                tags: const ['React', 'Node.js', 'MongoDB', 'Stripe API'],
                budget: '\$1,500 - \$3,000',
                duration: '2-3 months',
                proposals: 5,
              ),
              const SizedBox(height: 20),
              _JobCard(
                title: 'Mobile App UI/UX Design',
                clientName: 'StartupXYZ',
                clientRating: 4.6,
                postTime: '5 hours ago',
                location: 'Remote',
                description:
                    'Need a creative designer to design user interface for our fitness tracking mobile app. Looking for modern, clean design with excellent user experience.',
                tags: const ['Figma', 'Adobe XD', 'UI/UX', 'Mobile Design'],
                budget: '\$800 - \$1,500',
                duration: '3-4 weeks',
                proposals: 8,
              ),
              const SizedBox(height: 20),
              _JobCard(
                title: 'Content Management System',
                clientName: 'Local Business',
                clientRating: 4.5,
                postTime: '1 day ago',
                location: 'New York, NY',
                description:
                    'Build a custom CMS for managing inventory and customer data. Should include admin dashboard, reporting features, and user management.',
                tags: const ['PHP', 'MySQL', 'HTML/CSS', 'JavaScript'],
                budget: '\$1,200 - \$2,000',
                duration: '1-2 months',
                proposals: 12,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterAndSearchBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          decoration: InputDecoration(
            hintText: 'Search jobs, skills, or companies...',
            prefixIcon: const Icon(Icons.search, color: Color(0xFF4A5568)),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: const Color(0xFFF0F4F8),
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          // Use Wrap instead of Row for better responsiveness
          spacing: 16.0,
          runSpacing: 16.0,
          children: [
            SizedBox(
              width: 150, // Give a fixed width to prevent overflow
              child: DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: 'All Categories',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: const Color(0xFFF0F4F8),
                ),
                items: const [
                  DropdownMenuItem(value: 'All', child: Text('All Categories')),
                  DropdownMenuItem(
                    value: 'WebDev',
                    child: Text('Web Development'),
                  ),
                  DropdownMenuItem(value: 'Design', child: Text('Design')),
                  DropdownMenuItem(
                    value: 'DataScience',
                    child: Text('Data Science'),
                  ),
                ],
                onChanged: (value) {},
              ),
            ),
            SizedBox(
              width: 150, // Give a fixed width to prevent overflow
              child: DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: 'All Budgets',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: const Color(0xFFF0F4F8),
                ),
                items: const [
                  DropdownMenuItem(value: 'All', child: Text('All Budgets')),
                  DropdownMenuItem(
                    value: '1-500',
                    child: Text('Budget: \$1 - \$500'),
                  ),
                  DropdownMenuItem(
                    value: '500-1000',
                    child: Text('Budget: \$500 - \$1,000'),
                  ),
                ],
                onChanged: (value) {},
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _JobCard extends StatelessWidget {
  final String title;
  final String clientName;
  final double clientRating;
  final String postTime;
  final String location;
  final String description;
  final List<String> tags;
  final String budget;
  final String duration;
  final int proposals;

  const _JobCard({
    Key? key,
    required this.title,
    required this.clientName,
    required this.clientRating,
    required this.postTime,
    required this.location,
    required this.description,
    required this.tags,
    required this.budget,
    required this.duration,
    required this.proposals,
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A202C),
                  ),
                ),
              ),
              Chip(
                label: Text(
                  tags.first,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF718096),
                  ),
                ),
                backgroundColor: const Color(0xFFF0F4F8),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                clientName,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF4A5568),
                ),
              ),
              const SizedBox(height: 4),
              Wrap(
                // Replaced Row with Wrap here to prevent overflow
                spacing: 8.0,
                runSpacing: 4.0,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 16),
                      Text(
                        clientRating.toString(),
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF4A5568),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.access_time,
                        color: Color(0xFF718096),
                        size: 16,
                      ),
                      Text(
                        postTime,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF718096),
                        ),
                      ),
                    ],
                  ),
                  if (location != 'Remote')
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          color: Color(0xFF718096),
                          size: 16,
                        ),
                        Text(
                          location,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF718096),
                          ),
                        ),
                      ],
                    ),
                  if (location == 'Remote')
                    Chip(
                      label: Text(
                        location,
                        style: const TextStyle(fontSize: 12),
                      ),
                      backgroundColor: const Color(0xFFE5E7EB),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            description,
            style: const TextStyle(fontSize: 14, color: Color(0xFF4A5568)),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8.0,
            runSpacing: 4.0,
            children: tags
                .map(
                  (tag) => Chip(
                    label: Text(tag, style: const TextStyle(fontSize: 12)),
                    backgroundColor: const Color(0xFFF0F4F8),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      budget,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A202C),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 16.0,
                      runSpacing: 4.0,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.access_time,
                              size: 16,
                              color: Color(0xFF718096),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              duration,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF718096),
                              ),
                            ),
                          ],
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.assignment_outlined,
                              size: 16,
                              color: Color(0xFF718096),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '$proposals proposals',
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF718096),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              ElevatedButton(
                onPressed: () {
                  // TODO: Handle submit proposal action
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1A202C),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Submit Proposal',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
