import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProposalModal from "@/components/ProposalModal";
import axiosInstance from "@/lib/axios";
import axios from "axios";

export default function FindWork() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // 🔹 Normalize any API response into a consistent job shape
  const normalizeJobs = (rawJobs) => {
    if (!Array.isArray(rawJobs)) return [];
    return rawJobs.map((job, index) => ({
      _id: job._id || index, // fallback key
      title: job.title || "Untitled Job",
      description: job.description || "No description provided.",
      budget: job.budget || job.rate || "N/A",
      deadline: job.deadline || null,
      client: {
        fullname: job.client?.fullname || job.company || "Unknown Client",
        avatar: job.client?.avatar || null,
      },
      skillsRequired: job.skillsRequired || job.skills_required || [],
      link: job.link || null,
    }));
  };

  // 🔹 Initial jobs fetch
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("projects/", {
          params: { page: 1, limit: 20 },
        });

        const projects = Array.isArray(res.data?.data?.projects)
          ? res.data.data.projects
          : [];

        setJobs(normalizeJobs(projects));
      } catch (err) {
        console.error("Error loading jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 🔹 Search handler
  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/recommend", {
        query,
      });
      const data = res.data;

      let jobsList = [];
      if (Array.isArray(data?.jobs)) {
        jobsList = normalizeJobs(data.jobs);
      } else if (Array.isArray(data?.data?.jobs)) {
        jobsList = normalizeJobs(data.data.jobs);
      } else if (Array.isArray(data?.data)) {
        jobsList = normalizeJobs(data.data);
      }

      setJobs(jobsList);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProposal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 p-6 space-y-6 min-h-screen">
      {/* Search bar */}
      <div className="flex space-x-2 mb-6 max-w-2xl mx-auto">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your skills"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Finding..." : "Find Jobs"}
        </Button>
      </div>

      {/* Jobs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(jobs) && jobs.length > 0 ? (
          jobs.map((job) => (
            <Card
              key={job._id}
              className="transition-transform hover:scale-105"
            >
              <CardContent className="p-6 space-y-4">
                {/* Title + bookmark */}
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <BookmarkIcon className="h-5 w-5 cursor-pointer" />
                </div>

                {/* Client info */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {job.client?.avatar && (
                    <img
                      src={job.client.avatar}
                      alt={job.client.fullname}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{job.client?.fullname}</span>
                </div>

                {/* Description */}
                <p className="text-sm">{job.description}</p>

                {/* Skills */}
                {job.skillsRequired?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.skillsRequired.map((skill, i) => (
                      <Badge key={i}>{skill}</Badge>
                    ))}
                  </div>
                )}

                {/* Budget + Deadline */}
                <div className="text-sm text-muted-foreground mt-2">
                  <p>
                    <span className="font-medium">Rate/Budget:</span>{" "}
                    {job.budget}
                  </p>
                  {job.deadline && (
                    <p>
                      <span className="font-medium">Deadline:</span>{" "}
                      {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                  <Button onClick={() => handleAddProposal(job)}>
                    Add Proposal
                  </Button>
                  {job.link && (
                    <Button variant="link" asChild>
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Details <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : !loading ? (
          <p className="col-span-full text-center">
            No jobs found. Try another search.
          </p>
        ) : (
          <p className="col-span-full text-center">Loading jobs...</p>
        )}
      </div>

      {/* Proposal modal */}
      {selectedJob && (
        <ProposalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={selectedJob}
        />
      )}
    </div>
  );
}
