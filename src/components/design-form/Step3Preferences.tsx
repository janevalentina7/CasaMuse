import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Palette, Layers } from "lucide-react";
import { ARCHITECTURAL_STYLES, OUTDOOR_FEATURES } from "@/data/roomSizes";
import { cn } from "@/lib/utils";

export interface DesignPreferences {
  style: string;
  floors: number;
  vastuCompliant: boolean;
  dynamicScaling: boolean;
  outdoorFeatures: string[];
}

interface Step3Props {
  preferences: DesignPreferences;
  setPreferences: (prefs: DesignPreferences) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step3Preferences = ({
  preferences,
  setPreferences,
  onNext,
  onPrev,
}: Step3Props) => {
  const toggleOutdoorFeature = (feature: string) => {
    const current = preferences.outdoorFeatures || [];
    if (current.includes(feature)) {
      setPreferences({
        ...preferences,
        outdoorFeatures: current.filter((f) => f !== feature),
      });
    } else {
      setPreferences({
        ...preferences,
        outdoorFeatures: [...current, feature],
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card border-2">
        <CardContent className="p-8">
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Design Preferences
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Customize your house style and features
            </p>
          </div>

          <div className="space-y-6">
            {/* Architectural Style */}
            <Card className="border-border/50 glass-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Architectural Style</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {ARCHITECTURAL_STYLES.map((style) => (
            <Button
              key={style}
              type="button"
              variant={preferences.style === style ? "default" : "outline"}
              className={cn(
                "h-auto py-3 hover:scale-105 transition-all glass-button",
                preferences.style === style && "ring-4 ring-primary/30 shadow-glow"
              )}
              onClick={() => setPreferences({ ...preferences, style })}
            >
              {style}
            </Button>
              ))}
            </div>
          </CardContent>
            </Card>

            {/* Number of Floors */}
            <Card className="border-border/50 glass-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Number of Floors</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((floor) => (
                <Button
                  key={floor}
                  type="button"
                  variant={preferences.floors === floor ? "default" : "outline"}
                  className={cn(
                    "h-16 text-lg font-semibold hover:scale-105 transition-all glass-button",
                    preferences.floors === floor && "ring-4 ring-primary/30 shadow-glow"
                  )}
                  onClick={() => setPreferences({ ...preferences, floors: floor })}
                >
                  {floor}
                  <span className="text-xs block">
                    {floor === 1 ? "Floor" : "Floors"}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
            </Card>

            {/* Outdoor Features */}
            <Card className="border-border/50 glass-card">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-3">Outdoor Features</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(OUTDOOR_FEATURES).map(([id, data]) => {
                const isSelected = preferences.outdoorFeatures?.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleOutdoorFeature(id)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all hover:scale-105 glass-card",
                      isSelected
                        ? "border-primary bg-primary/10 ring-4 ring-primary/20 shadow-glow"
                        : "border-border/50 hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{data.name}</span>
                      {isSelected && (
                        <Badge variant="default" className="ml-2">
                          Selected
                        </Badge>
                      )}
                    </div>
                     {"description" in data && data.description && (
                       <p className="text-xs text-muted-foreground">
                         {data.description}
                       </p>
                     )}
                  </button>
                );
              })}
            </div>
          </CardContent>
            </Card>

            {/* Toggle Options */}
            <Card className="border-border/50 glass-card">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-3">Additional Options</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex-1">
                  <Label htmlFor="vastu" className="font-semibold cursor-pointer">
                    Vastu Compliant Design
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Follow traditional Vastu Shastra principles for room placement
                  </p>
                </div>
                <Switch
                  id="vastu"
                  checked={preferences.vastuCompliant}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, vastuCompliant: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex-1">
                  <Label htmlFor="scaling" className="font-semibold cursor-pointer">
                    Enable Dynamic Scaling
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically adjust room sizes if they exceed land area
                  </p>
                </div>
                <Switch
                  id="scaling"
                  checked={preferences.dynamicScaling}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, dynamicScaling: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onPrev}
              className="flex-1"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              variant="hero"
              size="lg"
              onClick={onNext}
              disabled={!preferences.style}
              className="flex-1 group bg-primary text-white hover:bg-primary/90"
            >
              Review & Generate
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
