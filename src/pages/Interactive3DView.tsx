import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, ArrowRight, Box } from "lucide-react";
import HouseModel3D from "@/components/3d/HouseModel3D";

const Interactive3DView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, formData, description } = location.state || {};

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
            length: 7, breadth: 6,
          });
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
            <h2 className="text-2xl font-bold mb-4">No Floor Plan Available</h2>
            <p className="text-muted-foreground mb-6">Please generate a floor plan first.</p>
            <Link to="/design">
              <Button variant="hero"><ArrowLeft className="w-4 h-4 mr-2" />Back to Design Tool</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Link to="/ai-rendered-view" state={{ imageUrl, description, formData }}>
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              </Link>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/vr-walkthrough', { state: { imageUrl, description, formData } })}
              >
                Next: VR Walkthrough<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Interactive <span className="bg-gradient-primary bg-clip-text text-transparent">3D Model</span>
            </h1>
            <p className="text-muted-foreground">Explore your home design in full 3D with VR support</p>
          </div>

          <Card className="glass-card border-2">
            <CardContent className="p-4">
              {formData?.rooms && (
                <HouseModel3D
                  rooms={transformRoomsFor3D(formData.rooms)}
                  style={formData.preferences?.style || "Modern"}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Box className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Rotate & Zoom</h3>
                <p className="text-xs text-muted-foreground">Click and drag to rotate, scroll to zoom</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Home className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Navigate</h3>
                <p className="text-xs text-muted-foreground">Use WASD or arrow keys to walk around</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Box className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">VR Ready</h3>
                <p className="text-xs text-muted-foreground">Connect VR headset for immersive experience</p>
              </CardContent>
            </Card>
          </div>

          {/* Sequential Navigation */}
          <div className="flex justify-between pt-8 border-t border-border/50">
            <Link to="/ai-rendered-view" state={{ imageUrl, description, formData }}>
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />Previous: AI Rendered Views
              </Button>
            </Link>
            <Link to="/vr-walkthrough" state={{ imageUrl, description, formData }}>
              <Button variant="hero" size="lg">
                Next: VR Walkthrough<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Interactive3DView;
