import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Download, ArrowLeft, Share2, Box, Eye, Navigation, IndianRupee, Maximize } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import VirtualWalkthrough from "@/components/VirtualWalkthrough";
import HouseModel3D from "@/components/3d/HouseModel3D";
import CostEstimation from "@/components/CostEstimation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FloorPlanResult = () => {
  const location = useLocation();
  const { imageUrl, description, formData } = location.state || {};
  const [is3DGenerating, setIs3DGenerating] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
  const [model3DDescription, setModel3DDescription] = useState<string>("");
  const [currentView, setCurrentView] = useState<'main' | 'top' | 'side' | 'back' | 'interior'>('main');
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughUrl, setWalkthroughUrl] = useState<string | null>(null);
  const [show3DModel, setShow3DModel] = useState(false);
  const [showCostEstimation, setShowCostEstimation] = useState(false);
  const [costEstimationData, setCostEstimationData] = useState<any>(null);
  const [isGeneratingCost, setIsGeneratingCost] = useState(false);
  const [showRenderedPreview, setShowRenderedPreview] = useState(false);

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

  const handleViewChange = async (view: 'main' | 'top' | 'side' | 'back' | 'interior') => {
    setCurrentView(view);
    if (!imageUrl || !formData) {
      toast.error("Floor plan data not available");
      return;
    }

    setIs3DGenerating(true);
    const viewLabel = view === 'main' ? '360° View' : view === 'top' ? 'Top View' : view === 'side' ? 'Side View' : view === 'back' ? 'Back View' : 'Interior View';
    toast.info(`Generating ${viewLabel}... This may take a moment.`);

    try {
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          floorPlanImageUrl: imageUrl,
          landArea: formData.landArea,
          rooms: formData.rooms,
          preferences: formData.preferences,
          view: view === 'main' ? '360' : view,
        }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setModel3DUrl(data.imageUrl);
        setModel3DDescription(data.description);
        toast.success("3D model view generated successfully!");
      } else {
        throw new Error(data?.error || "Failed to generate 3D model");
      }
    } catch (error) {
      console.error('Error generating 3D model:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate 3D model. Please try again.");
    } finally {
      setIs3DGenerating(false);
    }
  };

  const handleGenerate3D = () => {
    handleViewChange('main');
  };

  const handleGenerateRoomView = async (roomName: string) => {
    if (!imageUrl || !formData) {
      toast.error("Floor plan data not available");
      return;
    }

    setIs3DGenerating(true);
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
      toast.error(error instanceof Error ? error.message : "Failed to generate room view.");
    } finally {
      setIs3DGenerating(false);
    }
  };

  const handleStartWalkthrough = () => {
    if (formData?.rooms && formData.rooms.length > 0) {
      setShowWalkthrough(true);
      handleGenerateRoomView(formData.rooms[0].roomName);
    } else {
      toast.error("No rooms available for walkthrough");
    }
  };

  const handleGenerateCostEstimation = async () => {
    if (!formData) {
      toast.error("Floor plan data not available");
      return;
    }

    setIsGeneratingCost(true);
    toast.info("Generating detailed cost estimation... This may take a moment.");

    try {
      const { data, error } = await supabase.functions.invoke('generate-cost-estimation', {
        body: {
          landArea: formData.landArea,
          rooms: formData.rooms,
          preferences: formData.preferences,
          floorPlanDescription: description
        }
      });

      if (error) throw error;

      if (data?.success && data?.estimation) {
        setCostEstimationData(data.estimation);
        setShowCostEstimation(true);
        toast.success("Cost estimation generated successfully!");
      } else {
        throw new Error(data?.error || "Failed to generate cost estimation");
      }
    } catch (error) {
      console.error('Error generating cost estimation:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate cost estimation.");
    } finally {
      setIsGeneratingCost(false);
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
              className="group"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Floor Plan
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={() => setShow3DModel(true)}
              className="group"
            >
              <Box className="w-5 h-5 mr-2" />
              View 3D Model
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={handleGenerateCostEstimation}
              disabled={isGeneratingCost}
              className="group"
            >
              <IndianRupee className="w-5 h-5 mr-2" />
              {isGeneratingCost ? "Calculating..." : "Cost Estimation"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
            <Link to="/design">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Create Another Design
              </Button>
            </Link>
          </div>

          {/* 3D Model Dialog */}
          <Dialog open={show3DModel} onOpenChange={setShow3DModel}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  {showRenderedPreview ? "AI-Rendered 3D Preview" : "Interactive 3D Model - VR Ready"}
                </DialogTitle>
              </DialogHeader>
              
              {/* Toggle Button */}
              <div className="flex gap-2 justify-center mb-4">
                <Button
                  variant={!showRenderedPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRenderedPreview(false)}
                >
                  <Box className="w-4 h-4 mr-2" />
                  Interactive VR
                </Button>
                <Button
                  variant={showRenderedPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowRenderedPreview(true);
                    if (!model3DUrl) {
                      handleGenerate3D();
                    }
                  }}
                  disabled={is3DGenerating}
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  {is3DGenerating ? "Generating..." : "Preview 3D Model"}
                </Button>
              </div>

              {/* Content */}
              {showRenderedPreview ? (
                model3DUrl ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={model3DUrl}
                        alt="Rendered 3D Model"
                        className="w-full h-auto"
                      />
                      <Badge className="absolute top-4 left-4 bg-primary text-white">
                        {currentView === 'main' ? '360° View' : currentView === 'top' ? 'Top View' : currentView === 'side' ? 'Side View' : currentView === 'back' ? 'Back View' : 'Interior View'}
                      </Badge>
                    </div>
                    
                    {/* View Control Buttons */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant={currentView === 'main' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleViewChange('main')}
                        disabled={is3DGenerating}
                      >
                        <Box className="w-4 h-4 mr-2" />
                        360° View
                      </Button>
                      <Button
                        variant={currentView === 'top' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleViewChange('top')}
                        disabled={is3DGenerating}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Top View
                      </Button>
                      <Button
                        variant={currentView === 'side' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleViewChange('side')}
                        disabled={is3DGenerating}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Side View
                      </Button>
                      <Button
                        variant={currentView === 'back' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleViewChange('back')}
                        disabled={is3DGenerating}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Back View
                      </Button>
                      <Button
                        variant={currentView === 'interior' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleViewChange('interior')}
                        disabled={is3DGenerating}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Interior
                      </Button>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">{model3DDescription}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Box className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Click "Preview 3D Model" to generate the rendered view</p>
                  </div>
                )
              ) : (
                formData?.rooms && (
                  <HouseModel3D 
                    rooms={formData.rooms} 
                    style={formData.preferences?.style || "Modern"}
                  />
                )
              )}
            </DialogContent>
          </Dialog>

          {/* Cost Estimation Dialog */}
          <Dialog open={showCostEstimation} onOpenChange={setShowCostEstimation}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Detailed Cost Estimation
                </DialogTitle>
              </DialogHeader>
              {costEstimationData && (
                <CostEstimation data={costEstimationData} />
              )}
            </DialogContent>
          </Dialog>

          {/* Virtual Walkthrough */}
          {showWalkthrough && formData?.rooms && (
            <VirtualWalkthrough
              rooms={formData.rooms}
              style={formData.preferences?.style || "Modern"}
              model3DUrl={walkthroughUrl || ""}
              onGenerateRoomView={handleGenerateRoomView}
              isGenerating={is3DGenerating}
            />
          )}

          {/* 3D Model Display */}
          {model3DUrl && (
            <Card className="border-2 border-primary/30 glass-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={model3DUrl}
                    alt="Generated 3D Model"
                    className="w-full h-auto"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-white">
                    3D Model - {currentView === 'main' ? '360° View' : currentView === 'top' ? 'Top View' : currentView === 'side' ? 'Side View' : currentView === 'back' ? 'Back View' : 'Interior View'}
                  </Badge>
                </div>
                
                {/* View Control Buttons */}
                <div className="p-4 bg-muted/30 border-t border-border/50">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant={currentView === 'main' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleViewChange('main')}
                      disabled={is3DGenerating}
                      className="flex-1 min-w-[100px]"
                    >
                      <Box className="w-4 h-4 mr-2" />
                      360° View
                    </Button>
                    <Button
                      variant={currentView === 'top' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleViewChange('top')}
                      disabled={is3DGenerating}
                      className="flex-1 min-w-[100px]"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Top View
                    </Button>
                    <Button
                      variant={currentView === 'side' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleViewChange('side')}
                      disabled={is3DGenerating}
                      className="flex-1 min-w-[100px]"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Side View
                    </Button>
                    <Button
                      variant={currentView === 'back' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleViewChange('back')}
                      disabled={is3DGenerating}
                      className="flex-1 min-w-[100px]"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Back View
                    </Button>
                    <Button
                      variant={currentView === 'interior' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleViewChange('interior')}
                      disabled={is3DGenerating}
                      className="flex-1 min-w-[100px]"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Interior
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Click different views to explore your 3D model from all angles
                  </p>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">3D Visualization</h3>
                  <p className="text-muted-foreground">{model3DDescription}</p>
                </div>
              </CardContent>
            </Card>
          )}

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
