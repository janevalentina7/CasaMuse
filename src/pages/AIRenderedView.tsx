import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, Box, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AIRenderedView = () => {
  const location = useLocation();
  const { imageUrl, formData, description } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
  const [model3DDescription, setModel3DDescription] = useState<string>("");
  const [renderedView, setRenderedView] = useState<'360' | 'top' | 'front' | 'side' | 'back' | 'interior'>('360');

  const handleGenerateRenderedView = async (view: '360' | 'top' | 'front' | 'side' | 'back' | 'interior') => {
    if (!imageUrl || !formData) {
      toast.error("Floor plan data not available");
      return;
    }

    setIsGenerating(true);
    setRenderedView(view);
    const viewLabels = {
      '360': '360° View',
      'top': 'Top View',
      'front': 'Front View',
      'side': 'Side View',
      'back': 'Back View',
      'interior': 'Interior View'
    };
    toast.info(`Generating ${viewLabels[view]}...`);

    try {
      const { data, error } = await supabase.functions.invoke('generate-3d-model', {
        body: {
          floorPlanImageUrl: imageUrl,
          landArea: formData.landArea,
          rooms: formData.rooms,
          preferences: formData.preferences,
          view: view === 'front' ? '360' : view,
        }
      });

      if (error) throw error;

      if (data?.success && data?.imageUrl) {
        setModel3DUrl(data.imageUrl);
        setModel3DDescription(data.description);
        toast.success(`${viewLabels[view]} generated!`);
      } else {
        throw new Error(data?.error || "Failed to generate view");
      }
    } catch (error) {
      console.error('Error generating view:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate view");
    } finally {
      setIsGenerating(false);
    }
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
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              AI Rendered <span className="bg-gradient-primary bg-clip-text text-transparent">Views</span>
            </h1>
            <p className="text-muted-foreground">Photorealistic renderings of your home design</p>
          </div>

          {/* View Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {(['360', 'top', 'front', 'side', 'back', 'interior'] as const).map((view) => (
              <Button
                key={view}
                variant={renderedView === view && model3DUrl ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGenerateRenderedView(view)}
                disabled={isGenerating}
              >
                {isGenerating && renderedView === view ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {view === '360' ? '360° View' : view.charAt(0).toUpperCase() + view.slice(1) + ' View'}
              </Button>
            ))}
          </div>

          {/* Rendered Image */}
          <Card className="glass-card border-2">
            <CardContent className="p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Generating AI rendered view...</p>
                </div>
              ) : model3DUrl ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={model3DUrl} alt="AI Rendered View" className="w-full h-auto" />
                  <Badge className="absolute top-4 left-4 bg-primary text-white">
                    {renderedView === '360' ? '360° View' : renderedView.charAt(0).toUpperCase() + renderedView.slice(1) + ' View'}
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Box className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No rendered view yet</p>
                  <p className="text-muted-foreground mb-4">Click a view button above to generate an AI rendered image</p>
                  <Button onClick={() => handleGenerateRenderedView('360')}>
                    Generate 360° View
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {model3DDescription && (
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{model3DDescription}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIRenderedView;
