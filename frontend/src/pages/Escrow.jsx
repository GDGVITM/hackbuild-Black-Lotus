import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EscrowPayment = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [escrowDetails, setEscrowDetails] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleEscrowPayment = async () => {
    setLoading(true);
    setEscrowDetails(null);

    try {
      const orderResponse = await axios.post(
        `${API_BASE_URL}/escrow/create-order`,
        { amount: Number(amount), currency: "INR" },
        { withCredentials: true }
      );

      const orderData = orderResponse?.data?.data;

      if (!orderData?.id) {
        throw new Error("Invalid Razorpay order response");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Escrow Secure Payment",
        description: "Funds held until both parties agree",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              `${API_BASE_URL}/escrow/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: Number(amount),
                currency: "INR",
              },
              { withCredentials: true }
            );

            setEscrowDetails(verifyResponse.data.data);
          } catch (err) {
            console.error("Verification failed:", err);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.fullName || "Test User",
          email: user?.email || "test@example.com",
          contact: user?.phoneNumber || "9999999999",
        },
        notes: {
          project: "Escrow Milestone",
        },
        theme: { color: "#4CAF50" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", (err) => {
        console.error("Payment Failed:", err.error);
        setLoading(false);
      });
    } catch (err) {
      console.error("Escrow Payment Error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Escrow Secure Payment</CardTitle>
          <CardDescription>
            Funds are held securely until both parties agree to release or
            dispute.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Milestone Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleEscrowPayment}
            disabled={loading || !amount || amount <= 0 || !user}
            className="w-full"
          >
            {loading ? "Processing..." : `Deposit ₹${amount} in Escrow`}
          </Button>

          {!user && (
            <p className="text-xs text-red-500">
              Please log in to make an escrow payment.
            </p>
          )}

          {escrowDetails && (
            <div className="text-sm text-green-600 dark:text-green-400 text-center p-3 bg-green-50 dark:bg-gray-800 rounded-lg">
              <p>
                <strong>Escrow Funded!</strong>
              </p>
              <p className="break-all">
                <strong>Tx Hash:</strong> {escrowDetails.blockchainTxHash}
              </p>
              <p className="text-xs">
                Funds will be released only on mutual agreement.
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default EscrowPayment;
