import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

// NOTE: We are no longer using axiosInstance since we are using the fetch API.
// import axiosInstance from "@/lib/axios";
// import { useAuth } from "@/context/Auth/context";

export default function ProposalModal({ isOpen, onClose, job }) {
  // NOTE: Assuming 'user' data is available from a different source or passed down
  // const { user } = useAuth();
  const user = { name: "A.I. Student" }; // Placeholder for demonstration

  const [coverLetterText, setCoverLetterText] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [estimatedTimeline, setEstimatedTimeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // The original axiosInstance code for submitting the proposal.
    // This can remain if you want to use axios for submissions.
    // try {
    //   const data = {
    //     proposedRate,
    //     estimatedTimeline,
    //     coverLetter: coverLetterText,
    //   };
    //
    //   await axiosInstance.post(
    //     `/proposals/projects/${job._id}/proposals`,
    //     data
    //   );
    //
    //   setMessage("Proposal submitted successfully!");
    //   setTimeout(onClose, 2000);
    // } catch (error) {
    //   setMessage(
    //     error.response?.data?.message ||
    //       "Error submitting proposal. Please try again."
    //   );
    // } finally {
    //   setLoading(false);
    // }

    // Navigate to the chat page after submission
    window.location.href = "http://localhost:3000/chat";
  };

  const handleGenerateCoverLetter = async () => {
    // Navigate to the generate page
    window.location.href = "http://localhost:3000/generate";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Submit Proposal for {job.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            Fill in the details below to submit your proposal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proposedRate">Proposed Rate ($/hr)</Label>
              <Input
                id="proposedRate"
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="estimatedTimeline">Est. Timeline</Label>
              <Input
                id="estimatedTimeline"
                value={estimatedTimeline}
                onChange={(e) => setEstimatedTimeline(e.target.value)}
                placeholder="e.g., 2 weeks"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleGenerateCoverLetter}
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
            <Textarea
              id="coverLetter"
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              placeholder="Write or generate a compelling cover letter..."
              required
              className="h-40"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Proposal"}
          </Button>

          {message && (
            <p
              className={`text-center text-sm font-medium ${
                message.includes("Error")
                  ? "text-destructive"
                  : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
