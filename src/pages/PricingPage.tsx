import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Check, X, Zap, Crown, ArrowLeft, Star } from "lucide-react";
import { useSubscription, PLAN_PRICES, type PlanType } from "@/hooks/useSubscription";
import { toast } from "sonner";

const plans = [
  {
    key: "free" as PlanType,
    name: "Free",
    price: "₹0",
    period: "month",
    description: "Explore basic features",
    icon: Star,
    color: "border-border",
    badge: null,
    features: [
      { text: "Basic 2D floor plan", included: true },
      { text: "Up to 4 rooms", included: true },
      { text: "2 project saves", included: true },
      { text: "Low-quality AI renders", included: true },
      { text: "Basic cost estimation", included: true },
      { text: "3D model preview (low quality)", included: true },
      { text: "3D model download", included: false },
      { text: "VR walkthrough", included: false },
      { text: "High-quality renders", included: false },
      { text: "Advanced cost breakdown", included: false },
    ],
  },
  {
    key: "pro" as PlanType,
    name: "Pro",
    price: "₹4,000",
    period: "month",
    description: "Full design toolkit",
    icon: Zap,
    color: "border-blue-500",
    badge: "Most Popular",
    features: [
      { text: "Unlimited rooms & floor plans", included: true },
      { text: "Smart AI layout optimization", included: true },
      { text: "4 project saves", included: true },
      { text: "High-quality AI renders", included: true },
      { text: "Detailed cost estimation", included: true },
      { text: "3D model (standard quality)", included: true },
      { text: "Download .glb, .obj", included: true },
      { text: "Basic VR walkthrough", included: true },
      { text: "2 full 3D model generations", included: true },
      { text: "Ultra HD renders", included: false },
    ],
  },
  {
    key: "pro_plus" as PlanType,
    name: "Pro+",
    price: "₹6,000",
    period: "month",
    description: "Premium experience",
    icon: Crown,
    color: "border-purple-500",
    badge: "Best Value",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Ultra-accurate floor plans", included: true },
      { text: "6 project saves", included: true },
      { text: "Ultra HD AI renders", included: true },
      { text: "Advanced cost breakdown", included: true },
      { text: "High-detail 3D models", included: true },
      { text: "Full immersive VR", included: true },
      { text: "Unlimited 3D generations", included: true },
      { text: "Priority processing", included: true },
      { text: "Advanced materials & textures", included: true },
    ],
  },
];

const PricingPage = () => {
  const { plan: currentPlan, isOwner } = useSubscription();
  const navigate = useNavigate();

  const handleSelectPlan = (planKey: PlanType) => {
    if (planKey === "free") return;
    if (planKey === currentPlan) {
      toast.info("You're already on this plan!");
      return;
    }
    navigate(`/checkout?plan=${planKey}`);
  };

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
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold">
              Choose Your <span className="bg-gradient-primary bg-clip-text text-transparent">Plan</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unlock the full power of AI-driven architectural design
            </p>
            {isOwner && (
              <Badge className="bg-gradient-primary text-white">
                Owner — All features unlocked
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isCurrent = p.key === currentPlan;
              return (
                <Card
                  key={p.key}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${p.color} ${
                    p.badge === "Most Popular" ? "border-2 scale-[1.02] shadow-lg" : ""
                  }`}
                >
                  {p.badge && (
                    <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-lg ${
                      p.badge === "Most Popular" ? "bg-blue-500" : "bg-purple-500"
                    }`}>
                      {p.badge}
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                      <p.icon className={`w-6 h-6 ${
                        p.key === "free" ? "text-muted-foreground" :
                        p.key === "pro" ? "text-blue-500" : "text-purple-500"
                      }`} />
                    </div>
                    <CardTitle className="text-xl">{p.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <div className="pt-2">
                      <span className="text-3xl font-bold">{p.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">/{p.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {f.included ? (
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                          )}
                          <span className={f.included ? "" : "text-muted-foreground/50"}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {isCurrent || (isOwner && p.key === "pro_plus") ? (
                      <Button variant="outline" className="w-full" disabled>
                        {isOwner ? "Your Plan (Owner)" : "Current Plan"}
                      </Button>
                    ) : p.key === "free" ? (
                      <Button variant="outline" className="w-full" disabled>
                        Free Forever
                      </Button>
                    ) : (
                      <Button
                        variant={p.key === "pro" ? "hero" : "default"}
                        className={`w-full ${p.key === "pro_plus" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
                        onClick={() => handleSelectPlan(p.key)}
                      >
                        Upgrade to {p.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparison table */}
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center">Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Free</th>
                    <th className="text-center py-3 px-4 bg-blue-50/50 dark:bg-blue-950/20">Pro</th>
                    <th className="text-center py-3 px-4 bg-purple-50/50 dark:bg-purple-950/20">Pro+</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Floor Plan", "Basic", "Smart AI", "Ultra-accurate"],
                    ["Max Rooms", "4", "Unlimited", "Unlimited"],
                    ["Project Saves", "2", "4", "6"],
                    ["AI Renders", "Low quality", "High quality", "Ultra HD"],
                    ["3D Model", "Preview only", "Standard", "High-detail"],
                    ["3D Download", "❌", ".glb, .obj", "All formats"],
                    ["3D Generations", "0", "2", "Unlimited"],
                    ["VR Walkthrough", "❌", "Basic", "Full immersive"],
                    ["Cost Estimation", "Basic", "Detailed", "Advanced breakdown"],
                    ["Processing Speed", "Normal", "Fast", "Priority"],
                  ].map(([feature, free, pro, proPlus], i) => (
                    <tr key={i}>
                      <td className="py-2 px-4 font-medium">{feature}</td>
                      <td className="py-2 px-4 text-center text-muted-foreground">{free}</td>
                      <td className="py-2 px-4 text-center bg-blue-50/30 dark:bg-blue-950/10">{pro}</td>
                      <td className="py-2 px-4 text-center bg-purple-50/30 dark:bg-purple-950/10">{proPlus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
