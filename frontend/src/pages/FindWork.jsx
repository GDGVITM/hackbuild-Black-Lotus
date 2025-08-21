import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FindWork() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load default jobs from jobs.json
  useEffect(() => {
    fetch("/jobs.json")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error loading jobs.json:", err));
  }, []);

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

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen text-gray-100">
      {/* Search */}
      <div className="flex space-x-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your skills (e.g. React, Python, Design)"
          className="bg-gray-800 border-gray-700 text-gray-100"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Finding..." : "Find Jobs"}
        </Button>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 ? (
          <p className="text-gray-400 text-lg col-span-full text-center">
            No jobs found. Try another search.
          </p>
        ) : (
          jobs.map((job, idx) => (
            <a key={idx} href={job.link || "#"} className="block group">
              <Card className="relative rounded-2xl shadow-xl transition-transform transform group-hover:scale-105 bg-gray-800 text-gray-100 border border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                  <CardTitle className="text-xl font-bold">{job.rate}</CardTitle>
                  <BookmarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-300 cursor-pointer" />
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <h2 className="text-2xl font-semibold">{job.title}</h2>
                  <p className="text-sm text-gray-400">{job.description}</p>

                  {job.skills_required?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skills_required.map((skill, i) => (
                        <Badge
                          key={i}
                          className="bg-gray-700 text-gray-300 hover:bg-gray-600"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-4">
                    <span className="text-sm text-gray-400">{job.company}</span>
                    <Badge className="ml-auto flex items-center space-x-1 bg-gray-700 text-gray-300 hover:bg-gray-600">
                      <span className="text-sm">View</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
