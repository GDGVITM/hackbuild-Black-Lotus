// src/components/Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // 👈 default role
  const navigate = useNavigate();

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Handles login form submission
 * @param {React.FormEvent<HTMLFormElement>} e - form submission event
 * @returns {Promise<void>}
 */
/*******  c39da5e1-5c78-4eee-848b-80c6fcd9b2ed  *******/  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 👇 dynamic endpoint based on role
      const url =
        role === "student"
          ? "http://localhost:8001/api/v1/users/student/login"
          : "http://localhost:8001/api/v1/users/business/login";

      const res = await axios.post(
        url,
        { email, password },
        { withCredentials: true }
      );

      const user = res.data?.data?.user;
      if (!user) {
        alert("Login failed. Try again.");
        return;
      }

      // ✅ redirect based on backend role
      if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "business") {
        navigate("/business/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Login error. Please check credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selector */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="student">Student</option>
                <option value="business">Business</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
