import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Download, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

const FloorPlanResult = () => {
  const location = useLocation();
  const { imageUrl, description } = location.state || {};

  const handleDownload = () => {
    if (!imageUrl) return;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'floor-plan.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Floor plan downloaded!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Dream Home Floor Plan',
          text: 'Check out my AI-generated floor plan!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast.info("Sharing not supported on this browser");
    }
  };

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Floor Plan Available</h2>
            <p className="text-muted-foreground mb-6">
              Please generate a floor plan first.
            </p>
            <Link to="/design">
              <Button variant="hero" className="glass-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Design Tool
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">DreamHome AI</span>
            </Link>
            
            <Link to="/design">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Design
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Your Professional
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Floor Plan
              </span>
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Floor Plan Display */}
          <Card className="glass-card border-2">
            <CardContent className="p-6">
              <div className="relative rounded-lg overflow-hidden bg-white">
                <img
                  src={imageUrl}
                  alt="Generated Floor Plan"
                  className="w-full h-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              onClick={handleDownload}
              className="glass-button group"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Floor Plan
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="glass-button"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
            <Link to="/design">
              <Button variant="outline" size="lg" className="glass-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Create Another Design
              </Button>
            </Link>
          </div>

          {/* Info Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-12">
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Professional Grade</h3>
                <p className="text-sm text-muted-foreground">
                  Architect-quality floor plans with proper dimensions and standards
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Vastu Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Designed following traditional Vastu principles if enabled
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Generated using advanced AI for optimal space utilization
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FloorPlanResult;
