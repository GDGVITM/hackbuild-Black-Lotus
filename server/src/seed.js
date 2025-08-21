import dotenv from "dotenv";
import mongoose from "mongoose";
import { Thread } from "./models/thread.model.js"; // Adjust path as needed
import { Topic } from "./models/topic.model.js"; // Adjust path as needed

dotenv.config();

// Mock user data for a working example.
// This should match the structure of your authenticated user.
const MOCK_USER = {
  uid: "mockUserId123",
  name: "Jane Doe",
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully for seeding.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Starting database seeding...");

    // Clear existing data to prevent duplicates
    await Thread.deleteMany({});
    await Topic.deleteMany({});
    console.log("Existing threads and topics cleared.");

    // Define core topics for a general discussion forum
    const topicsToSeed = [
      { name: "Programming" },
      { name: "Design" },
      { name: "AI & ML" },
      { name: "Career" },
      { name: "General" },
      { name: "Announcements" },
      { name: "Feedback" },
    ];

    await Topic.insertMany(topicsToSeed);
    console.log("Topics seeded successfully.");

    // Define mock threads for each topic
    const threadsToSeed = [
      {
        title: "What is your favorite new JavaScript framework?",
        text: "I've been hearing a lot about SolidJS and Qwik. What are your thoughts on them compared to React or Vue?",
        userName: MOCK_USER.name,
        userId: MOCK_USER.uid,
        topic: "Programming",
        likes: [],
        dislikes: [],
      },
      {
        title: "Best color palettes for a dark mode UI?",
        text: "I'm working on a design project and need some inspiration for a dark mode theme. Any good resources or tips?",
        userName: MOCK_USER.name,
        userId: MOCK_USER.uid,
        topic: "Design",
        likes: [MOCK_USER.uid],
        dislikes: [],
      },
      {
        title: "What's the difference between NLP and NLU?",
        text: "I'm new to the world of AI. Can someone explain the core differences in simple terms?",
        userName: MOCK_USER.name,
        userId: MOCK_USER.uid,
        topic: "AI & ML",
        likes: [],
        dislikes: [],
      },
      {
        title: "Interview tips for a junior dev role",
        text: "I have my first technical interview next week and I'm a bit nervous. What are some common questions or things to prepare?",
        userName: MOCK_USER.name,
        userId: MOCK_USER.uid,
        topic: "Career",
        likes: [MOCK_USER.uid],
        dislikes: [],
      },
      {
        title: "Introductions! Tell us about yourself.",
        text: "Hello everyone! I'm Jane and I'm a computer science student from London. What about you?",
        userName: MOCK_USER.name,
        userId: MOCK_USER.uid,
        topic: "General",
        likes: [MOCK_USER.uid],
        dislikes: [],
      },
      {
        title: "Welcome to the new community forum!",
        text: "This is a space to connect with other students and professionals. Feel free to start a new discussion!",
        userName: MOCK_USER.name,
        userId: MOCK_USER.uid,
        topic: "Announcements",
        likes: [],
        dislikes: [],
      },
      {
        title: "What new features would you like to see?",
        text: "We're always looking to improve. Share your ideas for new features or improvements to the platform here!",
        userName: MOCK_USER.name,
        userId: MOCK_USER.uid,
        topic: "Feedback",
        likes: [MOCK_USER.uid],
        dislikes: [],
      },
    ];

    await Thread.insertMany(threadsToSeed);
    console.log("Threads seeded successfully.");
  } catch (error) {
    console.error("Error during seeding process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
};

seedDatabase();
