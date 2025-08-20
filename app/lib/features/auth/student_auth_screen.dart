// File: lib/features/auth/student_auth_screen.dart

import 'package:flutter/material.dart';
import 'package:app/widgets/auth_form.dart';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';

class StudentAuthScreen extends StatelessWidget {
  const StudentAuthScreen({Key? key}) : super(key: key);

  void _loginUser(BuildContext context, String email, String password) async {
    const String loginUrl = 'http://10.0.2.2:8001/api/v1/users/login';
    final dio = Dio();

    try {
      final response = await dio.post(
        loginUrl,
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        debugPrint('Login successful!');
        debugPrint('Response data: ${response.data}');

        // Navigate to the student dashboard on successful login
        if (context.mounted) {
          Navigator.of(context).pushReplacementNamed('/student_dashboard');
        }
      } else {
        debugPrint('Login failed with status code: ${response.statusCode}');
        debugPrint('Response data: ${response.data}');
      }
    } on DioError catch (e) {
      if (e.response != null) {
        debugPrint('Login error! Status: ${e.response!.statusCode}');
        debugPrint('Error data: ${e.response!.data}');
      } else {
        debugPrint('Network error occurred: ${e.message}');
      }
    } catch (e) {
      debugPrint('An unexpected error occurred: $e');
    }
  }

  void _signupUser(BuildContext context, Map<String, dynamic> data, XFile? avatarFile) async {
    const String signupUrl = 'http://10.0.2.2:8001/api/v1/users/register';
    final dio = Dio();

    if (avatarFile == null) {
      debugPrint('Error: Please select an avatar.');
      // You could add a UI element here to inform the user
      return;
    }

    try {
      final formData = FormData.fromMap({
        ...data,
        'avatar': await MultipartFile.fromFile(
          avatarFile.path,
          filename: avatarFile.name,
        ),
      });

      final response = await dio.post(signupUrl, data: formData);

      if (response.statusCode == 201) {
        debugPrint('Sign-up successful!');
        debugPrint('Response data: ${response.data}');
        
        // Navigate to the student dashboard on successful sign-up
        if (context.mounted) {
          Navigator.of(context).pushReplacementNamed('/student_dashboard');
        }
      } else {
        debugPrint('Sign-up failed with status code: ${response.statusCode}');
        debugPrint('Response data: ${response.data}');
      }
    } on DioError catch (e) {
      if (e.response != null) {
        debugPrint('Sign-up error! Status: ${e.response!.statusCode}');
        debugPrint('Error data: ${e.response!.data}');
      } else {
        debugPrint('Network error occurred: ${e.message}');
      }
    } catch (e) {
      debugPrint('An unexpected error occurred: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Account'),
        leading: IconButton(
          icon: const Icon(Icons.close),
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
          child: AuthForm(
            isStudent: true,
            onLogin: (email, password) => _loginUser(context, email, password),
            onSignup: (data, avatarFile) => _signupUser(context, data, avatarFile),
          ),
        ),
      ),
    );
  }
}