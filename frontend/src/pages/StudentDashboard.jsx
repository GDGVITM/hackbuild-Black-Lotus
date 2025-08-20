import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bell,
  Star,
  CheckCircle2,
  Hourglass,
  MessagesSquare,
  ClipboardList,
  Search,
  CheckCircle,
} from "lucide-react";

// Mock data for the dashboard
const studentData = {
  name: "Alex",
  metrics: [
    { title: "Active Projects", value: 3, icon: ClipboardList },
    { title: "Completed", value: 12, icon: CheckCircle2 },
    { title: "Total Earned", value: "$2,450", icon: "$", currency: true },
    { title: "Rating", value: "4.8", icon: Star },
    { title: "Profile Views", value: 234, icon: "eye" },
  ],
  recentProjects: [
    {
      title: "E-commerce Website Development",
      status: "in progress",
      client: "TechStore Inc.",
      cost: "$1,500",
      dueDate: "Dec 15, 2024",
      progress: 75,
    },
    {
      title: "Mobile App UI Design",
      status: "completed",
      client: "StartupXYZ",
      cost: "$800",
      dueDate: "Nov 28, 2024",
      progress: 100,
    },
    {
      title: "Content Management System",
      status: "pending review",
      client: "Local Business",
      cost: "$1,200",
      dueDate: "Dec 10, 2024",
      progress: 95,
    },
  ],
};

const QuickActionCard = ({ icon: Icon, title, description }) => (
  <Card className="flex flex-col items-center text-center p-6 transition-transform transform hover:scale-[1.02] cursor-pointer hover:bg-gray-100">
    <Icon size={32} className="text-gray-800 mb-2" />
    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </Card>
);

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header and Call to Action */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {studentData.name}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your projects
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
            Browse New Jobs
          </Button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {studentData.metrics.map((metric, index) => (
          <Card key={index} className="shadow-lg p-4">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex items-center gap-2">
              {metric.currency && (
                <span className="text-2xl font-bold tracking-tight">
                  {metric.value}
                </span>
              )}
              {metric.icon === Star ? (
                <span className="text-2xl font-bold tracking-tight flex items-center">
                  {metric.value}{" "}
                  <Star
                    size={20}
                    className="text-yellow-400 fill-current ml-1"
                  />
                </span>
              ) : metric.icon !== "$" && !metric.currency ? (
                <span className="text-2xl font-bold tracking-tight">
                  {metric.value}
                </span>
              ) : null}
              {metric.icon !== Star && metric.icon !== "$" && (
                <metric.icon size={20} className="text-gray-400" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects Section */}
      <h2 className="text-2xl font-bold tracking-tight mb-4 mt-8">
        Recent Projects
      </h2>
      <p className="text-gray-500 mb-6">
        Your active and recently completed work
      </p>
      <div className="space-y-4">
        {studentData.recentProjects.map((project, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Client: {project.client}
                </p>
                <div className="flex items-center text-sm mt-2">
                  <span className="font-semibold text-gray-700">
                    {project.cost}
                  </span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="text-gray-500">Due: {project.dueDate}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge
                  variant={
                    project.status === "completed"
                      ? "secondary"
                      : project.status === "in progress"
                        ? "default"
                        : "outline"
                  }
                  className={
                    project.status === "completed"
                      ? "bg-green-100 text-green-700 border-green-700"
                      : project.status === "in progress"
                        ? "bg-blue-100 text-blue-700 border-blue-700"
                        : "bg-yellow-100 text-yellow-700 border-yellow-700"
                  }
                >
                  {project.status}
                </Badge>
                <div className="flex items-center mt-2 w-32">
                  <Progress value={project.progress} className="h-2" />
                  <span className="ml-2 text-sm text-gray-500">
                    {project.progress}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions Section */}
      <h2 className="text-2xl font-bold tracking-tight mb-6 mt-8">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          icon={MessagesSquare}
          title="Messages"
          description="Check client communications"
        />
        <QuickActionCard
          icon={ClipboardList}
          title="Manage Projects"
          description="Update progress and deliverables"
        />
        <QuickActionCard
          icon={Search}
          title="Find New Work"
          description="Browse available opportunities"
        />
      </div>
    </div>
  );
}
