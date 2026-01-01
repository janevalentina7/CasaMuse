import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, Box, Eye, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const AIRenderedView = () => {
  const location = useLocation();
  const { imageUrl, formData, description } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderedView, setRenderedView] = useState<string>('360');
  const [exteriorViews, setExteriorViews] = useState<{ [key: string]: { url: string; description: string } }>({});
  const [interiorViews, setInteriorViews] = useState<{ [key: string]: { url: string; description: string } }>({});
  const [showExterior, setShowExterior] = useState(true);
  const [showInterior, setShowInterior] = useState(true);
  const [generatingView, setGeneratingView] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const hasStartedGeneration = useRef(false);

  // Get all room names from form data
  const getAllRoomNames = () => {
    if (!formData?.rooms) return [];
    const roomNames: string[] = [];
    
    formData.rooms.forEach((room: any) => {
      const count = room.count || 1;
      for (let i = 0; i < count; i++) {
        const name = count > 1 ? `${room.roomName} ${i + 1}` : room.roomName;
        roomNames.push(name);
        
        if (room.attachedBathroom) {
          roomNames.push(`Bathroom (${name})`);
        }
      }
    });
    
    return roomNames;
  };

  const handleGenerateView = async (viewType: string, roomName?: string): Promise<boolean> => {
    if (!imageUrl || !formData) {
      return false;
    }

    const viewKey = roomName || viewType;
    setGeneratingView(viewKey);
    setRenderedView(viewKey);

    try {
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          floorPlanImageUrl: imageUrl,
          landArea: formData.landArea,
          rooms: formData.rooms,
          preferences: formData.preferences,
          view: roomName ? 'interior' : viewType,
          specificRoom: roomName,
        }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        if (roomName) {
          setInteriorViews(prev => ({ 
            ...prev, 
            [roomName]: { url: data.imageUrl, description: data.description || '' } 
          }));
        } else {
          setExteriorViews(prev => ({ 
            ...prev, 
            [viewType]: { url: data.imageUrl, description: data.description || '' } 
          }));
        }
        return true;
      } else {
        throw new Error(data?.error || "Failed to generate view");
      }
    } catch (error) {
      console.error('Error generating view:', error);
      return false;
    } finally {
      setGeneratingView(null);
    }
  };

  // Auto-generate all views on page load
  useEffect(() => {
    if (!imageUrl || !formData || hasStartedGeneration.current) return;
    
    hasStartedGeneration.current = true;
    
    const generateAllViews = async () => {
      const exteriorTypes = ['360', 'front', 'side', 'back', 'top'];
      const allRooms = getAllRoomNames();
      const totalViews = exteriorTypes.length + allRooms.length;
      
      setIsGenerating(true);
      setGenerationProgress({ current: 0, total: totalViews });
      toast.info(`Generating ${totalViews} views automatically...`);
      
      let completed = 0;
      
      // Generate exterior views
      for (const view of exteriorTypes) {
        await handleGenerateView(view);
        completed++;
        setGenerationProgress({ current: completed, total: totalViews });
      }
      
      // Generate interior views for all rooms
      for (const roomName of allRooms) {
        await handleGenerateView('interior', roomName);
        completed++;
        setGenerationProgress({ current: completed, total: totalViews });
      }
      
      setIsGenerating(false);
      setGenerationProgress({ current: 0, total: 0 });
      toast.success(`All ${totalViews} views generated!`);
      setRenderedView('360');
    };
    
    generateAllViews();
  }, [imageUrl, formData]);

  if (!imageUrl || !formData) {
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

  const allRoomNames = getAllRoomNames();
  const exteriorTypes = ['360', 'front', 'side', 'back', 'top'];
  const currentView = exteriorViews[renderedView] || interiorViews[renderedView];

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
            <p className="text-muted-foreground">Photorealistic renderings of your home - exterior and all rooms</p>
          </div>

          {/* Main Display */}
          <Card className="glass-card border-2">
            <CardContent className="p-6">
              {generatingView === renderedView ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Generating AI rendered view...</p>
                </div>
              ) : currentView ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={currentView.url} alt="AI Rendered View" className="w-full h-auto" />
                  <Badge className="absolute top-4 left-4 bg-primary text-white">
                    {renderedView === '360' ? '360° View' : renderedView}
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Box className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Select a view to generate</p>
                  <p className="text-muted-foreground mb-4">Choose from exterior views or interior rooms below</p>
                  <Button onClick={() => handleGenerateView('360')}>
                    Generate 360° View
                  </Button>
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

          {/* Exterior Views Section */}
          <Collapsible open={showExterior} onOpenChange={setShowExterior}>
            <Card className="glass-card">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Exterior Views
                    </span>
                    {showExterior ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {exteriorTypes.map((view) => (
                      <Button
                        key={view}
                        variant={renderedView === view && exteriorViews[view] ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleGenerateView(view)}
                        disabled={isGenerating}
                        className="relative"
                      >
                        {generatingView === view ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 mr-2" />
                        )}
                        {view === '360' ? '360° View' : `${view.charAt(0).toUpperCase() + view.slice(1)} View`}
                        {exteriorViews[view] && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Interior Views Section - ALL ROOMS */}
          <Collapsible open={showInterior} onOpenChange={setShowInterior}>
            <Card className="glass-card">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Interior Views ({allRoomNames.length} Rooms)
                    </span>
                    {showInterior ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {isGenerating 
                      ? `Generating views... (${generationProgress.current}/${generationProgress.total})`
                      : 'All interior views are auto-generated on page load.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allRoomNames.map((roomName) => (
                      <Button
                        key={roomName}
                        variant={renderedView === roomName && interiorViews[roomName] ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleGenerateView('interior', roomName)}
                        disabled={isGenerating}
                        className="relative"
                      >
                        {generatingView === roomName ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Home className="w-4 h-4 mr-2" />
                        )}
                        {roomName}
                        {interiorViews[roomName] && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Generated Views Gallery */}
          {(Object.keys(exteriorViews).length > 0 || Object.keys(interiorViews).length > 0) && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Generated Views Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(exteriorViews).map(([key, view]) => (
                    <div 
                      key={key} 
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        renderedView === key ? 'border-primary' : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => setRenderedView(key)}
                    >
                      <img src={view.url} alt={key} className="w-full aspect-video object-cover" />
                      <p className="text-xs p-2 text-center bg-muted/50 capitalize">
                        {key === '360' ? '360° View' : `${key} View`}
                      </p>
                    </div>
                  ))}
                  {Object.entries(interiorViews).map(([key, view]) => (
                    <div 
                      key={key} 
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        renderedView === key ? 'border-primary' : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => setRenderedView(key)}
                    >
                      <img src={view.url} alt={key} className="w-full aspect-video object-cover" />
                      <p className="text-xs p-2 text-center bg-muted/50">{key}</p>
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
