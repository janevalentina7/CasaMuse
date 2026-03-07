import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, ArrowRight, Box, Eye, Loader2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { viewCache } from "@/lib/viewCache";

const AIRenderedView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, formData, description } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderedView, setRenderedView] = useState<string>('360');
  // Restore cached views on mount
  const cachedExterior = viewCache.getExteriorViews();
  const cachedInterior = viewCache.getInteriorViews();
  const [exteriorViews, setExteriorViews] = useState<{ [key: string]: { url: string; description: string } }>(cachedExterior);
  const [interiorViews, setInteriorViews] = useState<{ [key: string]: { url: string; description: string } }>(cachedInterior);
  const [showExterior, setShowExterior] = useState(true);
  const [showInterior, setShowInterior] = useState(true);
  const [generatingViews, setGeneratingViews] = useState<Set<string>>(new Set());
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const hasStartedGeneration = useRef(false);

  // Also cache floor plan data for other pages to read
  useEffect(() => {
    if (imageUrl && formData) {
      viewCache.saveFloorPlan({ imageUrl, description, formData });
    }
  }, [imageUrl, formData, description]);

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

  const handleGenerateView = async (viewType: string, roomName?: string, forceRegenerate = false): Promise<boolean> => {
    if (!imageUrl || !formData) {
      return false;
    }

    const viewKey = roomName || viewType;
    
    // Skip if already generated and not forcing regenerate
    if (!forceRegenerate && (exteriorViews[viewKey] || interiorViews[viewKey])) {
      setRenderedView(viewKey);
      return true;
    }

    setGeneratingViews(prev => new Set(prev).add(viewKey));
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
          setInteriorViews(prev => {
            const updated = { ...prev, [roomName]: { url: data.imageUrl, description: data.description || '' } };
            viewCache.saveInteriorViews(updated);
            return updated;
          });
        } else {
          setExteriorViews(prev => {
            const updated = { ...prev, [viewType]: { url: data.imageUrl, description: data.description || '' } };
            viewCache.saveExteriorViews(updated);
            return updated;
          });
        }
        return true;
      } else {
        throw new Error(data?.error || "Failed to generate view");
      }
    } catch (error) {
      console.error('Error generating view:', error);
      return false;
    } finally {
      setGeneratingViews(prev => {
        const next = new Set(prev);
        next.delete(viewKey);
        return next;
      });
    }
  };

  // Generate views in parallel batches for faster generation
  const generateAllViewsParallel = async () => {
    const exteriorTypes = ['360', 'front', 'side', 'back', 'top'];
    const allRooms = getAllRoomNames();
    const totalViews = exteriorTypes.length + allRooms.length;
    
    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: totalViews });
    toast.info(`Generating ${totalViews} views in parallel...`);
    
    let completed = 0;
    const updateProgress = () => {
      completed++;
      setGenerationProgress({ current: completed, total: totalViews });
    };
    
    // Generate exterior views in parallel (batch of 5 for speed)
    const exteriorBatches = [];
    for (let i = 0; i < exteriorTypes.length; i += 5) {
      exteriorBatches.push(exteriorTypes.slice(i, i + 5));
    }
    
    for (const batch of exteriorBatches) {
      await Promise.all(batch.map(async (view) => {
        await handleGenerateView(view);
        updateProgress();
      }));
    }
    
    // Generate interior views in parallel (batch of 5 for speed)
    const interiorBatches = [];
    for (let i = 0; i < allRooms.length; i += 5) {
      interiorBatches.push(allRooms.slice(i, i + 5));
    }
    
    for (const batch of interiorBatches) {
      await Promise.all(batch.map(async (roomName) => {
        await handleGenerateView('interior', roomName);
        updateProgress();
      }));
    }
    
    setIsGenerating(false);
    setGenerationProgress({ current: 0, total: 0 });
    toast.success(`All ${totalViews} views generated!`);
    setRenderedView('360');
  };

  // Auto-generate only if no cached views exist
  useEffect(() => {
    if (!imageUrl || !formData || hasStartedGeneration.current) return;
    
    // Skip generation if we already have cached views
    const hasCachedViews = Object.keys(cachedExterior).length > 0 || Object.keys(cachedInterior).length > 0;
    if (hasCachedViews) {
      hasStartedGeneration.current = true;
      return;
    }
    
    hasStartedGeneration.current = true;
    generateAllViewsParallel();
  }, [imageUrl, formData]);

  const handleRegenerateView = async (viewKey: string, isInterior: boolean) => {
    toast.info(`Regenerating ${viewKey}...`);
    if (isInterior) {
      await handleGenerateView('interior', viewKey, true);
    } else {
      await handleGenerateView(viewKey, undefined, true);
    }
    toast.success(`${viewKey} regenerated!`);
  };

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
  const isCurrentViewGenerating = generatingViews.has(renderedView);

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
              <Link to="/floor-plan-result" state={{ imageUrl, description, formData }}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Floor Plan
                </Button>
              </Link>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/interactive-3d', { state: { imageUrl, description, formData, exteriorViews, interiorViews } })}
              >
                Next: 3D Model<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
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
            {isGenerating && (
              <p className="text-sm text-primary">
                Generating views... ({generationProgress.current}/{generationProgress.total})
              </p>
            )}
          </div>

          {/* Main Display */}
          <Card className="glass-card border-2">
            <CardContent className="p-6">
              {isCurrentViewGenerating ? (
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
                  {/* Regenerate button */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-4 right-4"
                    onClick={() => handleRegenerateView(renderedView, !!interiorViews[renderedView])}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
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

          {/* Meshy 3D conversion moved to Interactive 3D page */}

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
                      <div key={view} className="flex items-center gap-1">
                        <Button
                          variant={renderedView === view && exteriorViews[view] ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setRenderedView(view);
                            if (!exteriorViews[view]) handleGenerateView(view);
                          }}
                          disabled={isGenerating}
                          className="relative"
                        >
                          {generatingViews.has(view) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4 mr-2" />
                          )}
                          {view === '360' ? '360° View' : `${view.charAt(0).toUpperCase() + view.slice(1)} View`}
                          {exteriorViews[view] && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </Button>
                        {exteriorViews[view] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateView(view, false)}
                            disabled={isGenerating || generatingViews.has(view)}
                            className="p-1 h-8 w-8"
                            title="Regenerate this view"
                          >
                            <RefreshCw className={`w-3 h-3 ${generatingViews.has(view) ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                      </div>
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
                      ? `Generating views in parallel... (${generationProgress.current}/${generationProgress.total})`
                      : 'All interior views are auto-generated. Click regenerate to get a different result.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allRoomNames.map((roomName) => (
                      <div key={roomName} className="flex items-center gap-1">
                        <Button
                          variant={renderedView === roomName && interiorViews[roomName] ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setRenderedView(roomName);
                            if (!interiorViews[roomName]) handleGenerateView('interior', roomName);
                          }}
                          disabled={isGenerating}
                          className="relative"
                        >
                          {generatingViews.has(roomName) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Home className="w-4 h-4 mr-2" />
                          )}
                          {roomName}
                          {interiorViews[roomName] && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </Button>
                        {interiorViews[roomName] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateView(roomName, true)}
                            disabled={isGenerating || generatingViews.has(roomName)}
                            className="p-1 h-8 w-8"
                            title="Regenerate this view"
                          >
                            <RefreshCw className={`w-3 h-3 ${generatingViews.has(roomName) ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                      </div>
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
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all relative group ${
                        renderedView === key ? 'border-primary' : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => setRenderedView(key)}
                    >
                      <img src={view.url} alt={key} className="w-full aspect-video object-cover" />
                      <p className="text-xs p-2 text-center bg-muted/50 capitalize">
                        {key === '360' ? '360° View' : `${key} View`}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateView(key, false);
                        }}
                        disabled={generatingViews.has(key)}
                      >
                        <RefreshCw className={`w-3 h-3 ${generatingViews.has(key) ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  ))}
                  {Object.entries(interiorViews).map(([key, view]) => (
                    <div 
                      key={key} 
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all relative group ${
                        renderedView === key ? 'border-primary' : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => setRenderedView(key)}
                    >
                      <img src={view.url} alt={key} className="w-full aspect-video object-cover" />
                      <p className="text-xs p-2 text-center bg-muted/50">{key}</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateView(key, true);
                        }}
                        disabled={generatingViews.has(key)}
                      >
                        <RefreshCw className={`w-3 h-3 ${generatingViews.has(key) ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sequential Navigation */}
          <div className="flex justify-between pt-8 border-t border-border/50">
            <Link to="/floor-plan-result" state={{ imageUrl, description, formData }}>
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />Previous: Floor Plan
              </Button>
            </Link>
            <Link to="/interactive-3d" state={{ imageUrl, description, formData, exteriorViews, interiorViews }}>
              <Button variant="hero" size="lg">
                Next: 3D Model<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIRenderedView;