import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, CheckCircle2, DollarSign, Star } from "lucide-react";

const getStatusClasses = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-primary/10 text-primary";
    case "in-progress":
      return "bg-secondary/20 text-secondary-foreground";
    case "open":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    earned: 0,
    rating: user?.rating || 0,
  });

  useEffect(() => {
    if (!user?._id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, paymentsRes] = await Promise.all([
          axios.get(`/projects/freelancer/${user._id}`),
          axios.get(`/payments/freelancer/${user._id}`),
        ]);

        const fetchedProjects = projectsRes.data.data || [];
        const fetchedPayments = paymentsRes.data.data || [];

        setProjects(fetchedProjects);
        setPayments(fetchedPayments);

        const activeProjects = fetchedProjects.filter(
          (p) => p.status === "in-progress"
        ).length;
        const completedProjects = fetchedProjects.filter(
          (p) => p.status === "completed"
        ).length;
        const totalEarned = fetchedPayments
          .filter((p) => p.status === "captured")
          .reduce((sum, p) => sum + p.amount, 0);

        setStats({
          active: activeProjects,
          completed: completedProjects,
          earned: totalEarned,
          rating: user?.rating || 4.8,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
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

  const metrics = [
    { title: "Active Projects", value: stats.active, icon: ClipboardList },
    { title: "Completed", value: stats.completed, icon: CheckCircle2 },
    {
      title: "Total Earned",
      value: `$${stats.earned.toFixed(2)}`,
      icon: DollarSign,
    },
    { title: "Rating", value: stats.rating.toFixed(1), icon: Star },
  ];

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
            <Link to="/jobs">
              <Button>Browse New Jobs</Button>
            </Link>
          </div>
        </div>

        {/* Stats cards */}
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

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">My Projects</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading projects...
                </p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No projects found.
                </p>
              ) : (
                projects.map((project) => (
                  <Card key={project._id} className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {project.title}
                        </h3>
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
                        <Badge
                          variant="outline"
                          className={getStatusClasses(project.status)}
                        >
                          {project.status}
                        </Badge>
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
                ))
              )}
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
                    <Badge
                      className={
                        payment.status === "captured"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {payment.status}
                    </Badge>
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
