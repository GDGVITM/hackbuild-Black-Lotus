import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BusinessDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Fetch Projects
  useEffect(() => {
    if (!user?._id) return;
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`/projects/client/${user._id}`);
        setProjects(res.data.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [user]);

  // Fetch Payments
  useEffect(() => {
    if (!user?._id) return;
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`/payments/all`);
        setPayments(res.data.data);
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();
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
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.fullname ? `, ${user.fullname}` : ""}!
          </h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline">Find Talent</Button>
            <Link to="/job-posting">
              <Button>Post New Job</Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="statistics" className="w-full">
          <TabsList>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">Statistics</h2>
              <p className="text-muted-foreground">
                Overview of your business performance will appear here.
              </p>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Projects</h2>

              {loadingProjects ? (
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
                      {/* Left: Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {project.title}
                        </h3>

                        {/* Skills */}
                        {project.skillsRequired?.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-3">
                            {project.skillsRequired.map((skill, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Freelancer */}
                        <p className="text-muted-foreground text-sm mt-2">
                          Freelancer: {project.freelancer?.name || "Unassigned"}
                        </p>

                        {/* Budget, Deadline, Created At */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm">
                          <span>
                            <span className="font-medium">Budget:</span>{" "}
                            <Badge className="bg-green-100 text-green-700">
                              ${project.budget || "—"}
                            </Badge>
                          </span>
                          <span>
                            <span className="font-medium">Deadline:</span>{" "}
                            {project.deadline
                              ? new Date(project.deadline).toLocaleDateString()
                              : "—"}
                          </span>
                          <span>
                            <span className="font-medium">Created At:</span>{" "}
                            {project.createdAt
                              ? new Date(project.createdAt).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status + Progress + Actions */}
                      <div className="flex flex-col items-end space-y-2 min-w-[140px]">
                        <Badge
                          variant="outline"
                          className={
                            project.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : project.status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : project.status === "open"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                          }
                        >
                          {project.status}
                        </Badge>

                        {project.progress !== undefined && (
                          <div className="flex items-center mt-2 w-32">
                            <Progress
                              value={project.progress}
                              className="h-2"
                            />
                            <span className="ml-2 text-sm text-muted-foreground">
                              {project.progress}%
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col space-y-2 mt-2 w-full">
                          <Link to={`/chat/${project._id}`}>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full"
                            >
                              Open Chat
                            </Button>
                          </Link>
                          <Link to={`/job/${project._id}`}>
                            <Button size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Payments</h2>

              {loadingPayments ? (
                <p className="text-sm text-muted-foreground">
                  Loading payments...
                </p>
              ) : payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No payments found.
                </p>
              ) : (
                payments.map((payment) => (
                  <Card key={payment._id} className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                      {/* Left: Payment Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          Payment #{payment.razorpay_payment_id}
                        </h3>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Amount:</span>{" "}
                          <Badge className="bg-blue-100 text-blue-700">
                            {payment.amount} {payment.currency}
                          </Badge>
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Right: Status + Action */}
                      <div className="flex flex-col items-end justify-between space-y-2 min-w-[140px]">
                        <Badge
                          variant="outline"
                          className={
                            payment.status === "captured"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {payment.status}
                        </Badge>

                        <Link to={`/payment/${payment._id}`} className="w-full">
                          <Button size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
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
