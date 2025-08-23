import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, GraduationCap } from "lucide-react";

export default function GetStartedPage() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = () => {
    if (role) {
      navigate(`/signup-${role}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="text-2xl font-semibold mb-8">
        Join as a client or Student
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-3xl">
        {/* Business Option */}
        <Card
          onClick={() => handleSelect("business")}
          className={`p-6 cursor-pointer border-2 rounded-xl flex flex-col items-start transition ${
            role === "business" ? "border-blue-500" : "border-muted"
          }`}
        >
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6" />
            <span className="text-lg font-medium">
              I&apos;m a client, hiring for a project
            </span>
          </div>
        </Card>

        {/* Student Option */}
        <Card
          onClick={() => handleSelect("student")}
          className={`p-6 cursor-pointer border-2 rounded-xl flex flex-col items-start transition ${
            role === "student" ? "border-blue-500" : "border-muted"
          }`}
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-medium">
              I&apos;m a Student, looking for work
            </span>
          </div>
        </Card>
      </div>

      {/* Create Account Button */}
      <Button className="w-48" onClick={handleSubmit} disabled={!role}>
        Create Account
      </Button>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <a href="/login" className="text-green-600 hover:underline">
          Log In
        </a>
      </p>
    </div>
  );
}
