import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, ArrowLeft, CreditCard, Shield, CheckCircle, Zap, Crown } from "lucide-react";
import { useSubscription, type PlanType } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const planDetails: Record<string, { label: string; price: string; priceNum: number; icon: typeof Zap; color: string; features: string[] }> = {
  pro: {
    label: "Pro",
    price: "₹4,000",
    priceNum: 4000,
    icon: Zap,
    color: "text-blue-500",
    features: [
      "Unlimited rooms & floor plans",
      "High-quality AI renders",
      "3D model download (.glb, .obj)",
      "Basic VR walkthrough",
      "2 full 3D model generations",
    ],
  },
  pro_plus: {
    label: "Pro+",
    price: "₹6,000",
    priceNum: 6000,
    icon: Crown,
    color: "text-purple-500",
    features: [
      "Everything in Pro",
      "Ultra HD AI renders",
      "Unlimited 3D generations",
      "Full immersive VR walkthrough",
      "Priority processing",
      "Advanced materials & textures",
    ],
  },
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan: currentPlan } = useSubscription();
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const params = new URLSearchParams(location.search);
  const selectedPlan = (params.get("plan") || "pro") as PlanType;
  const details = planDetails[selectedPlan];

  if (!details) {
    navigate("/pricing");
    return null;
  }

  const handleMockPayment = async () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    if (!transactionId.trim()) {
      toast.error("Please enter a transaction/reference ID");
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));

    // Update the user's plan in the database
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_plan: selectedPlan })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to activate plan. Please contact support.");
      setProcessing(false);
      return;
    }

    setPaymentDone(true);
    setProcessing(false);
    toast.success(`${details.label} plan activated successfully!`);
  };

  if (paymentDone) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your <Badge variant="secondary">{details.label}</Badge> plan is now active.
            </p>
            <p className="text-xs text-muted-foreground">Transaction ID: {transactionId}</p>
            <div className="pt-4 flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/pricing")}>
                View Plans
              </Button>
              <Button variant="hero" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const PlanIcon = details.icon;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">CasaMuse</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => navigate("/pricing")}>
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Plans
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto grid md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <PlanIcon className={`w-5 h-5 ${details.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{details.label} Plan</p>
                    <p className="text-sm text-muted-foreground">Monthly subscription</p>
                  </div>
                </div>
                <hr className="border-border" />
                <ul className="space-y-1.5">
                  {details.features.map((f, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <hr className="border-border" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold">{details.price}<span className="text-sm text-muted-foreground">/mo</span></span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-3 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Details
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* UPI / Bank info */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Pay via UPI / Bank Transfer</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>UPI ID:</strong> casamuse@upi</p>
                    <p><strong>Bank:</strong> State Bank of India</p>
                    <p><strong>A/C No:</strong> XXXX XXXX 1234</p>
                    <p><strong>IFSC:</strong> SBIN0001234</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Make the payment of <strong>{details.price}</strong> and enter the transaction ID below.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="txn">Transaction / Reference ID *</Label>
                  <Input
                    id="txn"
                    placeholder="e.g. UPI123456789 or bank ref number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  size="lg"
                  disabled={processing || !transactionId.trim()}
                  onClick={handleMockPayment}
                >
                  {processing ? "Processing..." : `Pay ${details.price} & Activate ${details.label}`}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Your payment info is secure. Plan activates instantly.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
