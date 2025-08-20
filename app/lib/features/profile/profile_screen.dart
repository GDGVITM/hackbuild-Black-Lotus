import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart'; // New Import
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
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
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const CircleAvatar(
                radius: 60,
                backgroundColor: Color(0xFFE2E8F0),
                child: Icon(Icons.person, size: 80, color: Color(0xFF4A5568)),
              ),
              const SizedBox(height: 16),
              const Text(
                'Alex Johnson',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Computer Science Student',
                style: TextStyle(fontSize: 16, color: Color(0xFF4A5568)),
              ),
              const SizedBox(height: 8),
              const Text(
                'University of Example',
                style: TextStyle(fontSize: 16, color: Color(0xFF4A5568)),
              ),
              const SizedBox(height: 40),
              const _SkillsSection(),
            ],
          ),
        ),
      ),
    );
  }
}

class _SkillsSection extends StatefulWidget {
  const _SkillsSection({Key? key}) : super(key: key);

  @override
  _SkillsSectionState createState() => _SkillsSectionState();
}

class _SkillsSectionState extends State<_SkillsSection> {
  final List<String> skills = [
    'Flutter',
    'Dart',
    'React',
    'Node.js',
    'Figma',
    'UI/UX Design',
    'Git',
    'Databases',
  ];

  final TextEditingController _skillController = TextEditingController();

  // A list of predefined skills to match against OCR output
  final List<String> commonSkills = [
    'Flutter',
    'Dart',
    'React',
    'Node.js',
    'Figma',
    'UI/UX Design',
    'Git',
    'Databases',
    'Project Management',
    'Agile',
    'Scrum',
    'API Development',
    'SQL',
    'NoSQL',
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'Swift',
    'Kotlin',
    'AngularJS',
    'Spring Framework',
    'Machine Learning',
    'Data Science',
    'AWS',
    'Azure',
    'Object-Oriented Programming (OOP)',
    'HR Analytics',
    'Web Development',
    'Mobile Development',
    'Software Development',
  ];

  void _addSkill(String skill) {
    if (skill.isNotEmpty && !skills.contains(skill)) {
      setState(() {
        skills.add(skill);
      });
    }
  }

  void _showAddSkillDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Add skill',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1A202C),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    '* Indicates required',
                    style: TextStyle(fontSize: 12, color: Color(0xFF4A5568)),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Skill*',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2D3748),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _skillController,
                    decoration: InputDecoration(
                      hintText: 'Skill (ex: Project Management)',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF0F4F8),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Suggested based on your profile',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2D3748),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8.0,
                    runSpacing: 8.0,
                    children: [
                      _SuggestedSkillChip(
                        label: 'AngularJS',
                        onTap: () => _addSkill('AngularJS'),
                      ),
                      _SuggestedSkillChip(
                        label: 'Git',
                        onTap: () => _addSkill('Git'),
                      ),
                      _SuggestedSkillChip(
                        label: 'Spring Framework',
                        onTap: () => _addSkill('Spring Framework'),
                      ),
                      _SuggestedSkillChip(
                        label: 'Databases',
                        onTap: () => _addSkill('Databases'),
                      ),
                      _SuggestedSkillChip(
                        label: 'Representational State Transfer (REST)',
                        onTap: () =>
                            _addSkill('Representational State Transfer (REST)'),
                      ),
                      _SuggestedSkillChip(
                        label: 'Software Development',
                        onTap: () => _addSkill('Software Development'),
                      ),
                      _SuggestedSkillChip(
                        label: 'Web Project Management',
                        onTap: () => _addSkill('Web Project Management'),
                      ),
                      _SuggestedSkillChip(
                        label: 'API Development',
                        onTap: () => _addSkill('API Development'),
                      ),
                      _SuggestedSkillChip(
                        label: 'Object-Oriented Programming (OOP)',
                        onTap: () =>
                            _addSkill('Object-Oriented Programming (OOP)'),
                      ),
                      _SuggestedSkillChip(
                        label: 'HR Analytics',
                        onTap: () => _addSkill('HR Analytics'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      _addSkill(_skillController.text);
                      _skillController.clear();
                      Navigator.of(context).pop();
                    },
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(60),
                      backgroundColor: const Color(0xFF1A202C),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Save',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // New method for OCR using file_picker
  Future<void> _pickAndRecognizeResume() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    );

    if (result == null || result.files.single.path == null) {
      return;
    }

    final file = result.files.single;
    final filePath = file.path!;
    final extension = file.extension?.toLowerCase();

    if (extension == 'jpg' || extension == 'jpeg' || extension == 'png') {
      // Process image file with OCR
      final inputImage = InputImage.fromFilePath(filePath);
      final textRecognizer = TextRecognizer(
        script: TextRecognitionScript.latin,
      );

      try {
        final RecognizedText recognizedText = await textRecognizer.processImage(
          inputImage,
        );
        final extractedSkills = _findSkillsInText(recognizedText.text);

        if (extractedSkills.isNotEmpty) {
          for (var skill in extractedSkills) {
            _addSkill(skill);
          }
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                '${extractedSkills.length} skills added from your resume!',
              ),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No recognizable skills found in the resume.'),
            ),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error recognizing text: $e')));
      } finally {
        textRecognizer.close();
      }
    } else if (extension == 'pdf') {
      // Handle PDF file separately
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'PDF files are not directly supported for OCR. Please convert your resume to an image first.',
          ),
        ),
      );
    }
  }

  // A simple method to find skills in a block of text
  List<String> _findSkillsInText(String text) {
    final foundSkills = <String>{};
    final lowerCaseText = text.toLowerCase();

    for (var skill in commonSkills) {
      if (lowerCaseText.contains(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    }
    return foundSkills.toList();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Skills',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A202C),
              ),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.description_outlined), // New icon
                  onPressed: _pickAndRecognizeResume, // New OCR action
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline),
                  onPressed: _showAddSkillDialog,
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8.0,
          runSpacing: 8.0,
          children: skills.map((skill) {
            return Chip(
              label: Text(skill),
              backgroundColor: const Color(0xFFE2E8F0),
              onDeleted: () {
                setState(() {
                  skills.remove(skill);
                });
              },
              deleteIcon: const Icon(Icons.close, size: 18),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _SuggestedSkillChip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _SuggestedSkillChip({
    required this.label,
    required this.onTap,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      label: Text(label),
      onPressed: onTap,
      backgroundColor: const Color(0xFFF0F4F8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: Color(0xFFCBD5E0)),
      ),
      labelStyle: const TextStyle(color: Color(0xFF4A5568)),
    );
  }
}
