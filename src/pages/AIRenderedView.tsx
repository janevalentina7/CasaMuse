import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, Box, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Import sample rendered view images (NEW images)
import floorplanSample from "@/assets/floorplan-sample-3.png";
import topView from "@/assets/3d-topview-new.png";
import frontView from "@/assets/3d-frontview-new.png";
import sideView from "@/assets/3d-sideview-new.png";
import backView from "@/assets/3d-backview-new.png";

// Define exterior views with sample images
const EXTERIOR_VIEWS = {
  'floorplan': { url: floorplanSample, label: 'Floor Plan', description: 'Professional 2D floor plan with room dimensions and layout' },
  'top': { url: topView, label: 'Top View', description: '3D isometric view showing the complete house layout from above' },
  'front': { url: frontView, label: 'Front View', description: 'Front elevation view of the modern house with garage and landscaping' },
  'side': { url: sideView, label: 'Side View', description: 'Side perspective showing the house architecture and patio area' },
  'back': { url: backView, label: 'Back View', description: 'Rear view of the house showing covered patio area' },
};

const AIRenderedView = () => {
  const location = useLocation();
  const { imageUrl, formData, description } = location.state || {};
  const [selectedView, setSelectedView] = useState<string>('floorplan');
  const [showExterior, setShowExterior] = useState(true);

  // Always show the page even without formData - use sample images
  const currentView = EXTERIOR_VIEWS[selectedView as keyof typeof EXTERIOR_VIEWS];
  const exteriorTypes = Object.keys(EXTERIOR_VIEWS);

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
            
            <Link to="/floor-plan-result" state={{ imageUrl, description, formData }}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              AI Rendered <span className="bg-gradient-primary bg-clip-text text-transparent">Views</span>
            </h1>
            <p className="text-muted-foreground">Photorealistic renderings of your home design</p>
          </div>

          {/* Main Display */}
          <Card className="glass-card border-2">
            <CardContent className="p-6">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={currentView?.url} 
                  alt={currentView?.label} 
                  className="w-full h-auto" 
                />
                <Badge className="absolute top-4 left-4 bg-primary text-white">
                  {currentView?.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {currentView?.description && (
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{currentView.description}</p>
              </CardContent>
            </Card>
          )}

          {/* View Selection Section */}
          <Collapsible open={showExterior} onOpenChange={setShowExterior}>
            <Card className="glass-card">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Available Views
                    </span>
                    {showExterior ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {exteriorTypes.map((viewKey) => {
                      const view = EXTERIOR_VIEWS[viewKey as keyof typeof EXTERIOR_VIEWS];
                      return (
                        <Button
                          key={viewKey}
                          variant={selectedView === viewKey ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedView(viewKey)}
                          className="relative"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {view.label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Views Gallery */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Views Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {exteriorTypes.map((viewKey) => {
                  const view = EXTERIOR_VIEWS[viewKey as keyof typeof EXTERIOR_VIEWS];
                  return (
                    <div 
                      key={viewKey} 
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedView === viewKey ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedView(viewKey)}
                    >
                      <img src={view.url} alt={view.label} className="w-full aspect-video object-cover" />
                      <p className="text-xs p-2 text-center bg-muted/50">
                        {view.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation to Interactive 3D */}
          <div className="flex justify-center gap-4">
            <Link to="/interactive-3d" state={{ imageUrl, description, formData }}>
              <Button variant="hero" size="lg">
                <Box className="w-5 h-5 mr-2" />
                View Interactive 3D Model
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIRenderedView;