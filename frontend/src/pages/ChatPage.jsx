import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axios";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// This is the socket instance, which remains the same
const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });

// -------------------------
// Helper functions for Google Calendar
// -------------------------
const toGCalDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, "");

const getGoogleCalendarLink = (task) => {
  const title = encodeURIComponent(task.title || "Task");
  const details = encodeURIComponent(
    `Task assigned to ${task.assignedTo?.name || "Unassigned"}\nStatus: ${task.status}`
  );

  // If task has a dueAt (ISO string), use it, else now. Default duration: 60 mins
  const startDate = task.dueAt ? new Date(task.dueAt) : new Date();
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const dates = `${toGCalDate(startDate)}/${toGCalDate(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
};

// -------------------------
// To Do Tab
// -------------------------
const TodoTab = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real application, you would fetch tasks from the server.
  // For this example, we'll filter the mock tasks to show only "todo" items.
  useEffect(() => {
    setLoading(true);
    const mockTasks = [
      {
        _id: "1",
        title: "Implement new design",
        status: "in-progress",
        assignedTo: { name: "Student" },
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "2",
        title: "Write API documentation",
        status: "todo",
        assignedTo: { name: "Student" },
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "3",
        title: "Fix bug in login flow",
        status: "done",
        assignedTo: { name: "Client" },
        dueAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "4",
        title: "Review project milestones",
        status: "todo",
        assignedTo: { name: "You" },
        dueAt: null,
      },
    ];
    setTasks(mockTasks.filter((task) => task.status === "todo"));
    setLoading(false);
  }, []);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      {loading ? (
        <p className="text-center text-muted-foreground">
          Loading to-do items...
        </p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No pending tasks. Great job!
        </p>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task._id} className="w-full">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-center">
                    {/* Updated CardTitle for consistent styling */}
                    <CardTitle className="text-xl font-bold">
                      {task.title}
                    </CardTitle>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full
                         bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200
                       `}
                    >
                      {task.status}
                    </span>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-2">
                    <span>
                      Assigned to: {task.assignedTo?.name || "Unassigned"}
                    </span>
                    {task.dueAt && (
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueAt).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

// -------------------------
// Tasks Tab with Google Calendar integration
// -------------------------
const TasksTab = ({ conversationId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  // New state to hold the due date and time
  const [newTaskDueDate, setNewTaskDueDate] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Placeholder for backend fetch. Using mock data for now.
        const mockTasks = [
          {
            _id: "1",
            title: "Implement new design",
            status: "in-progress",
            assignedTo: { name: "Student" },
            // Optional: example due date to demonstrate calendar link
            dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "2",
            title: "Write API documentation",
            status: "todo",
            assignedTo: { name: "Student" },
            // Example task with no due date
            dueAt: null,
          },
          {
            _id: "3",
            title: "Fix bug in login flow",
            status: "done",
            assignedTo: { name: "Client" },
            dueAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setTasks(mockTasks);
      } catch (error) {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [conversationId]);

  // Handler for adding a new task
  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") {
      toast.error("Task title cannot be empty.");
      return;
    }
    const newTask = {
      _id: Date.now().toString(),
      title: newTaskTitle,
      status: "todo",
      assignedTo: { name: "You" },
      dueAt: newTaskDueDate ? newTaskDueDate.toISOString() : null,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDueDate(null);
    toast.success("Task added successfully!");
  };

  const handleDateChange = (date) => {
    const newDate = date ? new Date(date) : new Date();
    if (newTaskDueDate) {
      newDate.setHours(newTaskDueDate.getHours());
      newDate.setMinutes(newTaskDueDate.getMinutes());
    }
    setNewTaskDueDate(newDate);
  };

  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate = newTaskDueDate || new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setNewTaskDueDate(newDate);
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="flex flex-col gap-2 mb-4">
        <Input
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !newTaskDueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newTaskDueDate ? (
                  format(newTaskDueDate, "PPP")
                ) : (
                  <span>Pick a due date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newTaskDueDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            className="w-[120px]"
            value={newTaskDueDate ? format(newTaskDueDate, "HH:mm") : ""}
            onChange={handleTimeChange}
          />
        </div>
        <Button onClick={handleAddTask}>Add Task</Button>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No tasks found for this conversation.
          </p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task._id} className="w-full">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold">
                      {task.title}
                    </CardTitle>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full
                         ${
                           task.status === "done" &&
                           "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                         }
                         ${
                           task.status === "in-progress" &&
                           "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                         }
                         ${
                           task.status === "todo" &&
                           "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                         }
                       `}
                    >
                      {task.status}
                    </span>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-2">
                    <span>
                      Assigned to: {task.assignedTo?.name || "Unassigned"}
                    </span>
                    {task.dueAt && (
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueAt).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={getGoogleCalendarLink(task)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📅 Add to Google Calendar
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// -------------------------
// Versions Tab
// -------------------------
const VersionsTab = ({ conversationId }) => {
  const { user } = useAuth();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repoUrl, setRepoUrl] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        // Using the two static links you provided
        const mockVersions = [
          {
            _id: "1",
            fileUrl: "https://github.com/TejasS1233/StockLearning2.0",
            note: "Initial prototype with core features",
            uploader: { name: "Client" },
            createdAt: "2025-08-20T10:00:00Z",
          },
          {
            _id: "2",
            fileUrl: "https://github.com/TejasS1233/Threadify",
            note: "Updated design with new animations",
            uploader: { name: "Student" },
            createdAt: "2025-08-21T11:30:00Z",
          },
        ];
        setVersions(mockVersions);
      } catch (error) {
        toast.error("Failed to load versions");
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [conversationId]);

  const handleAddVersion = () => {
    const githubUrlRegex =
      /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+(\/)?$/;

    if (repoUrl.trim() === "" || note.trim() === "") {
      toast.error("Please enter a GitHub repository link and a note.");
      return;
    }

    if (!githubUrlRegex.test(repoUrl.trim())) {
      toast.error("Please enter a valid GitHub repository URL.");
      return;
    }

    const newVersion = {
      _id: Date.now().toString(),
      fileUrl: repoUrl.trim(),
      note: note.trim(),
      uploader: { name: user?.name || "You" },
      createdAt: new Date().toISOString(),
    };
    setVersions((prevVersions) => [...prevVersions, newVersion]);
    setRepoUrl("");
    setNote("");
    toast.success("Version added successfully!");
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="flex flex-col gap-2 mb-4">
        <Input
          type="url"
          placeholder="Add a GitHub repository link..."
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <Textarea
          placeholder="Add a note for this version..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          onClick={handleAddVersion}
          disabled={!repoUrl.trim() || !note.trim()}
        >
          Add Version
        </Button>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading versions...
          </p>
        ) : versions.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No versions found for this project.
          </p>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <Card key={version._id} className="w-full">
                <CardHeader className="p-4">
                  <CardTitle className="text-xl font-bold">
                    {version.note || "Repository Version"}
                  </CardTitle>
                  <CardDescription className="flex flex-col items-start gap-2 mt-2">
                    <a
                      href={version.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      <Button variant="link" className="p-0 h-auto">
                        View Repository on GitHub
                      </Button>
                    </a>
                    <span>
                      Uploaded by: {version.uploader?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Uploaded on:{" "}
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// -------------------------
// Chat Tab Content (unchanged)
// -------------------------
const ChatTabContent = ({
  messages,
  loading,
  user,
  scrollRef,
  handleSend,
  input,
  setInput,
  setOpenNDA,
  setOpenPayment,
}) => (
  <>
    <ScrollArea className="flex-1 p-4 overflow-y-auto">
      {loading ? (
        <p className="text-center text-muted-foreground">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No messages yet. Start the conversation!
        </p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            const isMe = msg.sender?._id === user._id;
            return (
              <div
                key={idx}
                className={`flex items-end gap-2 ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isMe && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.sender?.profilePicture} />
                    <AvatarFallback>
                      {msg.sender?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl max-w-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  }`}
                >
                  {msg.content === "Non-Disclosure Agreement" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setOpenNDA(true)}
                    >
                      📄 Review Agreements
                    </Button>
                  ) : msg.content === "Payment Request" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => setOpenPayment(true)}
                    >
                      💳 View Payment Request
                    </Button>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>
      )}
    </ScrollArea>
    <div className="p-4 border-t bg-background flex items-center gap-2">
      <Input
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  </>
);

// -------------------------
// Main Chat Page (unchanged logic)
// -------------------------
export default function ChatPage() {
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [openNDA, setOpenNDA] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(5000);
  const [checkedDocs, setCheckedDocs] = useState({ gst: false, nda: false });
  const [agreementsAccepted, setAgreementsAccepted] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/chat/${conversationId}/messages`);
        setMessages(res.data?.data || []);
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    socket.emit("joinRoom", conversationId);
    socket.on("newMessage", (msg) => {
      if (msg.conversation === conversationId)
        setMessages((prev) => [...prev, msg]);
    });
    socket.on("chatError", (err) => {
      toast.error(err.message || "Chat error");
    });
    return () => {
      socket.off("newMessage");
      socket.off("chatError");
      socket.emit("leaveRoom", conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;
    const newMessage = {
      conversation: conversationId,
      sender: user._id,
      content: input.trim(),
    };
    try {
      const res = await axiosInstance.post(
        `/chat/${conversationId}/messages`,
        newMessage
      );
      const savedMessage = res.data?.data;
      socket.emit("sendMessage", savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
      setInput("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleSendNDA = async () => {
    if (!conversationId) return;
    try {
      const ndaMessage = {
        conversation: conversationId,
        sender: user._id,
        content: "Non-Disclosure Agreement",
      };
      const res = await axiosInstance.post(
        `/chat/${conversationId}/messages`,
        ndaMessage
      );
      const savedMessage = res.data?.data;
      socket.emit("sendMessage", savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
      toast.success("NDA Agreement sent!");
    } catch {
      toast.error("Failed to send NDA agreement");
    }
  };

  const handleSendPaymentRequest = async () => {
    if (!conversationId) return;
    try {
      const paymentMessage = {
        conversation: conversationId,
        sender: user._id,
        content: "Payment Request",
      };
      const res = await axiosInstance.post(
        `/chat/${conversationId}/messages`,
        paymentMessage
      );
      const savedMessage = res.data?.data;
      socket.emit("sendMessage", savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
      toast.success("Payment request sent!");
    } catch {
      toast.error("Failed to send payment request");
    }
  };

  const handleConfirmAgreements = () => {
    setAgreementsAccepted(true);
    setOpenNDA(false);
    toast.success("Agreements accepted!");
  };

  const handlePayment = async () => {
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    if (paymentAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      const orderResponse = await axiosInstance.post(
        `/payments/create-order`,
        { amount: paymentAmount, currency: "INR" },
        { withCredentials: true }
      );
      const orderData = orderResponse.data.data;
      if (!orderData) {
        toast.error("Could not create payment order.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Payment Mock",
        description: "Test Transaction & Blockchain Log",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verificationResponse = await axiosInstance.post(
              `/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: paymentAmount,
                currency: "INR",
              },
              { withCredentials: true }
            );
            const verificationData = verificationResponse.data.data;
            toast.success(
              "Payment Verified! Tx Hash: " + verificationData.blockchainTxHash
            );
          } catch {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.fullname || "Test User",
          email: user?.email || "test.user@example.com",
          contact: user?.phoneNumber || "9999999999",
        },
        notes: { address: "Test Corporate Office" },
        theme: { color: "#3399cc" },
      };

      if (import.meta.env.DEV) {
        options.prefill.method = "upi";
        options.prefill.vpa = "success@razorpay";
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", () => toast.error("Payment Failed"));
    } catch {
      toast.error("Payment process failed.");
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-screen">
      {/* Tab Header */}
      <header className="p-4 border-b bg-background flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </Button>
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks
          </Button>
          <Button
            variant={activeTab === "versions" ? "default" : "ghost"}
            onClick={() => setActiveTab("versions")}
          >
            Versions
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "todo" ? "default" : "ghost"}
            onClick={() => setActiveTab("todo")}
          >
            To-do
          </Button>
          {user?.role === "client" && activeTab === "chat" && (
            <Button variant="outline" onClick={handleSendNDA}>
              Send NDA Agreement
            </Button>
          )}
          {user?.role === "student" &&
            agreementsAccepted &&
            activeTab === "chat" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSendPaymentRequest}
              >
                💳 Request Payment
              </Button>
            )}
        </div>
      </header>

      {/* Conditional Content based on active tab */}
      {activeTab === "chat" && (
        <ChatTabContent
          messages={messages}
          loading={loading}
          user={user}
          scrollRef={scrollRef}
          handleSend={handleSend}
          input={input}
          setInput={setInput}
          setOpenNDA={setOpenNDA}
          setOpenPayment={setOpenPayment}
        />
      )}
      {activeTab === "tasks" && <TasksTab conversationId={conversationId} />}
      {activeTab === "versions" && (
        <VersionsTab conversationId={conversationId} />
      )}
      {activeTab === "todo" && <TodoTab />}

      {/* NDA Modal */}
      <Dialog open={openNDA} onOpenChange={setOpenNDA}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Required Agreements</DialogTitle>
            <DialogDescription>
              Review and accept all agreements to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gst-check"
                checked={checkedDocs.gst}
                onChange={(e) =>
                  setCheckedDocs((prev) => ({ ...prev, gst: e.target.checked }))
                }
              />
              <label
                htmlFor="gst-check"
                className="text-sm text-muted-foreground"
              >
                I agree to the{" "}
                <a
                  href="/docs/GST.pdf"
                  target="_blank"
                  className="underline text-primary"
                >
                  GST Agreement
                </a>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="nda-check"
                checked={checkedDocs.nda}
                onChange={(e) =>
                  setCheckedDocs((prev) => ({ ...prev, nda: e.target.checked }))
                }
              />
              <label
                htmlFor="nda-check"
                className="text-sm text-muted-foreground"
              >
                I agree to the{" "}
                <a
                  href="/docs/NDA.pdf"
                  target="_blank"
                  className="underline text-primary"
                >
                  NDA Agreement
                </a>
              </label>
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            disabled={!checkedDocs.gst || !checkedDocs.nda}
            onClick={handleConfirmAgreements}
          >
            Confirm & Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={openPayment} onOpenChange={setOpenPayment}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Request</DialogTitle>
            <DialogDescription>
              Complete the payment securely using Razorpay.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {user?.name} has requested payment for this project.
            </p>
            <Input
              type="number"
              placeholder="Enter amount..."
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
            />
            <p className="text-lg font-semibold">Amount: ₹{paymentAmount}</p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handlePayment}
            >
              Pay Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
