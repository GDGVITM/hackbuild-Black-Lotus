import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProposalModal from "@/components/ProposalModal";

export default function FindWork() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    // Function to fetch projects from the local JSON file
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Fetch data from the local jobs.json file
        const res = await fetch("/jobs.json");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error loading jobs from jobs.json:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // The empty dependency array ensures this runs once when the component mounts

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (data?.data?.jobs) {
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

  // Function to handle the opening of the proposal modal
  const handleAddProposal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen text-gray-100 font-sans">
      {/* Search Bar */}
      <div className="flex space-x-2 mb-6 max-w-2xl mx-auto">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your skills (e.g. React, Python, Design)"
          className="bg-gray-800 border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {loading ? "Finding..." : "Find Jobs"}
        </Button>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 && !loading ? (
          <p className="text-gray-400 text-lg col-span-full text-center">
            No jobs found. Try another search.
          </p>
        ) : loading ? (
          <p className="text-gray-400 text-lg col-span-full text-center">
            Loading jobs...
          </p>
        ) : (
          jobs.map((job, idx) => (
            <Card
              key={idx}
              className="relative rounded-2xl shadow-xl transition-transform transform hover:scale-105 bg-gray-800 text-gray-100 border border-gray-700"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-semibold leading-tight">
                    {job.title}
                  </h2>
                  <BookmarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-300 cursor-pointer ml-4" />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className="font-medium text-lg text-green-400">
                    {job.rate}
                  </span>
                  <span>•</span>
                  <span>{job.company}</span>
                </div>
                <p className="text-sm text-gray-400">{job.description}</p>

                {job.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.skills_required.map((skill, i) => (
                      <Badge
                        key={i}
                        className="bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-full px-3 py-1 text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between space-x-2 mt-4">
                  <Button
                    onClick={() => handleAddProposal(job)}
                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    <span>Add Proposal</span>
                  </Button>
                  <a
                    href={job.link || "#"}
                    className="flex items-center space-x-1"
                  >
                    <Button
                      variant="link"
                      className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      View Details
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
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
