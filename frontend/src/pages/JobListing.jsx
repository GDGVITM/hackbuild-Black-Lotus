import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProposalModal from "@/components/ProposalModal";
import axiosInstance from "@/lib/axios";

export default function FindWork() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("projects/", {
          params: { page: 1, limit: 10 },
        });

        const projects = Array.isArray(res.data?.data?.projects) ? res.data.data.projects : [];

        setJobs(projects);
      } catch (err) {
        console.error("Error loading jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post("recommend", { query });
      const data = res.data;
      if (Array.isArray(data?.data?.jobs)) {
        setJobs(data.data.jobs);
      } else if (Array.isArray(data?.data)) {
        setJobs(data.data);
      } else {
        setJobs([]);
      }
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
    <div className="p-6 space-y-6 min-h-screen">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(jobs) && jobs.length > 0 ? (
          jobs.map((job, idx) => (
            <Card key={idx} className="transition-transform hover:scale-105">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <BookmarkIcon className="h-5 w-5 cursor-pointer" />
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">{job.rate}</span>
                  <span>•</span>
                  <span>{job.company}</span>
                </div>
                <p className="text-sm">{job.description}</p>
                {job.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.skills_required.map((skill, i) => (
                      <Badge key={i}>{skill}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <Button onClick={() => handleAddProposal(job)}>Add Proposal</Button>
                  <a href={job.link || "#"}>
                    <Button variant="link">
                      View Details <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        ) : !loading ? (
          <p className="col-span-full text-center">No jobs found. Try another search.</p>
        ) : (
          <p className="col-span-full text-center">Loading jobs...</p>
        )}
      </div>

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
