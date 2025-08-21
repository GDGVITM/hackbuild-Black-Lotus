// src/pages/BusinessDashboard.jsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom"; // Import Link for routing
import {
  Star,
  ClipboardList,
  Users,
  MessageSquare,
  Briefcase,
  Search,
} from "lucide-react";

// Mock business data
const businessData = {
  name: "TechCorp",
  metrics: [
    { title: "Active Projects", value: 5, icon: ClipboardList },
    { title: "Completed", value: 18, icon: Briefcase },
    { title: "Total Spent", value: "$8,750", icon: "$", currency: true },
    { title: "Avg Rating Given", value: "4.6", icon: Star },
    { title: "Saved Talent", value: 15, icon: Users },
  ],
  activeProjects: [
    {
      title: "E-commerce Website Development",
      status: "in progress",
      freelancer: "Alex Johnson",
      cost: "$1,500",
      dueDate: "Dec 15, 2024",
      progress: 75,
    },
    {
      title: "Mobile App UI Design",
      status: "completed",
      freelancer: "Alex Johnson",
      cost: "$800",
      dueDate: "Nov 28, 2024",
      progress: 100,
    },
    {
      title: "Content Management System",
      status: "pending review",
      freelancer: "Alex Johnson",
      cost: "$1,200",
      dueDate: "Dec 10, 2024",
      progress: 95,
    },
  ],
};

const QuickActionCard = ({ icon: Icon, title, description, to }) => (
  <Link to={to}>
    <Card className="flex flex-col items-center text-center p-6 transition-transform transform hover:scale-[1.02] cursor-pointer hover:bg-gray-100">
      <Icon size={32} className="text-gray-800 mb-2" />
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Card>
  </Link>
);

export default function BusinessDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header and CTA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {businessData.name}!
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your projects and find new talent
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">Find Talent</Button>
          <Link to="/post-project">
            <Button className="bg-black hover:bg-gray-800 text-white font-semibold">
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {businessData.metrics.map((metric, index) => (
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
                  {metric.value}
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

      {/* Active Projects */}
      <h2 className="text-2xl font-bold tracking-tight mb-4 mt-8">
        Active Projects
      </h2>
      <p className="text-gray-500 mb-6">
        Monitor progress on your current projects
      </p>
      <div className="space-y-4">
        {businessData.activeProjects.map((project, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Freelancer: {project.freelancer}
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

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold tracking-tight mb-6 mt-8">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          icon={Search}
          title="Browse Talent"
          description="Find skilled student freelancers"
          to="/find-talent"
        />
        <QuickActionCard
          icon={MessageSquare}
          title="Messages"
          description="Communicate with freelancers"
          to="/messages"
        />
        <QuickActionCard
          icon={Briefcase}
          title="Manage Projects"
          description="Review deliverables and payments"
          to="/manage-projects"
        />
      </div>
    </div>
  );
}
