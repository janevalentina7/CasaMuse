import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  requiredPlan: "pro" | "pro_plus";
}

export default function UpgradeModal({ open, onOpenChange, feature, requiredPlan }: UpgradeModalProps) {
  const navigate = useNavigate();

  const planInfo = requiredPlan === "pro"
    ? { label: "Pro", price: "₹4,000", icon: Zap, color: "text-blue-500" }
    : { label: "Pro+", price: "₹6,000", icon: Crown, color: "text-purple-500" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <DialogTitle>Feature Locked</DialogTitle>
          </div>
          <DialogDescription>
            <strong>{feature}</strong> requires a{" "}
            <Badge variant="secondary" className="mx-1">
              <planInfo.icon className={`w-3 h-3 mr-1 ${planInfo.color}`} />
              {planInfo.label}
            </Badge>{" "}
            plan or higher.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Upgrade to {planInfo.label} for just {planInfo.price}</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {requiredPlan === "pro" ? (
                <>
                  <li>✓ Unlimited rooms & floor plans</li>
                  <li>✓ High-quality AI renders</li>
                  <li>✓ 3D model download (.glb, .obj)</li>
                  <li>✓ VR walkthrough</li>
                  <li>✓ 2 full 3D model generations</li>
                </>
              ) : (
                <>
                  <li>✓ Ultra HD AI renders</li>
                  <li>✓ Unlimited 3D generations</li>
                  <li>✓ Advanced materials & textures</li>
                  <li>✓ Full immersive VR walkthrough</li>
                  <li>✓ Advanced cost breakdown</li>
                  <li>✓ Priority processing</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                navigate("/pricing");
              }}
            >
              Upgrade <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
