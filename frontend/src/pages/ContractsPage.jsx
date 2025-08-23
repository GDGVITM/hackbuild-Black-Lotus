import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function AgreementsModal({ open, setOpen }) {
  const [ndaChecked, setNdaChecked] = useState(false);
  const [gstChecked, setGstChecked] = useState(false);

  const allAgreed = ndaChecked && gstChecked;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl bg-background text-foreground">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">
            ✅ Finalize Your Proposal
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Review and agree to the contract details before proceeding.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Parties Involved */}
          <Card>
            <CardHeader>
              <CardTitle>👥 Parties Involved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Client:</strong> Jane Doe
              </p>
              <p>
                <strong>Student:</strong> John Smith
              </p>
              <p>
                <strong>Project ID:</strong> #12345
              </p>
            </CardContent>
          </Card>

          {/* Agreements */}
          <div className="space-y-4">
            {/* NDA */}
            <Card>
              <CardHeader>
                <CardTitle>📄 Non-Disclosure Agreement (NDA)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  This Non-Disclosure Agreement (NDA) ensures confidentiality of
                  all shared information.
                </p>
                <Button asChild variant="secondary" size="sm">
                  <a href="/docs/NDA.pdf" target="_blank">
                    Review NDA
                  </a>
                </Button>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    checked={ndaChecked}
                    onCheckedChange={setNdaChecked}
                  />
                  <span>I have read and agree</span>
                </div>
              </CardContent>
            </Card>

            {/* GST */}
            <Card>
              <CardHeader>
                <CardTitle>💡 GST Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  This GST Compliance Agreement ensures tax compliance for the
                  project.
                </p>
                <Button asChild variant="secondary" size="sm">
                  <a href="/docs/GST.pdf" target="_blank">
                    Review GST Details
                  </a>
                </Button>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    checked={gstChecked}
                    onCheckedChange={setGstChecked}
                  />
                  <span>I have read and agree</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Proceed Button */}
        <Button
          className="w-full"
          disabled={!allAgreed}
          onClick={() => setOpen(false)}
        >
          Proceed to Payment
        </Button>
      </DialogContent>
    </Dialog>
  );
}
