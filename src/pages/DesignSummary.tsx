import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, Download, FileText, Box, IndianRupee } from "lucide-react";
import { toast } from "sonner";

const DesignSummary = () => {
  const location = useLocation();
  const { imageUrl, formData, description, costEstimationData, floorPlanSetId } = location.state || {};

  const handleDownloadSummary = () => {
    toast.success("Summary download feature coming soon!");
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Design Data Available</h2>
            <p className="text-muted-foreground mb-6">Please generate a floor plan first.</p>
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
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadSummary}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Link to="/floor-plan-result" state={{ imageUrl, description, formData, floorPlanSetId }}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Design <span className="bg-gradient-primary bg-clip-text text-transparent">Summary</span>
            </h1>
            <p className="text-muted-foreground">Complete overview of your home design</p>
          </div>

          {/* User Inputs Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Design Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Land Area</p>
                  <p className="text-lg font-semibold">{formData.landArea} sq ft</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Architectural Style</p>
                  <p className="text-lg font-semibold">{formData.preferences?.style || 'Modern'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Number of Floors</p>
                  <p className="text-lg font-semibold">{formData.preferences?.floors || 1}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Vastu Compliant</p>
                  <p className="text-lg font-semibold">{formData.preferences?.vastuCompliant ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Rooms</p>
                <div className="flex flex-wrap gap-2">
                  {formData.rooms?.map((room: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {room.count}x {room.roomName} ({room.width}'×{room.height}')
                      {room.attachedBathroom && ' + Bathroom'}
                    </Badge>
                  ))}
                </div>
              </div>

              {formData.preferences?.outdoorFeatures?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Outdoor Features</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferences.outdoorFeatures.map((feature: string, index: number) => (
                      <Badge key={index} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Floor Plan Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Floor Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imageUrl && (
                <div className="rounded-lg overflow-hidden bg-white">
                  <img src={imageUrl} alt="Floor Plan" className="w-full h-auto" />
                </div>
              )}
              {description && (
                <p className="mt-4 text-sm text-muted-foreground">{description}</p>
              )}
            </CardContent>
          </Card>

          {/* Interactive 3D Preview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5" />
                Interactive 3D Model
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Explore your home in interactive 3D with VR support
              </p>
              <Link to="/interactive-3d" state={{ imageUrl, description, formData, floorPlanSetId }}>
                <Button variant="hero">
                  <Box className="w-4 h-4 mr-2" />
                  Open Interactive 3D
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Cost Estimation Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Cost Estimation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {costEstimationData ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{costEstimationData.totalCost?.toLocaleString('en-IN') || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground">Cost per Sq Ft</p>
                      <p className="text-xl font-semibold">
                        ₹{costEstimationData.costPerSqFt?.toLocaleString('en-IN') || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground">Build Time</p>
                      <p className="text-xl font-semibold">
                        {costEstimationData.buildTime || '9-12 months'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Cost estimation not generated yet
                  </p>
                  <Link to="/floor-plan-result" state={{ imageUrl, description, formData, floorPlanSetId }}>
                    <Button variant="outline">
                      <IndianRupee className="w-4 h-4 mr-2" />
                      Generate Cost Estimation
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DesignSummary;