import 'package:flutter/material.dart';
import 'package:app/features/home/student_home_screen.dart'; // To reuse the ProjectCard

class ManageProjectsScreen extends StatelessWidget {
  const ManageProjectsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Projects'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
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
                'Your Projects',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Detailed view of your active and completed projects.',
                style: TextStyle(fontSize: 16, color: Color(0xFF4A5568)),
              ),
              const SizedBox(height: 24),
              // Reusing the ProjectCard widget from the student home screen
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
          ),
        ),
      ),
    );
  }
}
