import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessagesSquare,
  ClipboardList,
  Search,
  Bell,
  Star,
  CheckCircle2,
  Hourglass,
  MessagesSquareIcon,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

// Corrected API and Socket.IO URLs to use port 8001
const API_URL = "http://localhost:8001/api/v1";
const SOCKET_URL = "http://localhost:8001";

// Mock user data and JWT for a working example.
const MOCK_USER = {
  uid: "mockUserId123",
  name: "Jane Doe",
  email: "jane.doe@example.com",
};

// A mock JWT token. Replace with a token from your login endpoint.
const MOCK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJtb2NrVXNlcklkMTIzIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.f-2N0W2N0g-lQ-aP8N8F-2L-1K1K9R1Y1D1W9J0F1Y";

// Utility function to get auth headers
const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${MOCK_TOKEN}`,
  };
};

const NewThreadModal = ({ show, onClose, onPost, topics }) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onPost({ title, text, topic });
    setTitle("");
    setText("");
    setTopic("");
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Create New Post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <textarea
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          ></textarea>
          <div className="relative">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="" disabled>
                Select a Topic
              </option>
              {topics.map((t, index) => (
                <option key={index} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="text-gray-900 border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Post
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Main Community Dashboard Component
export default function CommunityDashboard() {
  const [threads, setThreads] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch topics and threads on initial load
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${API_URL}/topics`);
        const data = await response.json();
        // Updated logic to handle different backend response formats
        if (data.success && Array.isArray(data.data)) {
          setTopics(data.data);
        } else if (Array.isArray(data)) {
          setTopics(data);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    fetchTopics();
  }, []);

  // Fetch threads and set up socket listener
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch(`${API_URL}/threads`);
        const data = await response.json();
        // Updated logic to handle different backend response formats
        if (data.success && Array.isArray(data.data)) {
          setThreads(data.data);
        } else if (Array.isArray(data)) {
          setThreads(data);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();

    const socket = io(SOCKET_URL);

    socket.on("new-thread", (newThread) => {
      setThreads((prev) => [newThread, ...prev]);
    });

    socket.on("update-thread", (updatedThread) => {
      setThreads((prev) =>
        prev.map((t) => (t._id === updatedThread._id ? updatedThread : t))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle new post creation
  const handlePostThread = async (postData) => {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create thread");
      }
    } catch (error) {
      console.error("Error posting thread:", error);
    }
  };

  // Handle voting (like/dislike)
  const handleVote = async (threadId, voteType) => {
    try {
      const response = await fetch(
        `${API_URL}/threads/${threadId}/${voteType}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Vote failed.");
      }
    } catch (error) {
      console.error(`Error ${voteType}ing thread:`, error);
    }
  };

  const filteredThreads =
    selectedTopic === "All"
      ? threads
      : threads.filter((thread) => thread.topic === selectedTopic);

  const getBadgeVariant = (topicName) => {
    const colors = ["blue", "purple", "green", "orange", "pink"];
    const hash = topicName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    return `bg-${color}-100 text-${color}-700 border-${color}-700`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "in progress":
        return <Hourglass size={16} className="text-blue-500" />;
      case "completed":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "pending review":
        return <MessagesSquareIcon size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans antialiased">
      {/* Header and Call to Action */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Community Discussions
          </h1>
          <p className="text-gray-500 mt-1">
            Browse and join discussions on various topics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowNewThreadModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Start a New Thread
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Topics Section (Left Sidebar) */}
        <div className="md:col-span-1">
          <Card className="shadow-lg p-6 h-fit sticky top-28">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-bold">Topics</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <Button
                onClick={() => setSelectedTopic("All")}
                variant={selectedTopic === "All" ? "default" : "secondary"}
                className={`w-full justify-start ${selectedTopic === "All" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
              >
                All
              </Button>
              {topics.map((t, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedTopic(t.name)}
                  variant={selectedTopic === t.name ? "default" : "secondary"}
                  className={`w-full justify-start ${selectedTopic === t.name ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                >
                  {t.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Threads List (Main Content) */}
        <div className="md:col-span-3 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {selectedTopic === "All" ? "All Threads" : selectedTopic}
          </h2>
          <AnimatePresence>
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">
                Loading threads...
              </div>
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map((thread, index) => (
                <Card key={index} className="p-6">
                  <CardHeader className="p-0 mb-4 flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold">{thread.title}</h3>
                    <Badge className={getBadgeVariant(thread.topic)}>
                      {thread.topic}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-gray-600 mb-4">{thread.text}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Posted by{" "}
                        <span className="font-semibold text-gray-800">
                          {thread.userName}
                        </span>
                      </span>
                      <div className="flex items-center space-x-4">
                        <div
                          onClick={() => handleVote(thread._id, "like")}
                          className="flex items-center space-x-1 cursor-pointer hover:text-blue-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`w-5 h-5 ${
                              thread.likes.includes(MOCK_USER.uid)
                                ? "text-blue-500"
                                : "text-gray-400"
                            }`}
                          >
                            <path d="M7.493 2.502a.75.75 0 01.07 1.054l-1.332 1.476c-.322.355-.177.942.383.942H16.5a.75.75 0 01.75.75v8.25a.75.75 0 01-.75.75h-3.375a.75.75 0 00-.638.384l-.56 1.006c-.43.774-1.637.774-2.067 0l-.56-1.006a.75.75 0 00-.637-.384H7.493a.75.75 0 01-.689-.523l-1.107-3.903A3.75 3.75 0 002.5 9.75V9a3.75 3.75 0 013.75-3.75h1.5A.75.75 0 007.493 2.502zM15 15.75a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v5.25a.75.75 0 01-.75.75h-2.25a.75.75 0 01-.75-.75v-5.25z" />
                          </svg>
                          <span>{thread.likes.length}</span>
                        </div>
                        <div
                          onClick={() => handleVote(thread._id, "dislike")}
                          className="flex items-center space-x-1 cursor-pointer hover:text-red-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`w-5 h-5 ${
                              thread.dislikes.includes(MOCK_USER.uid)
                                ? "text-red-500"
                                : "text-gray-400"
                            }`}
                          >
                            <path d="M7.493 2.502a.75.75 0 01.07 1.054l-1.332 1.476c-.322.355-.177.942.383.942H16.5a.75.75 0 01.75.75v8.25a.75.75 0 01-.75.75h-3.375a.75.75 0 00-.638.384l-.56 1.006c-.43.774-1.637.774-2.067 0l-.56-1.006a.75.75 0 00-.637-.384H7.493a.75.75 0 01-.689-.523l-1.107-3.903A3.75 3.75 0 002.5 9.75V9a3.75 3.75 0 013.75-3.75h1.5A.75.75 0 007.493 2.502zM15 15.75a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v5.25a.75.75 0 01-.75.75h-2.25a.75.75 0 01-.75-.75v-5.25z" />
                          </svg>
                          <span>{thread.dislikes.length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No threads found for this topic. Be the first to post!
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showNewThreadModal && (
          <NewThreadModal
            show={showNewThreadModal}
            onClose={() => setShowNewThreadModal(false)}
            onPost={handlePostThread}
            topics={topics}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
