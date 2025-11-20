import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { ROOM_DATA, OUTDOOR_FEATURES } from "@/data/roomSizes";
import { RoomSelection } from "./Step2Rooms";
import { DesignPreferences } from "./Step3Preferences";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Step4Props {
  landArea: string;
  rooms: RoomSelection[];
  preferences: DesignPreferences;
  onPrev: () => void;
  onSubmit: () => void;
}

export const Step4Review = ({
  landArea,
  rooms,
  preferences,
  onPrev,
  onSubmit,
}: Step4Props) => {
  const calculateTotalArea = () => {
    let total = 0;
    rooms.forEach((room) => {
      const roomData = ROOM_DATA[room.roomId];
      if (roomData) {
        const sizeData = roomData.sizes[room.size];
        if (sizeData) {
          const area = sizeData.width * sizeData.height;
          total += area * room.count;
        }
      }
    });

    // Add outdoor features
    preferences.outdoorFeatures?.forEach((featureId) => {
      const feature = OUTDOOR_FEATURES[featureId];
      if (feature.sizes) {
        const defaultSize = feature.sizes.medium || feature.sizes.small;
        if (defaultSize) {
          total += defaultSize.width * defaultSize.height;
        }
      }
    });

    return total;
  };

  const totalRequiredArea = calculateTotalArea();
  const availableArea = parseFloat(landArea);
  const exceedsArea = totalRequiredArea > availableArea;
  const utilizationPercent = ((totalRequiredArea / availableArea) * 100).toFixed(1);

  const needsScaling = exceedsArea && !preferences.dynamicScaling;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-3 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Review Your Design
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Verify all details before generating your floor plan
        </p>
      </div>

      {/* Area Summary */}
      <Card
        className={cn(
          "border-2",
          exceedsArea
            ? "border-destructive/50 bg-destructive/5"
            : "border-primary/50 bg-primary/5"
        )}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Available Land Area:</span>
              <span className="text-lg font-bold">{landArea} sq ft</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Required Area:</span>
              <span className="text-lg font-bold">{totalRequiredArea} sq ft</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Utilization:</span>
              <Badge
                variant={exceedsArea ? "destructive" : "default"}
                className="text-lg px-4 py-1"
              >
                {utilizationPercent}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning/Success Alert */}
      {exceedsArea ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {preferences.dynamicScaling ? (
              <>
                <strong>Dynamic Scaling Enabled:</strong> Room sizes will be
                automatically adjusted to fit within your land area while
                maintaining minimum standards.
              </>
            ) : (
              <>
                <strong>Area Exceeded:</strong> Total required area exceeds your
                land. Please enable Dynamic Scaling, reduce rooms, or increase
                land area.
              </>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-primary/50 bg-primary/5">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            Perfect fit! Your design comfortably fits within the available land
            area.
          </AlertDescription>
        </Alert>
      )}

      {/* Room Summary */}
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-3">Selected Rooms</h3>
          <div className="space-y-2">
            {rooms.map((room) => {
              const roomData = ROOM_DATA[room.roomId];
              const sizeData = roomData.sizes[room.size];
              return (
                <div
                  key={room.roomId}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <span className="font-medium">{roomData.name}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      × {room.count}
                    </span>
                  </div>
                  <Badge variant="secondary">{sizeData.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Preferences Summary */}
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-3">Design Preferences</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Style</div>
              <div className="font-semibold">{preferences.style}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Floors</div>
              <div className="font-semibold">{preferences.floors}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Vastu</div>
              <div className="font-semibold">
                {preferences.vastuCompliant ? "Yes" : "No"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">
                Dynamic Scaling
              </div>
              <div className="font-semibold">
                {preferences.dynamicScaling ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>

          {preferences.outdoorFeatures?.length > 0 && (
            <div className="pt-2">
              <div className="text-sm text-muted-foreground mb-2">
                Outdoor Features:
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.outdoorFeatures.map((featureId) => (
                  <Badge key={featureId} variant="outline">
                    {OUTDOOR_FEATURES[featureId].name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
          size="xl"
          onClick={onSubmit}
          disabled={needsScaling}
          className="flex-1 group"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Design
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
