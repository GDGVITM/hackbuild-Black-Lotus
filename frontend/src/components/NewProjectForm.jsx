import { useState } from "react";
import axiosInstance from "@/lib/axios";

export default function NewProjectForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    budget: "",
    deadline: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axiosInstance.post("/projects", {
        title: formData.title,
        description: formData.description,
        skillsRequired: formData.skills.split(",").map((s) => s.trim()),
        budget: Number(formData.budget),
        deadline: formData.deadline,
      });

      console.log("✅ Project posted:", response.data);
      alert("Project posted successfully!");

      setFormData({
        title: "",
        description: "",
        skills: "",
        budget: "",
        deadline: "",
      });
    } catch (error) {
      console.error(
        "❌ Error posting project:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Failed to post project.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div>
        <label className="block font-semibold">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Skills (comma separated)</label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Budget</label>
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Deadline</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Post Project
      </button>
    </form>
  );
}
