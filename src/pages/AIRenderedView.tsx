import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

// Import static rendered views for floor plan set 1
import set1FloorPlan from "@/assets/rendered-views/set1-floorplan.jpg";
import set1Top from "@/assets/rendered-views/set1-top.jpg";
import set1Front from "@/assets/rendered-views/set1-front.jpg";
import set1Side from "@/assets/rendered-views/set1-side.jpg";
import set1Back from "@/assets/rendered-views/set1-back.jpg";

// Import static rendered views for floor plan set 2
import set2FloorPlan from "@/assets/rendered-views/set2-floorplan.png";
import set2Top from "@/assets/rendered-views/set2-top.png";
import set2Front from "@/assets/rendered-views/set2-front.png";
import set2Side from "@/assets/rendered-views/set2-side.png";
import set2Back from "@/assets/rendered-views/set2-back.png";

// Import static rendered views for floor plan set 3
import set3FloorPlan from "@/assets/rendered-views/set3-floorplan.png";
import set3Top from "@/assets/rendered-views/set3-top.png";
import set3Front from "@/assets/rendered-views/set3-front.jpg";
import set3Side from "@/assets/rendered-views/set3-side.jpg";
import set3Back from "@/assets/rendered-views/set3-back.jpg";

// Import static rendered views for floor plan set 4
import set4FloorPlan from "@/assets/floor-plans/floor-plan-4.png";
import set4Top from "@/assets/rendered-views/set4-top.png";
import set4Front from "@/assets/rendered-views/set4-front.jpg";
import set4Side from "@/assets/rendered-views/set4-side.jpg";
import set4Back from "@/assets/rendered-views/set4-back.jpg";

// All rendered view sets mapped by floor plan set ID
const RENDERED_VIEW_SETS: { [key: number]: { [view: string]: string } } = {
  1: {
    floorplan: set1FloorPlan,
    top: set1Top,
    front: set1Front,
    '360': set1Front,
    side: set1Side,
    back: set1Back,
  },
  2: {
    floorplan: set2FloorPlan,
    top: set2Top,
    front: set2Front,
    '360': set2Front,
    side: set2Side,
    back: set2Back,
  },
  3: {
    floorplan: set3FloorPlan,
    top: set3Top,
    front: set3Front,
    '360': set3Front,
    side: set3Side,
    back: set3Back,
  },
  4: {
    floorplan: set4FloorPlan,
    top: set4Top,
    front: set4Front,
    '360': set4Front,
    side: set4Side,
    back: set4Back,
  },
};

const AIRenderedView = () => {
  const location = useLocation();
  const { imageUrl, formData, description, floorPlanSetId = 1 } = location.state || {};
  const [renderedView, setRenderedView] = useState<string>('floorplan');
  const [exteriorViews, setExteriorViews] = useState<{ [key: string]: { url: string; description: string } }>({});
  
  // Get the correct rendered views based on floor plan set ID
  const currentViewSet = useMemo(() => {
    return RENDERED_VIEW_SETS[floorPlanSetId] || RENDERED_VIEW_SETS[1];
  }, [floorPlanSetId]);
  
  // Pre-populate exterior views with static images based on floor plan set
  useEffect(() => {
    setExteriorViews({
      floorplan: { url: currentViewSet.floorplan, description: '2D Floor Plan View' },
      top: { url: currentViewSet.top, description: '3D Top/Isometric View showing the house layout from above' },
      front: { url: currentViewSet.front, description: 'Front Exterior View of the house' },
      '360': { url: currentViewSet['360'], description: '360° Exterior View' },
      side: { url: currentViewSet.side, description: 'Side View showing the house from a diagonal angle' },
      back: { url: currentViewSet.back, description: 'Back/Rear View of the house' },
    });
  }, [currentViewSet]);

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Floor Plan Available</h2>
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

  const currentView = exteriorViews[renderedView];

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
            
            <Link to="/floor-plan-result" state={{ imageUrl, description, formData, floorPlanSetId }}>
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
            <p className="text-muted-foreground">Photorealistic renderings of your home</p>
          </div>

          {/* Main Display */}
          <Card className="glass-card border-2">
            <CardContent className="p-6">
              {currentView ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={currentView.url} alt="AI Rendered View" className="w-full h-auto" />
                  <Badge className="absolute top-4 left-4 bg-primary text-white capitalize">
                    {renderedView === '360' ? '360° View' : renderedView === 'floorplan' ? 'Floor Plan' : `${renderedView} View`}
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-lg font-medium mb-2">Loading views...</p>
                </div>
              )}
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

          {/* Generated Views Gallery */}
          {Object.keys(exteriorViews).length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>All Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(exteriorViews).map(([key, view]) => (
                    <div 
                      key={key} 
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        renderedView === key ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => setRenderedView(key)}
                    >
                      <img src={view.url} alt={key} className="w-full aspect-video object-cover" />
                      <p className="text-xs p-2 text-center bg-muted/50 capitalize">
                        {key === '360' ? '360°' : key === 'floorplan' ? 'Floor Plan' : `${key}`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIRenderedView;