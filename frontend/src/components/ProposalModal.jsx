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
import { PaperclipIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axios"; // make sure this is imported

export default function ProposalModal({ isOpen, onClose, job }) {
  const { user } = useAuth();
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterFile, setCoverLetterFile] = useState(null);
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

    try {
      const payload = {
        student: user?._id,
        project: job._id,
        proposedRate: parseFloat(proposedRate),
        estimatedTimeline,
        coverLetter: coverLetterText,
      };

      // 1️⃣ Create proposal
      const proposalRes = await axiosInstance.post(
        `/proposals/projects/${job._id}/proposals`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const proposalId = proposalRes.data?.data?._id;
      // console.log("Proposal created with ID:", proposalId);
      // 2️⃣ Create/initiate conversation (student + client)
      // const convoRes = await axiosInstance.post(`/chat/`, { proposalId });
      // const conversationId = convoRes.data?.conversation?._id; // 👈 fixed
      navigate(`/chat`);
      toast.success("Proposal submitted!", {
        description: "Conversation created successfully",
      });

      // 3️⃣ Navigate to the chat room
      setTimeout(() => {
        navigate(`/chat/${conversationId}`);
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error submitting proposal.");
      toast.error("Error submitting proposal.", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/generate-proposal", {
        name: user?.fullname,
        email: user?.email,
        skills: user?.skills || [],
        job_title: job.title,
        description: job.description,
        client_name: job.client?.fullname,
        client_company: job.client?.company || "Freelancer Client",
      });

      setCoverLetterText(
        res.data.cover_letter?.cover_letter || res.data.proposal || ""
      );
    } catch (error) {
      console.error("Error generating cover letter:", error);
      setMessage("Failed to generate cover letter. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6">
        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-xl font-semibold">
            Submit Proposal for {job.title}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to submit your proposal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Rate + Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposedRate">Proposed Rate ($/hr)</Label>
              <Input
                id="proposedRate"
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
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

          {/* Cover letter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
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
              required={!coverLetterFile}
              className="h-40"
            />
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Or Upload as a File</Label>
            <div className="flex items-center space-x-2 border rounded-md p-2">
              <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setCoverLetterFile(e.target.files[0])}
                className="flex-1 cursor-pointer"
                accept=".doc,.docx,.pdf"
              />
            </div>
            {coverLetterFile && (
              <p className="text-xs text-muted-foreground">
                Selected file: {coverLetterFile.name}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Proposal"}
          </Button>

          {/* Messages */}
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
