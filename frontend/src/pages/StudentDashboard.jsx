import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, CheckCircle2, DollarSign, Star } from "lucide-react";

// ✅ static metrics only
const metrics = [
  { title: "Active Projects", value: 5, icon: ClipboardList },
  { title: "Completed", value: 12, icon: CheckCircle2 },
  { title: "Total Earned", value: "$1,250.00", icon: DollarSign },
  { title: "Rating", value: "4.8", icon: Star },
];

// ✅ 5 random static projects
const staticProjects = [
  {
    _id: "68a9aa8829600594031d9741",
    client: { fullname: "Omar Rakhe" },
    title: "Job 1234",
    budget: 100,
    deadline: "2025-08-30T18:30:00.000Z",
    progress: 40,
  },
  {
    _id: "68a94bafab8439bcb9804c42",
    client: { fullname: "Raj Malhotra" },
    title: "Event Booking System",
    budget: 30,
    deadline: "2025-09-15T18:30:00.000Z",
    progress: 100,
  },
  {
    _id: "68a94bafab8439bcb9804c3c",
    client: { fullname: "Omar Rakhe" },
    title: "IoT Project",
    budget: 40,
    deadline: "2025-09-22T18:30:00.000Z",
    progress: 90,
  },
  {
    _id: "68a94bafab8439bcb9804c38",
    client: { fullname: "Simran Kaur" },
    title: "Chat Application",
    budget: 30,
    deadline: "2025-09-15T18:30:00.000Z",
    progress: 100,
  },
  {
    _id: "68a94baeab8439bcb9804c24",
    client: { fullname: "Omar Rakhe" },
    title: "AI Chatbot",
    budget: 30,
    deadline: "2025-09-20T18:30:00.000Z",
    progress: 75,
  },
];

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const paymentsRes = await axios.get(`/payments/freelancer/${user._id}`);
        setPayments(paymentsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading user...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back{user?.fullname ? `, ${user.fullname}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your projects.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/job-listing">
              <Button>Browse New Jobs</Button>
            </Link>
            <Link to="/rate-benchmark">
              <Button variant="outline">Rate Benchmark</Button>
            </Link>
          </div>
        </div>

        {/* Stats cards (static) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="shadow-sm p-4">
              <CardHeader className="p-0 mb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon size={20} className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <span className="text-2xl font-bold tracking-tight flex items-center">
                  {metric.value}
                  {metric.icon === Star && (
                    <Star
                      size={20}
                      className="text-yellow-500 fill-current ml-1"
                    />
                  )}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Projects Tab (Static 5 Projects) */}
          <TabsContent value="projects" className="mt-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">My Projects</h2>
              {staticProjects.map((project) => (
                <Card key={project._id} className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mt-2">
                        Client: {project.client?.fullname || "N/A"}
                      </p>
                      <div className="flex items-center text-sm mt-2">
                        <span className="font-semibold">
                          ${project.budget || "—"}
                        </span>
                        <span className="text-muted-foreground mx-2">|</span>
                        <span className="text-muted-foreground">
                          Due:{" "}
                          {project.deadline
                            ? new Date(project.deadline).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end space-y-3">
                      <div className="flex items-center w-32">
                        <Progress
                          value={project.progress || 0}
                          className="h-2"
                        />
                        <span className="ml-2 text-sm text-muted-foreground">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Link to={`/chat/${project._id}`}>
                          <Button size="sm" variant="secondary">
                            Open Chat
                          </Button>
                        </Link>
                        <Link to={`/job/${project._id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="mt-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Earnings History</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading earnings...
                </p>
              ) : payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No payments found.
                </p>
              ) : (
                payments.map((payment) => (
                  <Card
                    key={payment._id}
                    className="p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">
                        Project: {payment.project?.title || "N/A"}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${payment.amount} {payment.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
