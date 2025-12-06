import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Download, ArrowLeft, Share2, Box, Eye, Navigation, IndianRupee, Maximize, GitCompare, Plus, MapPin, Wallet, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import VirtualWalkthrough from "@/components/VirtualWalkthrough";
import HouseModel3D from "@/components/3d/HouseModel3D";
import CostEstimationEnhanced from "@/components/CostEstimationEnhanced";
import FloorPlanComparison from "@/components/FloorPlanComparison";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FloorPlanSVG from "@/components/FloorPlanSVG";


// Import floor plan images - 4 sets available
import floorPlan1 from "@/assets/floor-plans/floor-plan-1.jpg";
import floorPlan2 from "@/assets/floor-plans/floor-plan-2.png";
import floorPlan3 from "@/assets/floor-plans/floor-plan-3.png";
import floorPlan4 from "@/assets/floor-plans/floor-plan-4.png";

// Floor plan sets with their corresponding set IDs
const FLOOR_PLAN_SETS = [
  { id: 1, image: floorPlan1 },
  { id: 2, image: floorPlan2 },
  { id: 3, image: floorPlan3 },
  { id: 4, image: floorPlan4 },
];

const FloorPlanResult = () => {
  const location = useLocation();
  const { imageUrl, floorPlanData, description, formData, floorPlanSetId } = location.state || {};
  const svgContainerRef = useRef<HTMLDivElement>(null);
  
  // Use passed floorPlanSetId if available, otherwise randomly select one (memoized to persist across re-renders)
  const selectedFloorPlanSet = useMemo(() => {
    if (floorPlanSetId) {
      const found = FLOOR_PLAN_SETS.find(set => set.id === floorPlanSetId);
      if (found) return found;
    }
    const randomIndex = Math.floor(Math.random() * FLOOR_PLAN_SETS.length);
    return FLOOR_PLAN_SETS[randomIndex];
  }, [floorPlanSetId]);
  const [is3DGenerating, setIs3DGenerating] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
  const [model3DDescription, setModel3DDescription] = useState<string>("");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughUrl, setWalkthroughUrl] = useState<string | null>(null);
  const [show3DModel, setShow3DModel] = useState(false);
  const [showCostEstimation, setShowCostEstimation] = useState(false);
  const [costEstimationData, setCostEstimationData] = useState<any>(null);
  const [isGeneratingCost, setIsGeneratingCost] = useState(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'rendered'>('interactive');
  const [renderedView, setRenderedView] = useState<'360' | 'top' | 'front' | 'side' | 'back' | 'interior'>('360');
  const [showComparison, setShowComparison] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState('');
  const [userBudget, setUserBudget] = useState('');
  const [userBuildTime, setUserBuildTime] = useState('');
  const [showCostSettings, setShowCostSettings] = useState(false);

  const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 
    'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Chandigarh', 'Kochi', 'Indore', 'Nagpur', 'Coimbatore'
  ];

  // Transform form room data to HouseModel3D format
  const transformRoomsFor3D = (rooms: any[]) => {
    const transformed: { roomName: string; length: number; breadth: number }[] = [];
    
    rooms.forEach((room) => {
      const count = room.count || 1;
      for (let i = 0; i < count; i++) {
        transformed.push({
          roomName: count > 1 ? `${room.roomName} ${i + 1}` : room.roomName,
          length: room.height || 12, // height in feet becomes length (depth)
          breadth: room.width || 10, // width in feet becomes breadth
        });
      }
      
      // Add attached bathroom if specified
      if (room.attachedBathroom && room.count > 0) {
        for (let i = 0; i < count; i++) {
          transformed.push({
            roomName: `Bathroom (${count > 1 ? room.roomName + ' ' + (i + 1) : room.roomName})`,
            length: 7,
            breadth: 6,
          });
        }
      }
    });
    
    return transformed;
  };

  // Load saved plans from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('savedFloorPlans');
    if (stored) {
      try {
        setSavedPlans(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading saved plans:', error);
      }
    }
  }, []);

  const handleAddToComparison = () => {
    if (!floorPlanData && !imageUrl) return;
    if (!formData) return;
    
    const newPlan = {
      id: Date.now().toString(),
      floorPlanData,
      imageUrl,
      description,
      formData
    };
    
    const updated = [...savedPlans, newPlan];
    setSavedPlans(updated);
    localStorage.setItem('savedFloorPlans', JSON.stringify(updated));
    toast.success("Added to comparison!");
  };

  const handleRemovePlan = (id: string) => {
    const updated = savedPlans.filter(plan => plan.id !== id);
    setSavedPlans(updated);
    localStorage.setItem('savedFloorPlans', JSON.stringify(updated));
    toast.success("Removed from comparison");
  };

  const handleDownload = () => {
    // For SVG, we need to convert to image
    if (svgContainerRef.current) {
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = 'floor-plan.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("Floor plan downloaded!");
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        return;
      }
    }
    
    // Fallback for AI-generated image
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'floor-plan.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Floor plan downloaded!");
    }
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

  const handleGenerateRenderedView = async (view: '360' | 'top' | 'front' | 'side' | 'back' | 'interior') => {
    if (!imageUrl || !formData) {
      toast.error("Floor plan data not available");
      return;
    }

    setIs3DGenerating(true);
    setRenderedView(view);
    const viewLabels = {
      '360': '360° View',
      'top': 'Top View',
      'front': 'Front View',
      'side': 'Side View',
      'back': 'Back View',
      'interior': 'Interior View'
    };
    toast.info(`Generating ${viewLabels[view]}... This may take a moment.`);

    try {
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          floorPlanImageUrl: imageUrl,
          landArea: formData.landArea,
          rooms: formData.rooms,
          preferences: formData.preferences,
          view: view === 'front' ? '360' : view, // Use 360 for front view as well
        }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setModel3DUrl(data.imageUrl);
        setModel3DDescription(data.description);
        setViewMode('rendered');
        toast.success(`${viewLabels[view]} generated successfully!`);
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

  const handleViewChange = (newView: '360' | 'top' | 'front' | 'side' | 'back' | 'interior') => {
    setRenderedView(newView);
    handleGenerateRenderedView(newView);
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
    setShowCostSettings(false);
    toast.info("Generating detailed cost estimation...");

    try {
      const budgetValue = userBudget ? parseInt(userBudget.replace(/,/g, '')) : undefined;
      
      const { data, error } = await supabase.functions.invoke('generate-cost-estimation', {
        body: {
          landArea: formData.landArea,
          rooms: formData.rooms,
          preferences: formData.preferences,
          floorPlanDescription: description,
          location: userLocation || undefined,
          userBudget: budgetValue,
          desiredBuildTime: userBuildTime ? parseInt(userBuildTime) : undefined
        }
      });

      if (error) throw error;

      if (data?.success && data?.estimation) {
        setCostEstimationData(data.estimation);
        setShowCostEstimation(true);
        toast.success("Cost estimation generated!");
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

  const handleOpenCostSettings = () => {
    setShowCostSettings(true);
  };

  if (!floorPlanData && !imageUrl) {
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
              <span className="text-xl font-bold">CasaMuse</span>
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
              <div ref={svgContainerRef} className="relative rounded-lg overflow-hidden bg-white">
                {/* Display floor plan image from selected set */}
                <img
                  src={selectedFloorPlanSet.image}
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
            <Link to="/interactive-3d" state={{ imageUrl: selectedFloorPlanSet.image, description, formData, floorPlanSetId: selectedFloorPlanSet.id }}>
              <Button variant="hero" size="lg" className="group">
                <Box className="w-5 h-5 mr-2" />
                Interactive 3D
              </Button>
            </Link>
            <Link to="/ai-rendered-view" state={{ imageUrl: selectedFloorPlanSet.image, description, formData, floorPlanSetId: selectedFloorPlanSet.id }}>
              <Button variant="hero" size="lg" className="group">
                <Maximize className="w-5 h-5 mr-2" />
                AI Rendered Views
              </Button>
            </Link>
            <Button
              variant="hero"
              size="lg"
              onClick={handleOpenCostSettings}
              disabled={isGeneratingCost}
              className="group"
            >
              <IndianRupee className="w-5 h-5 mr-2" />
              {isGeneratingCost ? "Calculating..." : "Cost Estimation"}
            </Button>
            <Link to="/design-summary" state={{ imageUrl: selectedFloorPlanSet.image, description, formData, costEstimationData, floorPlanSetId: selectedFloorPlanSet.id }}>
              <Button variant="hero" size="lg" className="group">
                <FileText className="w-5 h-5 mr-2" />
                Summary
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={handleAddToComparison}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to Comparison
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowComparison(true)}
            >
              <GitCompare className="w-5 h-5 mr-2" />
              Compare Designs ({savedPlans.length})
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

          {/* Cost Settings Dialog */}
          <Dialog open={showCostSettings} onOpenChange={setShowCostSettings}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Cost Estimation Settings
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location (for accurate land & labor costs)
                  </Label>
                  <Select value={userLocation} onValueChange={setUserLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_CITIES.map(city => (
                        <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Land and construction costs vary by location</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Your Budget (optional)
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g., 5000000"
                    value={userBudget}
                    onChange={(e) => setUserBudget(e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGenerateCostEstimation();
                      }
                    }}
                    className="text-foreground bg-background"
                  />
                  {userBudget && (
                    <p className="text-sm text-primary font-medium">
                      ₹{parseInt(userBudget).toLocaleString('en-IN')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Get suggestions tailored to your budget</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Desired Build Time (optional)
                  </Label>
                  <Select value={userBuildTime} onValueChange={setUserBuildTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months (Fast track)</SelectItem>
                      <SelectItem value="9">9 months (Standard)</SelectItem>
                      <SelectItem value="12">12 months (Relaxed)</SelectItem>
                      <SelectItem value="18">18 months (Extended)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Faster builds may cost more due to overtime</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCostSettings(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleGenerateCostEstimation}
                    disabled={isGeneratingCost}
                    className="flex-1"
                  >
                    {isGeneratingCost ? "Calculating..." : "Generate Estimate"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* 3D Model Dialog */}
          <Dialog open={show3DModel} onOpenChange={setShow3DModel}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  3D House Model Viewer
                </DialogTitle>
              </DialogHeader>
              
              {/* Mode Toggle */}
              <div className="flex gap-2 justify-center mb-4">
                <Button
                  variant={viewMode === 'interactive' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('interactive')}
                >
                  <Box className="w-4 h-4 mr-2" />
                  Interactive 3D
                </Button>
                <Button
                  variant={viewMode === 'rendered' ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!model3DUrl) {
                      handleGenerateRenderedView('360');
                    } else {
                      setViewMode('rendered');
                    }
                  }}
                  disabled={is3DGenerating}
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  {is3DGenerating ? "Generating..." : "AI Rendered Views"}
                </Button>
              </div>

              {/* Content */}
              {viewMode === 'interactive' ? (
                formData?.rooms && (
                  <HouseModel3D 
                    rooms={transformRoomsFor3D(formData.rooms)} 
                    style={formData.preferences?.style || "Modern"}
                  />
                )
              ) : (
                <div className="space-y-4">
                  {model3DUrl ? (
                    <>
                      <div className="relative rounded-lg overflow-hidden bg-muted">
                        <img
                          src={model3DUrl}
                          alt="Rendered 3D Model"
                          className="w-full h-auto"
                        />
                        <Badge className="absolute top-4 left-4 bg-primary text-white">
                          {renderedView === '360' ? '360° View' : 
                           renderedView === 'top' ? 'Top View' : 
                           renderedView === 'front' ? 'Front View' :
                           renderedView === 'side' ? 'Side View' : 
                           renderedView === 'back' ? 'Back View' : 'Interior View'}
                        </Badge>
                      </div>
                      
                      {/* View Control Buttons */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          variant={renderedView === '360' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleViewChange('360')}
                          disabled={is3DGenerating}
                        >
                          <Box className="w-4 h-4 mr-2" />
                          360° View
                        </Button>
                        <Button
                          variant={renderedView === 'top' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleViewChange('top')}
                          disabled={is3DGenerating}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Top View
                        </Button>
                        <Button
                          variant={renderedView === 'front' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleViewChange('front')}
                          disabled={is3DGenerating}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Front View
                        </Button>
                        <Button
                          variant={renderedView === 'side' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleViewChange('side')}
                          disabled={is3DGenerating}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Side View
                        </Button>
                        <Button
                          variant={renderedView === 'back' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleViewChange('back')}
                          disabled={is3DGenerating}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Back View
                        </Button>
                        <Button
                          variant={renderedView === 'interior' ? 'default' : 'outline'}
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
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Box className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Click a view button below to generate AI-rendered images</p>
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleGenerateRenderedView('360')}
                          disabled={is3DGenerating}
                        >
                          <Box className="w-4 h-4 mr-2" />
                          Generate 360° View
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
                <CostEstimationEnhanced 
                  data={costEstimationData} 
                  formData={formData} 
                  onUpdate={(newData) => setCostEstimationData(newData)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Floor Plan Comparison Dialog */}
          <Dialog open={showComparison} onOpenChange={setShowComparison}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5" />
                  Compare Floor Plans
                </DialogTitle>
              </DialogHeader>
              <FloorPlanComparison 
                plans={savedPlans}
                onRemovePlan={handleRemovePlan}
              />
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
