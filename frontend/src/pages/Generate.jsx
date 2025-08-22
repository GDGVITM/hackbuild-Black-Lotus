import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Generate() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [skills, setSkills] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Load jobs.json
  useEffect(() => {
    fetch("/jobs.json")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error loading jobs.json:", err));
  }, []);

  const handleGenerateProposal = async () => {
    if (!selectedJob || !skills) {
      alert("Please select a job and enter your skills");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: selectedJob,
          user_skills: skills,
        }),
      });

      const data = await res.json();
      setProposal(data.proposal || "No proposal generated.");
    } catch (err) {
      console.error("Error generating proposal:", err);
      setProposal("⚠️ Error generating proposal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen text-gray-100">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-100">
            AI-Powered Proposal Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select Job */}
          <select
            className="w-full p-2 rounded bg-gray-700 text-gray-100"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">-- Select a Job --</option>
            {jobs.map((job, idx) => (
              <option key={idx} value={job.title}>
                {job.title} @ {job.company}
              </option>
            ))}
          </select>

          {/* Enter Skills */}
          <Textarea
            placeholder="Enter your skills (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="bg-gray-700 text-gray-100"
          />

          {/* Generate Proposal */}
          <Button onClick={handleGenerateProposal} disabled={loading}>
            {loading ? "Generating..." : "Generate Proposal"}
          </Button>

          {/* Proposal Output */}
          {proposal && (
            <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-lg whitespace-pre-wrap">
              {proposal}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
