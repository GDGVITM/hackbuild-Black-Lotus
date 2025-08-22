import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  FileText,
  Briefcase,
  User,
  Lightbulb,
} from "lucide-react";

const ContractsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId");

  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [gstAgreed, setGstAgreed] = useState(false);

  // Placeholder for real API call
  const contractDetails = {
    projectId: roomId,
    clientName: "Jane Doe",
    studentName: "John Smith",
    nda: {
      status: "pending",
      text: "This Non-Disclosure Agreement (NDA) ensures confidentiality of all shared information.",
    },
    gst: {
      status: "pending",
      text: "This GST Compliance Agreement ensures tax compliance for the project.",
    },
  };

  const handleNavigateToPayment = () => {
    // Navigate to payment page for this project
    navigate(`/payment/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex items-center justify-center">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Card className="w-full shadow-lg border-border">
          <CardHeader className="text-center space-y-2">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
            <CardTitle className="text-2xl font-bold">
              Finalize Your Proposal
            </CardTitle>
            <CardDescription>
              Review and agree to the contract details before proceeding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Parties Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                  <User className="h-5 w-5" /> Parties Involved
                </h3>
                <div className="flex flex-col gap-2 p-4 rounded-md bg-muted">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Client:</span>
                    <span>{contractDetails.clientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Student:</span>
                    <span>{contractDetails.studentName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Project ID:</span>
                    <span className="font-mono text-xs">
                      {contractDetails.projectId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Key Agreements
                </h3>
                <div className="flex flex-col gap-4">
                  {/* NDA */}
                  <div className="p-4 rounded-md border bg-card space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        Non-Disclosure Agreement (NDA)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contractDetails.nda.text}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="/docs/nda.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Review NDA
                        </a>
                      </Button>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={ndaAgreed}
                          onChange={(e) => setNdaAgreed(e.target.checked)}
                        />
                        I have read and agree
                      </label>
                    </div>
                  </div>

                  {/* GST */}
                  <div className="p-4 rounded-md border bg-card space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">GST Compliance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contractDetails.gst.text}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="/docs/gst.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Review GST Details
                        </a>
                      </Button>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={gstAgreed}
                          onChange={(e) => setGstAgreed(e.target.checked)}
                        />
                        I have read and agree
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Proceed to Payment */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleNavigateToPayment}
                className="w-full sm:w-1/2 h-12 text-lg font-semibold"
                disabled={!ndaAgreed || !gstAgreed}
              >
                Proceed to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractsPage;
