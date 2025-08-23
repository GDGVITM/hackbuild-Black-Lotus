import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Hourglass,
  MessagesSquareIcon,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import axiosInstance from "@/lib/axios";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

const NewThreadModal = ({ show, onClose, onPost }) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");

  const topics = [
    { name: "Platform Feedback" },
    { name: "Bug Reports" },
    { name: "Feature Requests" },
    { name: "General Discussion" },
    { name: "Help & Support" },
  ];

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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card text-card-foreground rounded-lg shadow-lg w-full max-w-lg p-6 border"
      >
        <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-muted rounded-md border border-input focus:ring-2 focus:ring-ring focus:outline-none"
            required
          />
          <textarea
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 bg-muted rounded-md border border-input h-32 resize-none focus:ring-2 focus:ring-ring focus:outline-none"
            required
          ></textarea>
          <div className="relative">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 bg-muted rounded-md border border-input appearance-none focus:ring-2 focus:ring-ring focus:outline-none"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
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
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">Post</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function CommunityDashboard() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("All");

  const topics = [
    { name: "Platform Feedback" },
    { name: "Bug Reports" },
    { name: "Feature Requests" },
    { name: "General Discussion" },
    { name: "Help & Support" },
  ];

  const staticThreads = [
    {
      _id: "1",
      title: "How to get started with the new feature?",
      text: "I'm having trouble figuring out how to use the new analytics dashboard. Can someone provide a quick guide or a link to the documentation?",
      userName: "Jane Doe",
      topic: "Help & Support",
      likes: ["user1", "user2"],
      dislikes: [],
    },
    {
      _id: "2",
      title: "The login button is not working on mobile",
      text: "I've tried logging in on my iPhone and the button doesn't seem to respond. It works fine on my desktop.",
      userName: "John Smith",
      topic: "Bug Reports",
      likes: [],
      dislikes: ["user3"],
    },
    {
      _id: "3",
      title: "Suggestion: Dark mode for the UI",
      text: "It would be great if the platform had a dark mode. It would be much easier on the eyes, especially for late-night work.",
      userName: "Alex Chen",
      topic: "Feature Requests",
      likes: ["user1", "user3", "user4"],
      dislikes: [],
    },
    {
      _id: "4",
      title: "General chat about the new update",
      text: "What are your first impressions of the new update? I think the performance improvements are amazing!",
      userName: "Sarah Lee",
      topic: "General Discussion",
      likes: ["user2", "user4"],
      dislikes: [],
    },
  ];

  useEffect(() => {
    setThreads(staticThreads);
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

  const handlePostThread = async (postData) => {
    if (!user) {
      console.warn("User must be logged in to create a thread.");
      return;
    }

    const newTempThread = {
      _id: `temp-${Date.now()}`,
      title: postData.title,
      text: postData.text,
      userName: user.name,
      topic: postData.topic,
      likes: [],
      dislikes: [],
      isTemporary: true,
    };

    setThreads((prev) => [newTempThread, ...prev]);

    try {
      const response = await axiosInstance.post("/threads", postData);
      const createdThread = response.data;
      setThreads((prev) =>
        prev.map((t) => (t._id === newTempThread._id ? createdThread : t))
      );
    } catch (error) {
      console.error("Error posting thread:", error);
      setThreads((prev) => prev.filter((t) => t._id !== newTempThread._id));
    }
  };

  const handleVote = async (threadId, voteType) => {
    if (!user) {
      console.warn("User must be logged in to vote.");
      return;
    }
    try {
      await axiosInstance.post(`/threads/${threadId}/${voteType}`);
    } catch (error) {
      console.error(`Error ${voteType}ing thread:`, error);
    }
  };

  const filteredThreads =
    selectedTopic === "All"
      ? threads
      : threads.filter((thread) => thread.topic === selectedTopic);

  const getBadgeVariant = (topicName) => {
    const topicColors = {
      "Platform Feedback": "bg-blue-100 text-blue-700 hover:bg-blue-200",
      "Bug Reports": "bg-red-100 text-red-700 hover:bg-red-200",
      "Feature Requests": "bg-green-100 text-green-700 hover:bg-green-200",
      "General Discussion": "bg-gray-100 text-gray-700 hover:bg-gray-200",
      "Help & Support": "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    };
    return topicColors[topicName] || "bg-secondary text-secondary-foreground";
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
    <div className="min-h-screen bg-background text-foreground py-8 font-sans antialiased">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Community Discussions
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and join discussions on various topics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowNewThreadModal(true)}>
              <Plus size={16} className="mr-2" />
              Start a New Thread
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="shadow-lg p-6 h-fit sticky top-28">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl font-bold">Topics</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-2">
                <Button
                  onClick={() => setSelectedTopic("All")}
                  variant={selectedTopic === "All" ? "default" : "secondary"}
                  className="w-full justify-start"
                >
                  All
                </Button>
                {topics.map((t, index) => (
                  <Button
                    key={index}
                    onClick={() => setSelectedTopic(t.name)}
                    variant={selectedTopic === t.name ? "default" : "secondary"}
                    className="w-full justify-start"
                  >
                    {t.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-3 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {selectedTopic === "All" ? "All Threads" : selectedTopic}
            </h2>
            <AnimatePresence>
              {filteredThreads.length > 0 ? (
                filteredThreads.map((thread) => (
                  <motion.div
                    key={thread._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`p-6 ${thread.isTemporary ? "border-2 border-dashed border-primary/50" : ""}`}
                    >
                      <CardHeader className="p-0 mb-4 flex-row items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {thread.title}
                        </h3>
                        <Badge className={getBadgeVariant(thread.topic)}>
                          {thread.topic}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-muted-foreground mb-4">
                          {thread.text}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            Posted by{" "}
                            <span className="font-semibold text-foreground">
                              {thread.userName}
                            </span>
                            {thread.isTemporary && (
                              <span className="ml-2 text-primary">
                                (Posting...)
                              </span>
                            )}
                          </span>
                          <div className="flex items-center space-x-4">
                            <div
                              onClick={() => handleVote(thread._id, "like")}
                              className="flex items-center space-x-1 cursor-pointer hover:text-primary"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={`w-5 h-5 ${
                                  user && thread.likes.includes(user.uid)
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <path d="M7.493 2.502a.75.75 0 01.07 1.054l-1.332 1.476c-.322.355-.177.942.383.942H16.5a.75.75 0 01.75.75v8.25a.75.75 0 01-.75.75h-3.375a.75.75 0 00-.638.384l-.56 1.006c-.43.774-1.637.774-2.067 0l-.56-1.006a.75.75 0 00-.637-.384H7.493a.75.75 0 01-.689-.523l-1.107-3.903A3.75 3.75 0 002.5 9.75V9a3.75 3.75 0 013.75-3.75h1.5A.75.75 0 007.493 2.502zM15 15.75a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v5.25a.75.75 0 01-.75.75h-2.25a.75.75 0 01-.75-.75v-5.25z" />
                              </svg>
                              <span>{thread.likes.length}</span>
                            </div>
                            <div
                              onClick={() => handleVote(thread._id, "dislike")}
                              className="flex items-center space-x-1 cursor-pointer hover:text-destructive"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={`w-5 h-5 ${
                                  user && thread.dislikes.includes(user.uid)
                                    ? "text-destructive"
                                    : "text-muted-foreground"
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
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
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
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
