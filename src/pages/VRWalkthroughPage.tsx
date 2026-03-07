import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, ArrowRight, Navigation } from "lucide-react";
import { useState } from "react";
import FirstPersonScene from "@/components/walkthrough/FirstPersonScene";

const VRWalkthroughPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, formData, description, exteriorViews, interiorViews } = location.state || {};
  const [hasStarted, setHasStarted] = useState(false);

  if (!imageUrl || !formData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Floor Plan Available</h2>
            <p className="text-muted-foreground mb-6">Please generate a floor plan first.</p>
            <Link to="/design">
              <Button variant="hero"><ArrowLeft className="w-4 h-4 mr-2" />Back to Design Tool</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="flex gap-2">
              <Link to="/interactive-3d" state={{ imageUrl, description, formData, exteriorViews, interiorViews }}>
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              </Link>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/cost-estimation', { state: { imageUrl, description, formData } })}
              >
                Next: Cost Estimation<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Virtual <span className="bg-gradient-primary bg-clip-text text-transparent">Walkthrough</span>
            </h1>
            <p className="text-muted-foreground">Walk through your dream home in first person</p>
          </div>

          {!hasStarted ? (
            <Card className="glass-card border-2">
              <CardContent className="p-12 text-center space-y-6">
                <Navigation className="w-16 h-16 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">Ready to Explore?</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Walk through your house in first-person mode. Use WASD or Arrow keys to move, and mouse to look around. 
                  Click the entrance door to enter the house.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto text-xs text-muted-foreground">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-bold text-foreground text-sm">W / ↑</p>
                    <p>Forward</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-bold text-foreground text-sm">S / ↓</p>
                    <p>Backward</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-bold text-foreground text-sm">A / ←</p>
                    <p>Left</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="font-bold text-foreground text-sm">D / →</p>
                    <p>Right</p>
                  </div>
                </div>
                <Button variant="hero" size="lg" onClick={() => setHasStarted(true)}>
                  <Navigation className="w-5 h-5 mr-2" />
                  Start Walkthrough
                </Button>
              </CardContent>
            </Card>
          ) : (
            <FirstPersonScene
              rooms={formData.rooms}
              landArea={formData.landArea}
              style={formData.preferences?.style || "Modern"}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t border-border/50">
            <Link to="/interactive-3d" state={{ imageUrl, description, formData, exteriorViews, interiorViews }}>
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />Previous: 3D Model
              </Button>
            </Link>
            <Link to="/cost-estimation" state={{ imageUrl, description, formData }}>
              <Button variant="hero" size="lg">
                Next: Cost Estimation<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VRWalkthroughPage;
