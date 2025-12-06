import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Box, RotateCcw } from "lucide-react";
import HouseModel3D from "@/components/3d/HouseModel3D";

// Default rooms for demo when no formData is provided
const DEFAULT_ROOMS = [
  { roomName: "Living Room", length: 18, breadth: 28 },
  { roomName: "Kitchen & Dining", length: 16, breadth: 24 },
  { roomName: "Master Suite", length: 13, breadth: 20 },
  { roomName: "Bedroom 2", length: 13, breadth: 13 },
  { roomName: "Bedroom 3", length: 10, breadth: 12 },
  { roomName: "Guest Room 1", length: 12, breadth: 16 },
  { roomName: "Guest Room 2", length: 10, breadth: 14 },
  { roomName: "Family Room", length: 10, breadth: 14 },
  { roomName: "Bathroom 1", length: 6, breadth: 10 },
  { roomName: "Bathroom 2", length: 6, breadth: 7 },
  { roomName: "En-Suite Bath", length: 8, breadth: 18 },
  { roomName: "Garage", length: 28, breadth: 20 },
];

const Interactive3DView = () => {
  const location = useLocation();
  const { imageUrl, formData, description } = location.state || {};

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

  // Use formData rooms if available, otherwise use default rooms
  const rooms3D = formData?.rooms 
    ? transformRoomsFor3D(formData.rooms) 
    : DEFAULT_ROOMS;

  const style = formData?.preferences?.style || "Modern";

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
              <Link to="/ai-rendered-view" state={{ imageUrl, description, formData }}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  AI Rendered Views
                </Button>
              </Link>
              <Link to="/floor-plan-result" state={{ imageUrl, description, formData }}>
                <Button variant="ghost" size="sm">
                  Back to Results
                </Button>
              </Link>
            </div>
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
            <p className="text-muted-foreground">Explore your home design in full 3D with VR support</p>
          </div>

          {/* 3D Model Viewer */}
          <Card className="glass-card border-2">
            <CardContent className="p-4">
              <HouseModel3D 
                rooms={rooms3D} 
                style={style}
              />
            </CardContent>
          </Card>

          {/* Info */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-primary" />
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
        </div>
      </main>
    </div>
  );
};

export default Interactive3DView;