import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchJobAndProposals = async () => {
      try {
        const jobRes = await axios.get(`/projects/${id}`);
        const jobData = jobRes.data.data;
        setJob(jobData);

        const proposalsRes = await axios.get(
          `/proposals/projects/${id}/proposals`
        );
        setProposals(proposalsRes.data.data);
      } catch (err) {
        console.error("Error fetching job details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndProposals();
  }, [id]);

  const handleProposalStatus = async (proposalIds, status) => {
    try {
      await Promise.all(
        proposalIds.map((proposalId) =>
          axios.patch(`/proposals/${proposalId}/status`, { status })
        )
      );

      setProposals((prev) =>
        prev.map((p) => (proposalIds.includes(p._id) ? { ...p, status } : p))
      );

      if (status === "accepted") {
        setJob((prev) => ({ ...prev, status: "in-progress" }));
      }

      setSelected([]);
    } catch (err) {
      console.error("Error updating proposal status:", err);
    }
  };

  const toggleSelect = (proposalId) => {
    setSelected((prev) =>
      prev.includes(proposalId)
        ? prev.filter((id) => id !== proposalId)
        : [...prev, proposalId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Job not found
      </div>
    );
  }

  const filteredProposals = proposals.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.student?.fullname?.toLowerCase().includes(query) ||
      p.student?.skills?.some((s) => s.toLowerCase().includes(query)) ||
      p.coverLetter?.toLowerCase().includes(query)
    );
  });

  const acceptedCount = proposals.filter((p) => p.status === "accepted").length;
  const computedJobStatus =
    job.status === "completed" || job.status === "cancelled"
      ? job.status
      : acceptedCount > 0
        ? "in-progress"
        : "open";

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Card className="p-6 flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <Badge
                variant="outline"
                className={
                  computedJobStatus === "completed"
                    ? "bg-green-100 text-green-700"
                    : computedJobStatus === "in-progress"
                      ? "bg-blue-100 text-blue-700"
                      : computedJobStatus === "open"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                }
              >
                {computedJobStatus}
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              {job.skillsRequired?.map((skill, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            {job.description && (
              <div className="text-muted-foreground mt-2 max-h-100 overflow-y-auto rounded-md border p-3 max-w-230">
                {job.description.split("\n").map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 text-sm text-right">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-green-100 text-green-700 font-semibold">
                Budget: ${job.budget || "—"}
              </span>
            </div>
            <div>
              <span className="font-medium">Created At:</span>{" "}
              {job.createdAt
                ? new Date(job.createdAt).toLocaleDateString()
                : "—"}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Proposals</h2>
            <Input
              placeholder="Search proposals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>

          {selected.length > 0 && (
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                onClick={() => handleProposalStatus(selected, "accepted")}
              >
                Accept Selected ({selected.length})
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleProposalStatus(selected, "rejected")}
              >
                Reject Selected ({selected.length})
              </Button>
            </div>
          )}

          {filteredProposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals found.</p>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => (
                <Card key={proposal._id} className="p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    {proposal.status === "submitted" && (
                      <Checkbox
                        checked={selected.includes(proposal._id)}
                        onCheckedChange={() => toggleSelect(proposal._id)}
                      />
                    )}
                    <img
                      src={proposal.student?.avatar}
                      alt={proposal.student?.fullname}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">
                        {proposal.student?.fullname}
                      </h4>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {proposal.student?.skills?.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm mt-2">
                    <div>
                      <span className="font-medium">Rate:</span> $
                      {proposal.proposedRate} <br />
                      <span className="font-medium">Timeline:</span>{" "}
                      {proposal.estimatedTimeline}
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        proposal.status === "submitted"
                          ? "bg-blue-100 text-blue-700"
                          : proposal.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {proposal.status}
                    </Badge>
                  </div>

                  {proposal.status === "submitted" && (
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          handleProposalStatus([proposal._id], "accepted")
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleProposalStatus([proposal._id], "rejected")
                        }
                      >
                        Reject
                      </Button>
                      <Link to={`/chat/${proposal._id}`}>
                        <Button size="sm" variant="secondary">
                          Chat
                        </Button>
                      </Link>
                    </div>
                  )}

                  {proposal.status === "accepted" && (
                    <div className="flex justify-end mt-2">
                      <Link to={`/chat/${proposal._id}`}>
                        <Button size="sm" variant="secondary">
                          Chat
                        </Button>
                      </Link>
                    </div>
                  )}

                  {proposal.coverLetter && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {proposal.coverLetter}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
