import React, { useEffect, useState, useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import io from "socket.io-client";

// ✅ Vite requires import.meta.env, not process.env
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
});

export default function ChatWorkspace({ chatRoomId, projectId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [versions, setVersions] = useState([]);

  // ───────────────────────────────
  // Socket.IO Setup
  // ───────────────────────────────
  useEffect(() => {
    if (!chatRoomId) return;

    socket.emit("joinRoom", { chatRoomId });

    socket.on("receiveMessage", (msg) => {
      // ✅ Prevent duplicates (check by timestamp + senderId)
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.senderId === msg.senderId &&
            m.message === msg.message &&
            new Date(m.timestamp).getTime() ===
              new Date(msg.timestamp).getTime()
        );
        return exists ? prev : [...prev, msg];
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [chatRoomId]);

  // ───────────────────────────────
  // Fetch Messages on Load
  // ───────────────────────────────
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/chat1/messages/${chatRoomId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    if (chatRoomId) fetchMessages();
  }, [chatRoomId]);

  // ───────────────────────────────
  // Send Message (with optimistic UI update)
  // ───────────────────────────────
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg = {
      chatRoomId,
      senderId: user._id,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    // ✅ Show immediately (optimistic UI)
    setMessages((prev) => [...prev, msg]);

    // Send to server
    socket.emit("sendMessage", msg);

    setNewMessage("");
  };

  // ───────────────────────────────
  // Handle File Upload
  // ───────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles((prev) => [...prev, file]);
  };

  // ───────────────────────────────
  // Handle Version Upload
  // ───────────────────────────────
  const handleVersionUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("versionFile", file);

    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}/versions`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      setVersions((prev) => [...prev, file.name]);
    } catch (err) {
      console.error("Version upload failed:", err);
    }
  };

  return (
    <Card className="w-full h-[90vh] flex flex-col">
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex flex-col flex-1">
            <ScrollArea className="flex-1 p-2 border rounded-md mb-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 ${
                    msg.senderId === user._id ? "text-right" : "text-left"
                  }`}
                >
                  <p className="text-sm bg-muted rounded-lg inline-block p-2">
                    {msg.message}
                  </p>
                  <span className="text-xs text-gray-400 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="flex flex-col flex-1">
            <ScrollArea className="flex-1 p-2 border rounded-md mb-2">
              {tasks.length ? (
                tasks.map((task, i) => <p key={i}>{task}</p>)
              ) : (
                <p className="text-muted-foreground">No tasks yet</p>
              )}
            </ScrollArea>
            <Button
              onClick={() =>
                setTasks((prev) => [...prev, `Task ${prev.length + 1}`])
              }
            >
              Add Task
            </Button>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="flex flex-col flex-1">
            <ScrollArea className="flex-1 p-2 border rounded-md mb-2">
              {files.length ? (
                files.map((file, i) => <p key={i}>{file.name}</p>)
              ) : (
                <p className="text-muted-foreground">No files uploaded</p>
              )}
            </ScrollArea>
            <Input type="file" onChange={handleFileUpload} />
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions" className="flex flex-col flex-1">
            <ScrollArea className="flex-1 p-2 border rounded-md mb-2">
              {versions.length ? (
                versions.map((v, i) => <p key={i}>{v}</p>)
              ) : (
                <p className="text-muted-foreground">No versions uploaded</p>
              )}
            </ScrollArea>
            <Input type="file" onChange={handleVersionUpload} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
