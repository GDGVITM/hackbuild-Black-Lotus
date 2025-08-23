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

const PaymentPage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentDetails(null);

    try {
      const orderResponse = await axios.post(
        `${API_BASE_URL}/payments/create-order`,
        {
          amount: Number(amount),
          currency: "INR",
        },
        {
          withCredentials: true,
        }
      );

      const orderData = orderResponse.data.data;

      if (!orderData) {
        console.error("Could not create Razorpay order.");
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Payment Mock",
        description: "Test Transaction & Blockchain Log",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verificationResponse = await axios.post(
              `${API_BASE_URL}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: Number(amount),
                currency: "INR",
              },
              {
                withCredentials: true,
              }
            );

            const verificationData = verificationResponse.data.data;
            setPaymentDetails(verificationData);
            console.log("Payment Successful!", verificationData);
          } catch (error) {
            console.error("Payment verification failed:", error);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.fullname || "Test User",
          email: user?.email || "test.user@example.com",
          contact: user?.phoneNumber || "9999999999",
        },
        notes: {
          address: "Test Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      if (import.meta.env.DEV) {
        options.prefill.method = "upi";
        options.prefill.vpa = "success@razorpay";
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error during payment process:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Donate & Log on Blockchain</CardTitle>
          <CardDescription>
            Enter an amount to make a test payment with Razorpay. The
            transaction will be recorded on a local blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (INR)</Label>
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
            onClick={handlePayment}
            disabled={loading || !amount || amount <= 0 || !user}
            className="w-full"
          >
            {loading ? "Processing..." : `Pay ₹${amount}`}
          </Button>
          {!user && (
            <p className="text-xs text-red-500">
              Please log in to make a payment.
            </p>
          )}
          {paymentDetails && (
            <div className="text-sm text-green-600 dark:text-green-400 text-center p-3 bg-green-50 dark:bg-gray-800 rounded-lg">
              <p>
                <strong>Payment Verified!</strong>
              </p>
              <p className="break-all">
                <strong>Tx Hash:</strong> {paymentDetails.blockchainTxHash}
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentPage;
