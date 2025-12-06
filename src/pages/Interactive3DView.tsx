import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Box, Layers, Sparkles } from "lucide-react";
import { useState } from "react";
import HouseModel3D from "@/components/3d/HouseModel3D";
import TexturedHouseModel from "@/components/3d/TexturedHouseModel";
import PhotorealisticHouseModel from "@/components/3d/PhotorealisticHouseModel";

const Interactive3DView = () => {
  const location = useLocation();
  const { imageUrl, formData, description, floorPlanSetId = 1 } = location.state || {};
  const [viewMode, setViewMode] = useState<'photorealistic' | 'textured' | 'procedural'>('photorealistic');

  // Transform form room data to HouseModel3D format
  const transformRoomsFor3D = (rooms: any[]) => {
    const transformed: { roomName: string; length: number; breadth: number }[] = [];
    
    rooms.forEach((room) => {
      const count = room.count || 1;
      for (let i = 0; i < count; i++) {
        transformed.push({
          roomName: count > 1 ? `${room.roomName} ${i + 1}` : room.roomName,
          length: room.height || 12,
          breadth: room.width || 10,
        });
      }
      
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
              Interactive <span className="bg-gradient-primary bg-clip-text text-transparent">3D Model</span>
            </h1>
            <p className="text-muted-foreground">Explore your home design in photorealistic 3D with PBR materials</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Button 
              variant={viewMode === 'photorealistic' ? 'default' : 'outline'}
              onClick={() => setViewMode('photorealistic')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Photorealistic PBR
            </Button>
            <Button 
              variant={viewMode === 'textured' ? 'default' : 'outline'}
              onClick={() => setViewMode('textured')}
              className="gap-2"
            >
              <Layers className="w-4 h-4" />
              Rendered View 3D
            </Button>
            <Button 
              variant={viewMode === 'procedural' ? 'default' : 'outline'}
              onClick={() => setViewMode('procedural')}
              className="gap-2"
            >
              <Box className="w-4 h-4" />
              Procedural 3D
            </Button>
          </div>

          {/* 3D Model Viewer */}
          <Card className="glass-card border-2">
            <CardContent className="p-4">
              {viewMode === 'photorealistic' ? (
                <PhotorealisticHouseModel 
                  floorPlanSetId={floorPlanSetId}
                  style={formData.preferences?.style || "Modern"}
                />
              ) : viewMode === 'textured' ? (
                <TexturedHouseModel 
                  floorPlanSetId={floorPlanSetId}
                  style={formData.preferences?.style || "Modern"}
                />
              ) : (
                formData?.rooms && (
                  <HouseModel3D 
                    rooms={transformRoomsFor3D(formData.rooms)} 
                    style={formData.preferences?.style || "Modern"}
                  />
                )
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">PBR Materials</h3>
                <p className="text-xs text-muted-foreground">Realistic stucco, glass, metal, and paver textures</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Home className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Dynamic Lighting</h3>
                <p className="text-xs text-muted-foreground">Midday sun with sharp shadows and ambient fill</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Layers className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Three View Modes</h3>
                <p className="text-xs text-muted-foreground">Photorealistic, rendered, and procedural 3D</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Interactive3DView;
