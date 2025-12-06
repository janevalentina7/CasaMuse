import { useLocation, Link } from "react-router-dom";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, Download, FileText, Box, IndianRupee, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Import rendered view images
import set1Front from "@/assets/rendered-views/set1-front.jpg";
import set1Back from "@/assets/rendered-views/set1-back.jpg";
import set1Side from "@/assets/rendered-views/set1-side.jpg";
import set1Top from "@/assets/rendered-views/set1-top.jpg";
import set2Front from "@/assets/rendered-views/set2-front.png";
import set2Back from "@/assets/rendered-views/set2-back.png";
import set2Side from "@/assets/rendered-views/set2-side.png";
import set2Top from "@/assets/rendered-views/set2-top.png";
import set3Front from "@/assets/rendered-views/set3-front.jpg";
import set3Back from "@/assets/rendered-views/set3-back.jpg";
import set3Side from "@/assets/rendered-views/set3-side.jpg";
import set3Top from "@/assets/rendered-views/set3-top.png";
import set4Front from "@/assets/rendered-views/set4-front.jpg";
import set4Back from "@/assets/rendered-views/set4-back.jpg";
import set4Side from "@/assets/rendered-views/set4-side.jpg";
import set4Top from "@/assets/rendered-views/set4-top.png";

const RENDERED_VIEW_SETS: Record<number, { front: string; back: string; side: string; top: string }> = {
  1: { front: set1Front, back: set1Back, side: set1Side, top: set1Top },
  2: { front: set2Front, back: set2Back, side: set2Side, top: set2Top },
  3: { front: set3Front, back: set3Back, side: set3Side, top: set3Top },
  4: { front: set4Front, back: set4Back, side: set4Side, top: set4Top },
};

const DesignSummary = () => {
  const location = useLocation();
  const { imageUrl, formData, description, costEstimationData, floorPlanSetId } = location.state || {};
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Get rendered views for the current floor plan set
  const renderedViews = RENDERED_VIEW_SETS[floorPlanSetId] || RENDERED_VIEW_SETS[1];

  // Extract cost data - handle both nested and flat structures
  const costSummary = costEstimationData?.summary || costEstimationData;

  const handleDownloadSummary = async () => {
    if (!summaryRef.current) return;
    
    setIsDownloading(true);
    toast.info("Generating PDF... Please wait.");

    try {
      const element = summaryRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      // Calculate how many pages we need
      const scaledImgHeight = imgHeight * ratio;
      const pageCount = Math.ceil(scaledImgHeight / pdfHeight);

      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(
          imgData,
          'PNG',
          imgX,
          -(i * pdfHeight),
          imgWidth * ratio,
          imgHeight * ratio
        );
      }

      pdf.save('CasaMuse-Design-Summary.pdf');
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadSummary}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isDownloading ? "Generating..." : "Download PDF"}
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
        <div ref={summaryRef} className="max-w-6xl mx-auto space-y-8 bg-background p-4 rounded-lg">
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <img src={imageUrl} alt="Floor Plan" className="w-full h-auto" crossOrigin="anonymous" />
                </div>
              )}
              {description && (
                <p className="mt-4 text-sm text-muted-foreground">{description}</p>
              )}
            </CardContent>
          </Card>

          {/* AI Rendered Views Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                AI Rendered Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Front View</p>
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img src={renderedViews.front} alt="Front View" className="w-full h-auto aspect-video object-cover" crossOrigin="anonymous" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Back View</p>
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img src={renderedViews.back} alt="Back View" className="w-full h-auto aspect-video object-cover" crossOrigin="anonymous" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Side View</p>
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img src={renderedViews.side} alt="Side View" className="w-full h-auto aspect-video object-cover" crossOrigin="anonymous" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Top View</p>
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img src={renderedViews.top} alt="Top View" className="w-full h-auto aspect-video object-cover" crossOrigin="anonymous" />
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center print:hidden">
                <Link to="/ai-rendered-view" state={{ imageUrl, description, formData, floorPlanSetId }}>
                  <Button variant="outline">
                    <Image className="w-4 h-4 mr-2" />
                    View All Rendered Images
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Interactive 3D Preview */}
          <Card className="glass-card print:hidden">
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
              {costSummary?.totalCost ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{costSummary.totalCost?.toLocaleString('en-IN') || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground">Cost per Sq Ft</p>
                      <p className="text-xl font-semibold">
                        ₹{costSummary.costPerSqFt?.toLocaleString('en-IN') || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground">Build Time</p>
                      <p className="text-xl font-semibold">
                        {costSummary.buildTime || '9-12 months'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Cost Breakdown */}
                  {costSummary.breakdown && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-3">Cost Breakdown</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {costSummary.breakdown.civil && (
                          <div className="p-3 rounded-lg bg-muted/20 text-center">
                            <p className="text-xs text-muted-foreground">Civil Work</p>
                            <p className="font-semibold">₹{costSummary.breakdown.civil.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {costSummary.breakdown.interior && (
                          <div className="p-3 rounded-lg bg-muted/20 text-center">
                            <p className="text-xs text-muted-foreground">Interior</p>
                            <p className="font-semibold">₹{costSummary.breakdown.interior.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {costSummary.breakdown.exterior && (
                          <div className="p-3 rounded-lg bg-muted/20 text-center">
                            <p className="text-xs text-muted-foreground">Exterior</p>
                            <p className="font-semibold">₹{costSummary.breakdown.exterior.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {costSummary.breakdown.electrical && (
                          <div className="p-3 rounded-lg bg-muted/20 text-center">
                            <p className="text-xs text-muted-foreground">Electrical</p>
                            <p className="font-semibold">₹{costSummary.breakdown.electrical.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {costSummary.breakdown.plumbing && (
                          <div className="p-3 rounded-lg bg-muted/20 text-center">
                            <p className="text-xs text-muted-foreground">Plumbing</p>
                            <p className="font-semibold">₹{costSummary.breakdown.plumbing.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {costSummary.breakdown.labor && (
                          <div className="p-3 rounded-lg bg-muted/20 text-center">
                            <p className="text-xs text-muted-foreground">Labor</p>
                            <p className="font-semibold">₹{costSummary.breakdown.labor.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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