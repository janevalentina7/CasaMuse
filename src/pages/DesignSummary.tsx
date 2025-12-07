import { useLocation, Link } from "react-router-dom";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, Download, FileText, Box, IndianRupee, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import CostEstimationEnhanced from "@/components/CostEstimationEnhanced";

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
  const { imageUrl, formData, description, costEstimationData: initialCostData, floorPlanSetId } = location.state || {};
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [costEstimationData, setCostEstimationData] = useState(initialCostData);

  // Get rendered views for the current floor plan set
  const renderedViews = RENDERED_VIEW_SETS[floorPlanSetId] || RENDERED_VIEW_SETS[1];

  // Extract cost data - handle both nested and flat structures
  const costSummary = costEstimationData?.summary || costEstimationData;

  // Handle cost estimation updates from the enhanced component
  const handleCostUpdate = (newData: any) => {
    setCostEstimationData(newData);
    toast.success("Cost estimation updated!");
  };

  const loadImageAsBase64 = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img') as HTMLImageElement;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleDownloadSummary = async () => {
    setIsDownloading(true);
    toast.info("Generating PDF... Please wait.");

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Helper functions
      const addNewPageIfNeeded = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      const drawSection = (title: string) => {
        addNewPageIfNeeded(20);
        pdf.setFillColor(236, 91, 109); // Primary color
        pdf.rect(margin, yPos, contentWidth, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255);
        pdf.text(title, margin + 3, yPos + 5.5);
        yPos += 12;
        pdf.setTextColor(0, 0, 0);
      };

      const drawKeyValue = (key: string, value: string, inline = false) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(key, margin + 3, yPos);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        if (inline) {
          pdf.text(value, margin + 45, yPos);
        } else {
          yPos += 5;
          pdf.text(value, margin + 3, yPos);
        }
        yPos += 7;
      };

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(236, 91, 109);
      pdf.text('CasaMuse', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Design Summary Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      pdf.setFontSize(9);
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Design Inputs Section
      drawSection('Design Inputs');
      
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPos, contentWidth, 28, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(margin, yPos, contentWidth, 28, 'S');
      
      yPos += 6;
      const col1 = margin + 5;
      const col2 = margin + contentWidth / 2 + 5;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Land Area:', col1, yPos);
      pdf.text('Style:', col2, yPos);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${formData.landArea} sq ft`, col1 + 25, yPos);
      pdf.text(formData.preferences?.style || 'Modern', col2 + 15, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Floors:', col1, yPos);
      pdf.text('Vastu:', col2, yPos);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${formData.preferences?.floors || 1}`, col1 + 25, yPos);
      pdf.text(formData.preferences?.vastuCompliant ? 'Yes' : 'No', col2 + 15, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Rooms:', col1, yPos);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const roomsText = formData.rooms?.map((r: any) => `${r.count}x ${r.roomName}`).join(', ') || 'N/A';
      const splitRooms = pdf.splitTextToSize(roomsText, contentWidth - 35);
      pdf.text(splitRooms, col1 + 25, yPos);
      
      yPos += 18;

      // Floor Plan Image
      if (imageUrl) {
        addNewPageIfNeeded(90);
        drawSection('Generated Floor Plan');
        
        try {
          const floorPlanBase64 = await loadImageAsBase64(imageUrl);
          const imgHeight = 70;
          pdf.addImage(floorPlanBase64, 'JPEG', margin, yPos, contentWidth, imgHeight);
          yPos += imgHeight + 10;
        } catch (err) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Floor plan image could not be loaded', margin + 3, yPos);
          yPos += 10;
        }
      }

      // AI Rendered Views
      addNewPageIfNeeded(80);
      drawSection('AI Rendered Views');
      
      const viewWidth = (contentWidth - 5) / 2;
      const viewHeight = 35;
      const views = [
        { label: 'Front View', src: renderedViews.front },
        { label: 'Back View', src: renderedViews.back },
        { label: 'Side View', src: renderedViews.side },
        { label: 'Top View', src: renderedViews.top },
      ];

      for (let i = 0; i < views.length; i += 2) {
        addNewPageIfNeeded(viewHeight + 10);
        
        for (let j = 0; j < 2 && i + j < views.length; j++) {
          const view = views[i + j];
          const xOffset = margin + (j * (viewWidth + 5));
          
          try {
            const viewBase64 = await loadImageAsBase64(view.src);
            pdf.addImage(viewBase64, 'JPEG', xOffset, yPos, viewWidth, viewHeight);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(view.label, xOffset + viewWidth / 2, yPos + viewHeight + 4, { align: 'center' });
          } catch (err) {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(xOffset, yPos, viewWidth, viewHeight, 'F');
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(8);
            pdf.text('Image unavailable', xOffset + viewWidth / 2, yPos + viewHeight / 2, { align: 'center' });
          }
        }
        yPos += viewHeight + 10;
      }

      // Cost Estimation
      if (costSummary?.totalCost) {
        addNewPageIfNeeded(60);
        drawSection('Cost Estimation');
        
        // Main cost box
        pdf.setFillColor(252, 235, 237);
        pdf.rect(margin, yPos, contentWidth, 20, 'F');
        pdf.setDrawColor(236, 91, 109);
        pdf.rect(margin, yPos, contentWidth, 20, 'S');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(236, 91, 109);
        pdf.text(`₹${costSummary.totalCost?.toLocaleString('en-IN')}`, pageWidth / 2, yPos + 9, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Total Estimated Cost', pageWidth / 2, yPos + 16, { align: 'center' });
        yPos += 25;
        
        // Cost details grid
        const detailWidth = contentWidth / 3;
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPos, contentWidth, 15, 'F');
        
        const details = [
          { label: 'Cost/Sq Ft', value: `₹${costSummary.costPerSqFt?.toLocaleString('en-IN') || 'N/A'}` },
          { label: 'Build Time', value: costSummary.buildTime || 'N/A' },
          { label: 'Land Cost', value: `₹${costSummary.breakdown?.land?.toLocaleString('en-IN') || 'N/A'}` },
        ];
        
        details.forEach((detail, idx) => {
          const xOffset = margin + idx * detailWidth + detailWidth / 2;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(detail.label, xOffset, yPos + 5, { align: 'center' });
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          pdf.text(detail.value, xOffset, yPos + 11, { align: 'center' });
        });
        yPos += 20;

        // Cost breakdown
        if (costSummary.breakdown) {
          addNewPageIfNeeded(40);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Cost Breakdown', margin + 3, yPos);
          yPos += 6;
          
          const breakdownItems = [
            { label: 'Civil Work', value: costSummary.breakdown.civil },
            { label: 'Interior', value: costSummary.breakdown.interior },
            { label: 'Exterior', value: costSummary.breakdown.exterior },
            { label: 'Electrical', value: costSummary.breakdown.electrical },
            { label: 'Plumbing', value: costSummary.breakdown.plumbing },
            { label: 'Labor', value: costSummary.breakdown.labor },
          ].filter(item => item.value);

          const itemWidth = contentWidth / 3;
          for (let i = 0; i < breakdownItems.length; i += 3) {
            if (i > 0) yPos += 12;
            for (let j = 0; j < 3 && i + j < breakdownItems.length; j++) {
              const item = breakdownItems[i + j];
              const xOffset = margin + j * itemWidth;
              
              pdf.setFillColor(250, 250, 250);
              pdf.rect(xOffset, yPos, itemWidth - 2, 10, 'F');
              
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(8);
              pdf.setTextColor(100, 100, 100);
              pdf.text(item.label, xOffset + 3, yPos + 4);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(0, 0, 0);
              pdf.text(`₹${item.value?.toLocaleString('en-IN')}`, xOffset + 3, yPos + 8);
            }
          }
          yPos += 15;
        }
      }

      // Footer
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by CasaMuse - AI Powered Smart Home Design', pageWidth / 2, pageHeight - 10, { align: 'center' });

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

          {/* Full Cost Estimation with Upgrade/Downgrade */}
          {costEstimationData ? (
            <CostEstimationEnhanced 
              data={costEstimationData} 
              formData={formData}
              onUpdate={handleCostUpdate}
            />
          ) : (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Cost Estimation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Cost estimation not generated yet
                </p>
                <Link to="/floor-plan-result" state={{ imageUrl, description, formData, floorPlanSetId }}>
                  <Button variant="outline">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Generate Cost Estimation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default DesignSummary;