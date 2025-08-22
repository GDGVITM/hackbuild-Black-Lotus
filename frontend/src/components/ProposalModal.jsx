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

export default function ProposalModal({ isOpen, onClose, job }) {
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [proposedRate, setProposedRate] = useState("");
  const [estimatedTimeline, setEstimatedTimeline] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // In a real app, you would get the projectId and student ID from the job data and user context
    const projectId = "your_project_id"; // Replace with actual project ID
    const studentId = "your_student_id"; // Replace with actual student ID
    const clientId = "client_fghij"; // Replace with actual client ID

    // Generate a unique room ID by combining the project and client IDs
    // This ensures a dedicated chat room for this specific proposal
    const roomId = `${projectId}_${clientId}`;

    const formData = new FormData();
    formData.append("student", studentId);
    formData.append("project", projectId);
    formData.append("proposedRate", parseFloat(proposedRate));
    formData.append("estimatedTimeline", estimatedTimeline);

    if (coverLetterFile) {
      console.log("Uploading file:", coverLetterFile);
      formData.append("coverLetterFile", coverLetterFile);
    } else {
      formData.append("coverLetter", coverLetterText);
    }

    try {
      // Assuming a backend endpoint to create proposals
      // We'll simulate a successful response for this example
      const response = await fetch("/api/proposals/createProposal", {
        method: "POST",
        body: formData,
      });

      // You would normally check response.ok and handle the backend response here.
      console.log("Proposal submission attempt complete.");

      // After a successful submission, navigate to the newly created room.
      // The `ChatPage` component will use this ID to connect.
      navigate(`/chat/${roomId}`);
      toast.success("Proposal submitted!", {
        description: `Creating a new room with ID: ${roomId}`,
      });
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Error submitting proposal.", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-11/12 sm:w-full sm:max-w-xl bg-gray-800 text-gray-100 border border-gray-700 rounded-lg shadow-2xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-bold text-center text-blue-400">
            Submit Proposal for <span className="text-white">{job.title}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center mt-2">
            Fill in the details below to submit your proposal for this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="proposedRate"
                className="text-sm font-medium text-gray-300"
              >
                Proposed Rate ($/hr)
              </Label>
              <Input
                id="proposedRate"
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="estimatedTimeline"
                className="text-sm font-medium text-gray-300"
              >
                Est. Timeline
              </Label>
              <Input
                id="estimatedTimeline"
                value={estimatedTimeline}
                onChange={(e) => setEstimatedTimeline(e.target.value)}
                placeholder="e.g., 2 weeks"
                className="bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="coverLetter"
              className="text-sm font-medium text-gray-300"
            >
              Cover Letter
            </Label>
            <Textarea
              id="coverLetter"
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              placeholder="Write a compelling cover letter here..."
              className="h-32 bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
              required={!coverLetterFile}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="file-upload"
              className="text-sm font-medium text-gray-300"
            >
              Or Upload as a File
            </Label>
            <div className="flex items-center space-x-2 bg-gray-700 border border-gray-600 rounded-lg p-2">
              <PaperclipIcon className="h-5 w-5 text-gray-400" />
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setCoverLetterFile(e.target.files[0])}
                className="flex-1 cursor-pointer text-gray-300 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                accept=".doc,.docx,.pdf"
              />
            </div>
            {coverLetterFile && (
              <p className="text-xs text-gray-400 mt-1">
                Selected file: {coverLetterFile.name}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              {loading ? "Submitting..." : "Submit Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
