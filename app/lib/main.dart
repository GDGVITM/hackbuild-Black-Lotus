// File: main.dart

import 'package:flutter/material.dart';
import 'package:app/features/auth/business_auth_screen.dart';
import 'package:app/features/auth/student_auth_screen.dart';
import 'package:app/features/browse_jobs/browse_jobs_screen.dart';
import 'package:app/features/home/business_home_screen.dart';
import 'package:app/features/home/student_home_screen.dart';
import 'package:app/features/messages/messages_screen.dart';
import 'package:app/features/onboarding/landing_page.dart';
import 'package:app/features/projects/manage_projects_screen.dart';
import 'package:app/features/profile/profile_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FreelanceHub',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        fontFamily: 'Inter',
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LandingPage(),
        '/student_auth': (context) => const StudentAuthScreen(),
        '/business_auth': (context) => const BusinessAuthScreen(),
        '/student_dashboard': (context) => const StudentHomeScreen(),
        '/business_dashboard': (context) => const BusinessHomeScreen(),
        '/browse_jobs': (context) => const BrowseJobsScreen(),
        '/messages': (context) => const MessagesScreen(),
        '/manage_projects': (context) => const ManageProjectsScreen(),
        '/profile': (context) => const ProfileScreen(),
      },
    );
  }
}
