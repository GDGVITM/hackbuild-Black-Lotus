// src/pages/ManageProjects.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get("/projects");
      let data = response.data;

      // Ensure it's always an array
      if (!Array.isArray(data)) {
        data = [data];
      }

      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Projects</h1>

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && projects.length === 0 && <p>No projects found.</p>}

      {!loading && projects.length > 0 && (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Title</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Skills</th>
              <th className="border p-2">Budget</th>
              <th className="border p-2">Deadline</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project._id}>
                <td className="border p-2">{project.title}</td>
                <td className="border p-2">{project.description}</td>
                <td className="border p-2">
                  {project.skillsRequired?.join(", ")}
                </td>
                <td className="border p-2">₹{project.budget}</td>
                <td className="border p-2">
                  {new Date(project.deadline).toLocaleDateString()}
                </td>
                <td className="border p-2">{project.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageProjects;
