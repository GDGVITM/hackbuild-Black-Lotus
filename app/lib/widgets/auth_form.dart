// File: lib/widgets/auth_form.dart

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/services.dart';

class AuthForm extends StatefulWidget {
  const AuthForm({
    Key? key,
    required this.isStudent,
    required this.onLogin,
    required this.onSignup,
  }) : super(key: key);

  final bool isStudent;
  final Function(String email, String password) onLogin;
  final Function(Map<String, dynamic> data, XFile? avatarFile) onSignup;

  @override
  State<AuthForm> createState() => _AuthFormState();
}

class _AuthFormState extends State<AuthForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();

  // Student-specific fields
  final _universityController = TextEditingController();
  final _majorController = TextEditingController();
  final _degreeController = TextEditingController();
  final _yearOfPassingController = TextEditingController();
  final _headlineController = TextEditingController();
  final _bioController = TextEditingController();
  final _skillsController = TextEditingController();
  final _hourlyRateController = TextEditingController();
  final _githubController = TextEditingController();
  final _linkedinController = TextEditingController();
  final _websiteController = TextEditingController();

  // Business-specific fields
  final _companyNameController = TextEditingController();
  final _positionController = TextEditingController();
  final _phoneNumberController = TextEditingController();

  bool _isLogin = true;
  bool _isPasswordVisible = false;
  XFile? _pickedImage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _universityController.dispose();
    _majorController.dispose();
    _degreeController.dispose();
    _yearOfPassingController.dispose();
    _headlineController.dispose();
    _bioController.dispose();
    _skillsController.dispose();
    _hourlyRateController.dispose();
    _githubController.dispose();
    _linkedinController.dispose();
    _websiteController.dispose();
    _companyNameController.dispose();
    _positionController.dispose();
    _phoneNumberController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      setState(() {
        _pickedImage = image;
      });
    }
  }

  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      if (_isLogin) {
        widget.onLogin(_emailController.text.trim(), _passwordController.text);
      } else {
        // If no image has been picked, create a temporary file to satisfy the backend
        if (_pickedImage == null) {
          final tempDir = await getTemporaryDirectory();
          final tempFile = File('${tempDir.path}/temp_avatar.png');
          final ByteData data = await rootBundle.load(
            'assets/images/placeholder_avatar.png',
          ); // You need to have a placeholder image in your assets folder
          await tempFile.writeAsBytes(data.buffer.asUint8List());
          _pickedImage = XFile(tempFile.path);
        }

        final String fullname = widget.isStudent
            ? '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}'
            : _companyNameController.text.trim();

        final Map<String, dynamic> signupData = {
          'fullname': fullname,
          'email': _emailController.text.trim(),
          'password': _passwordController.text,
          'headline': _headlineController.text.trim(),
          'bio': _bioController.text.trim(),
          'skills': _skillsController.text.isNotEmpty
              ? _skillsController.text.split(',').map((s) => s.trim()).toList()
              : [],
          'hourlyRate': _hourlyRateController.text.isNotEmpty
              ? double.tryParse(_hourlyRateController.text) ?? 0.0
              : 0.0,
          'portfolioLinks': {
            'github': _githubController.text.trim(),
            'linkedin': _linkedinController.text.trim(),
            'website': _websiteController.text.trim(),
          },
          'educationDetails': {
            'degree': _degreeController.text.trim(),
            'institution': _universityController.text.trim(),
            'major': _majorController.text.trim(),
            'yearOfPassing': _yearOfPassingController.text.isNotEmpty
                ? int.tryParse(_yearOfPassingController.text) ?? 0
                : 0,
          },
        };

        widget.onSignup(signupData, _pickedImage);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(25.0),
                color: _isLogin ? const Color(0xFFF0F4F8) : Colors.transparent,
              ),
              child: TextButton(
                onPressed: () => setState(() => _isLogin = true),
                child: Text(
                  'Login',
                  style: TextStyle(
                    color: _isLogin
                        ? const Color(0xFF1A202C)
                        : const Color(0xFF718096),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(25.0),
                color: !_isLogin ? const Color(0xFFF0F4F8) : Colors.transparent,
              ),
              child: TextButton(
                onPressed: () => setState(() => _isLogin = false),
                child: Text(
                  'Sign Up',
                  style: TextStyle(
                    color: !_isLogin
                        ? const Color(0xFF1A202C)
                        : const Color(0xFF718096),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 40),
        Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                _isLogin ? 'Welcome Back!' : 'Create Account',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _isLogin
                    ? 'Log in to your account'
                    : 'Join FreelanceHub as a ${widget.isStudent ? 'student' : 'business'}',
                style: const TextStyle(fontSize: 14, color: Color(0xFF4A5568)),
              ),
              const SizedBox(height: 24),
              if (!_isLogin) ...[
                Center(
                  child: GestureDetector(
                    onTap: _pickImage,
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: const Color(0xFFF0F4F8),
                      backgroundImage: _pickedImage != null
                          ? FileImage(File(_pickedImage!.path))
                          : null,
                      child: _pickedImage == null
                          ? const Icon(
                              Icons.camera_alt,
                              size: 40,
                              color: Color(0xFF718096),
                            )
                          : null,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  prefixIcon: const Icon(
                    Icons.email_outlined,
                    color: Color(0xFF4A5568),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: const Color(0xFFF0F4F8),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(
                    Icons.lock_outlined,
                    color: Color(0xFF4A5568),
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isPasswordVisible
                          ? Icons.visibility
                          : Icons.visibility_off,
                      color: const Color(0xFF4A5568),
                    ),
                    onPressed: () {
                      setState(() {
                        _isPasswordVisible = !_isPasswordVisible;
                      });
                    },
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: const Color(0xFFF0F4F8),
                ),
                obscureText: !_isPasswordVisible,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your password';
                  }
                  return null;
                },
              ),
              if (!_isLogin) ...[
                const SizedBox(height: 20),
                TextFormField(
                  controller: _confirmPasswordController,
                  decoration: InputDecoration(
                    labelText: 'Confirm Password',
                    prefixIcon: const Icon(
                      Icons.lock_outlined,
                      color: Color(0xFF4A5568),
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _isPasswordVisible
                            ? Icons.visibility
                            : Icons.visibility_off,
                        color: const Color(0xFF4A5568),
                      ),
                      onPressed: () {
                        setState(() {
                          _isPasswordVisible = !_isPasswordVisible;
                        });
                      },
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: const Color(0xFFF0F4F8),
                  ),
                  obscureText: !_isPasswordVisible,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (value != _passwordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                if (widget.isStudent) ...[
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _firstNameController,
                          decoration: InputDecoration(
                            labelText: 'First Name',
                            prefixIcon: const Icon(
                              Icons.person_outline,
                              color: Color(0xFF4A5568),
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF0F4F8),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Enter your first name';
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _lastNameController,
                          decoration: InputDecoration(
                            labelText: 'Last Name',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF0F4F8),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Enter your last name';
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _headlineController,
                    decoration: InputDecoration(
                      labelText: 'Headline',
                      hintText: 'e.g., Aspiring Software Engineer',
                      prefixIcon: const Icon(
                        Icons.title_outlined,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _bioController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      labelText: 'Bio',
                      hintText: 'Tell us about yourself...',
                      prefixIcon: const Icon(
                        Icons.description_outlined,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _skillsController,
                    decoration: InputDecoration(
                      labelText: 'Skills',
                      hintText: 'e.g., Dart, Flutter, Node.js',
                      prefixIcon: const Icon(
                        Icons.code,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _hourlyRateController,
                    decoration: InputDecoration(
                      labelText: 'Hourly Rate (\$)',
                      hintText: 'e.g., 25',
                      prefixIcon: const Icon(
                        Icons.money,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Portfolio Links',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2D3748),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _githubController,
                    decoration: InputDecoration(
                      labelText: 'GitHub',
                      prefixIcon: const Icon(
                        Icons.link,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _linkedinController,
                    decoration: InputDecoration(
                      labelText: 'LinkedIn',
                      prefixIcon: const Icon(
                        Icons.link,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _websiteController,
                    decoration: InputDecoration(
                      labelText: 'Personal Website',
                      prefixIcon: const Icon(
                        Icons.link,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Education Details',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2D3748),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _universityController,
                    decoration: InputDecoration(
                      labelText: 'University',
                      prefixIcon: const Icon(
                        Icons.school_outlined,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _majorController,
                    decoration: InputDecoration(
                      labelText: 'Major',
                      hintText: 'e.g., Computer Science',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _degreeController,
                    decoration: InputDecoration(
                      labelText: 'Degree',
                      hintText: 'e.g., Bachelor of Science',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _yearOfPassingController,
                    decoration: InputDecoration(
                      labelText: 'Year of Passing',
                      hintText: 'e.g., 2025',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ] else ...[
                  TextFormField(
                    controller: _companyNameController,
                    decoration: InputDecoration(
                      labelText: 'Company Name',
                      prefixIcon: const Icon(
                        Icons.business_outlined,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your company name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _positionController,
                    decoration: InputDecoration(
                      labelText: 'Your Position',
                      hintText: 'e.g., Project Manager',
                      prefixIcon: const Icon(
                        Icons.person_outline,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your position';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _phoneNumberController,
                    decoration: InputDecoration(
                      labelText: 'Phone Number',
                      prefixIcon: const Icon(
                        Icons.phone_outlined,
                        color: Color(0xFF4A5568),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                    keyboardType: TextInputType.phone,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your phone number';
                      }
                      return null;
                    },
                  ),
                ],
              ],
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: _submitForm,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                  backgroundColor: const Color(0xFF1A202C),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  _isLogin ? 'Log In' : 'Create Account',
                  style: const TextStyle(
                    fontSize: 18,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              if (!_isLogin)
                RichText(
                  textAlign: TextAlign.center,
                  text: const TextSpan(
                    style: TextStyle(fontSize: 12, color: Color(0xFF4A5568)),
                    children: [
                      TextSpan(text: 'By signing up, you agree to our '),
                      TextSpan(
                        text: 'Terms of Service',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      TextSpan(text: ' and '),
                      TextSpan(
                        text: 'Privacy Policy',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 10),
              TextButton(
                onPressed: () {
                  setState(() {
                    _isLogin = !_isLogin;
                    _formKey.currentState?.reset();
                  });
                },
                child: Text(
                  _isLogin
                      ? "Don't have an account? Sign Up"
                      : 'Already have an account? Log In',
                  style: const TextStyle(
                    fontSize: 16,
                    color: Color(0xFF4A5568),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
