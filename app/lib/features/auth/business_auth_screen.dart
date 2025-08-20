import 'package:flutter/material.dart';
import 'package:app/widgets/auth_form.dart';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';

class BusinessAuthScreen extends StatelessWidget {
  const BusinessAuthScreen({Key? key}) : super(key: key);

  void _loginUser(String email, String password) async {
    const String loginUrl = 'http://10.0.2.2:8001/api/v1/users/login';
    final dio = Dio();

    try {
      final response = await dio.post(
        loginUrl,
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        debugPrint('Business Login successful!');
        debugPrint('Response data: ${response.data}');
      } else {
        debugPrint(
          'Business Login failed with status code: ${response.statusCode}',
        );
        debugPrint('Response data: ${response.data}');
      }
    } on DioError catch (e) {
      if (e.response != null) {
        debugPrint('Business Login error! Status: ${e.response!.statusCode}');
        debugPrint('Error data: ${e.response!.data}');
      } else {
        debugPrint('Network error occurred: ${e.message}');
      }
    } catch (e) {
      debugPrint('An unexpected error occurred: $e');
    }
  }

  void _signupUser(Map<String, dynamic> data, XFile? avatarFile) async {
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
        debugPrint('Business Sign-up successful!');
        debugPrint('Response data: ${response.data}');
      } else {
        debugPrint(
          'Business Sign-up failed with status code: ${response.statusCode}',
        );
        debugPrint('Response data: ${response.data}');
      }
    } on DioError catch (e) {
      if (e.response != null) {
        debugPrint('Business Sign-up error! Status: ${e.response!.statusCode}');
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
        title: const Text('Business Login/Sign Up'),
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
            isStudent: false,
            onLogin: _loginUser,
            onSignup: _signupUser,
          ),
        ),
      ),
    );
  }
}
