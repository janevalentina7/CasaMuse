import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, ArrowRight, FileText, Box, Eye, IndianRupee, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import PDFExporter from "@/components/PDFExporter";
import CostEstimationEnhanced from "@/components/CostEstimationEnhanced";
import HouseModel3D from "@/components/3d/HouseModel3D";

const DesignSummary = () => {
  const location = useLocation();
  const { imageUrl, formData, description, costEstimationData: initialCostData } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [exteriorViews, setExteriorViews] = useState<{ [key: string]: string }>({});
  const [interiorViews, setInteriorViews] = useState<{ [key: string]: string }>({});
  const [generatingViews, setGeneratingViews] = useState<Set<string>>(new Set());
  const [costEstimationData, setCostEstimationData] = useState<any>(initialCostData || null);
  const [isGeneratingCost, setIsGeneratingCost] = useState(false);
  const [show3DModel, setShow3DModel] = useState(false);
  const hasStartedGeneration = useRef(false);

  const generateView = async (viewType: string, roomName?: string) => {
    if (!imageUrl || !formData) return;
    const viewKey = roomName || viewType;
    setGeneratingViews(prev => new Set(prev).add(viewKey));
    try {
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          floorPlanImageUrl: imageUrl, landArea: formData.landArea,
          rooms: formData.rooms, preferences: formData.preferences,
          view: roomName ? 'interior' : viewType, specificRoom: roomName,
        }
      });
      if (error) throw error;
      if (data?.success && data?.imageUrl) {
        if (roomName) setInteriorViews(prev => ({ ...prev, [roomName]: data.imageUrl }));
        else setExteriorViews(prev => ({ ...prev, [viewType]: data.imageUrl }));
      }
    } catch (error) { console.error('Error generating view:', error); }
    finally {
      setGeneratingViews(prev => { const next = new Set(prev); next.delete(viewKey); return next; });
    }
  };

  const generateAllViewsParallel = async () => {
    if (!formData?.rooms) return;
    setIsGenerating(true);
    toast.info("Generating all views...");
    const exteriorTypes = ['360', 'front', 'side', 'back', 'top'];
    const allRooms = getAllRoomNames();
    for (let i = 0; i < exteriorTypes.length; i += 3) {
      await Promise.all(exteriorTypes.slice(i, i + 3).map(view => generateView(view)));
    }
    for (let i = 0; i < allRooms.length; i += 3) {
      await Promise.all(allRooms.slice(i, i + 3).map(roomName => generateView('interior', roomName)));
    }
    setIsGenerating(false);
    toast.success("All views generated!");
  };

  const generateCostEstimation = async () => {
    if (!formData) return;
    setIsGeneratingCost(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cost-estimation', {
        body: { landArea: formData.landArea, rooms: formData.rooms, preferences: formData.preferences, floorPlanDescription: description }
      });
      if (error) throw error;
      if (data?.success && data?.estimation) { setCostEstimationData(data.estimation); toast.success("Cost estimation generated!"); }
    } catch (error) { console.error('Error:', error); toast.error("Failed to generate cost estimation"); }
    finally { setIsGeneratingCost(false); }
  };

  useEffect(() => {
    if (!imageUrl || !formData || hasStartedGeneration.current) return;
    hasStartedGeneration.current = true;
    generateAllViewsParallel();
    if (!costEstimationData) generateCostEstimation();
  }, [imageUrl, formData]);

  const getAllRoomNames = () => {
    if (!formData?.rooms) return [];
    const names: string[] = [];
    formData.rooms.forEach((room: any) => {
      const count = room.count || 1;
      for (let i = 0; i < count; i++) {
        const name = count > 1 ? `${room.roomName} ${i + 1}` : room.roomName;
        names.push(name);
        if (room.attachedBathroom) names.push(`Bathroom (${name})`);
      }
    });
    return names;
  };

  const transformRoomsFor3D = (rooms: any[]) => {
    const transformed: { roomName: string; length: number; breadth: number }[] = [];
    rooms.forEach((room) => {
      const count = room.count || 1;
      for (let i = 0; i < count; i++) {
        transformed.push({ roomName: count > 1 ? `${room.roomName} ${i + 1}` : room.roomName, length: room.height || 12, breadth: room.width || 10 });
      }
      if (room.attachedBathroom && room.count > 0) {
        for (let i = 0; i < count; i++) {
          transformed.push({ roomName: `Bathroom (${count > 1 ? room.roomName + ' ' + (i + 1) : room.roomName})`, length: 7, breadth: 6 });
        }
      }
    });
    return transformed;
  };

  if (!imageUrl || !formData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Design Data Available</h2>
            <p className="text-muted-foreground mb-6">Please generate a floor plan first.</p>
            <Link to="/design"><Button variant="hero"><ArrowLeft className="w-4 h-4 mr-2" />Back to Design Tool</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allRoomNames = getAllRoomNames();

  return (
    <div className="min-h-screen bg-gradient-hero">
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
              <PDFExporter formData={formData} imageUrl={imageUrl} description={description} costEstimationData={costEstimationData?.summary} exteriorViews={exteriorViews} interiorViews={interiorViews} />
              <Link to="/cost-estimation" state={{ imageUrl, description, formData, costEstimationData }}>
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="hero" size="sm">Go to Dashboard<ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Project <span className="bg-gradient-primary bg-clip-text text-transparent">Summary</span>
            </h1>
            <p className="text-muted-foreground">Complete overview of your home design</p>
          </div>

          {/* Design Inputs */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Your Design Inputs</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Land Area</p>
                  <p className="text-lg font-semibold">{formData.landArea} sq ft</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Style</p>
                  <p className="text-lg font-semibold">{formData.preferences?.style || 'Modern'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Floors</p>
                  <p className="text-lg font-semibold">{formData.preferences?.floors || 1}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Vastu</p>
                  <p className="text-lg font-semibold">{formData.preferences?.vastuCompliant ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Rooms</p>
                <div className="flex flex-wrap gap-2">
                  {formData.rooms?.map((room: any, i: number) => (
                    <Badge key={i} variant="secondary">{room.count}x {room.roomName} ({room.width}'×{room.height}'){room.attachedBathroom && ' + Bath'}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Floor Plan */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Floor Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden bg-white"><img src={imageUrl} alt="Floor Plan" className="w-full h-auto" /></div>
              {description && <p className="mt-4 text-sm text-muted-foreground">{description}</p>}
            </CardContent>
          </Card>

          {/* 3D Model */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Box className="w-5 h-5" />3D Model</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShow3DModel(!show3DModel)}>
                {show3DModel ? 'Hide' : 'Show'} 3D Model
              </Button>
            </CardHeader>
            <CardContent>
              {show3DModel ? (
                <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                  <HouseModel3D rooms={transformRoomsFor3D(formData.rooms || [])} style={formData.preferences?.style || 'Modern'} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={() => setShow3DModel(true)}><Box className="w-4 h-4 mr-2" />Show 3D Preview</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exterior Views */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" />Exterior Views</CardTitle>
              <Button size="sm" onClick={generateAllViewsParallel} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {['360', 'front', 'side', 'back', 'top'].map(view => (
                  <div key={view} className="space-y-2">
                    <div className="aspect-video rounded-lg bg-muted/50 overflow-hidden relative">
                      {exteriorViews[view] ? (
                        <img src={exteriorViews[view]} alt={`${view} view`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {generatingViews.has(view) ? <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /> :
                            <Button size="sm" variant="ghost" onClick={() => generateView(view)}>Generate</Button>}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-center capitalize">{view === '360' ? '360° View' : `${view} View`}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interior Views */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Home className="w-5 h-5" />Interior Views</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allRoomNames.map(roomName => (
                  <div key={roomName} className="space-y-2">
                    <div className="aspect-video rounded-lg bg-muted/50 overflow-hidden">
                      {interiorViews[roomName] ? (
                        <img src={interiorViews[roomName]} alt={roomName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {generatingViews.has(roomName) ? <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /> :
                            <Button size="sm" variant="ghost" onClick={() => generateView('interior', roomName)}>Generate</Button>}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-center">{roomName}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Estimation */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5" />Cost Estimation</CardTitle>
              {!costEstimationData && (
                <Button size="sm" onClick={generateCostEstimation} disabled={isGeneratingCost}>
                  {isGeneratingCost ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Generate
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isGeneratingCost ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Generating cost estimation...</p>
                </div>
              ) : costEstimationData ? (
                <CostEstimationEnhanced data={costEstimationData} formData={formData} onUpdate={(d: any) => setCostEstimationData(d)} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Cost estimation not generated yet</p>
                  <Button onClick={generateCostEstimation}><IndianRupee className="w-4 h-4 mr-2" />Generate</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t border-border/50">
            <Link to="/cost-estimation" state={{ imageUrl, description, formData, costEstimationData }}>
              <Button variant="outline" size="lg"><ArrowLeft className="w-4 h-4 mr-2" />Previous: Cost Estimation</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero" size="lg">Go to Dashboard<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesignSummary;
