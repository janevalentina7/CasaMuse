import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, ArrowRight, Navigation } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VirtualWalkthrough from "@/components/VirtualWalkthrough";

const VRWalkthroughPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, formData, description } = location.state || {};
  const [walkthroughUrl, setWalkthroughUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleGenerateRoomView = async (roomName: string) => {
    if (!imageUrl || !formData) return;

    setIsGenerating(true);
    toast.info(`Generating ${roomName} view...`);

    try {
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          floorPlanImageUrl: imageUrl,
          landArea: formData.landArea,
          rooms: formData.rooms,
          preferences: formData.preferences,
          view: 'interior',
          specificRoom: roomName,
        }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setWalkthroughUrl(data.imageUrl);
        toast.success(`${roomName} view generated!`);
      } else {
        throw new Error(data?.error || "Failed to generate room view");
      }
    } catch (error) {
      console.error('Error generating room view:', error);
      toast.error("Failed to generate room view.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    if (formData?.rooms?.[0]) {
      handleGenerateRoomView(formData.rooms[0].roomName);
    }
  };

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
              <Link to="/interactive-3d" state={{ imageUrl, description, formData }}>
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
            <p className="text-muted-foreground">Walk through each room of your dream home</p>
          </div>

          {!hasStarted ? (
            <Card className="glass-card border-2">
              <CardContent className="p-12 text-center space-y-6">
                <Navigation className="w-16 h-16 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">Ready to Explore?</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Take a virtual tour through each room. AI will generate photorealistic interior views as you navigate.
                </p>
                <Button variant="hero" size="lg" onClick={handleStart}>
                  <Navigation className="w-5 h-5 mr-2" />
                  Start Walkthrough
                </Button>
              </CardContent>
            </Card>
          ) : (
            <VirtualWalkthrough
              rooms={formData.rooms}
              style={formData.preferences?.style || "Modern"}
              model3DUrl={walkthroughUrl || ""}
              onGenerateRoomView={handleGenerateRoomView}
              isGenerating={isGenerating}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8">
            <Link to="/interactive-3d" state={{ imageUrl, description, formData }}>
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
