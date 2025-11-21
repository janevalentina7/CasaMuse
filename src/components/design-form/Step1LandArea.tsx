import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Step1Props {
  landArea: string;
  setLandArea: (value: string) => void;
  onNext: () => void;
  error?: string;
}

export const Step1LandArea = ({ landArea, setLandArea, onNext, error }: Step1Props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <Card className="glass-card border-2">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow">
              <Ruler className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              What's Your Land Area?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter the total area of your plot in square feet
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="landArea" className="text-lg font-semibold">
              Total Land Area (sq ft)
            </Label>
            
            <div className="relative">
              <Input
                id="landArea"
                type="number"
                placeholder="e.g., 1200"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                className="text-2xl h-16 pr-20 text-center font-semibold"
                min="100"
                max="100000"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                sq ft
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[600, 1000, 1500, 2000].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLandArea(value.toString())}
                  className="hover:border-primary hover:text-primary"
                >
                  {value} sq ft
                </Button>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">💡 Typical Plot Sizes:</p>
              <ul className="space-y-1 text-xs">
                <li>• 600-800 sq ft: Small apartment/1BHK</li>
                <li>• 1000-1500 sq ft: 2-3 BHK house</li>
                <li>• 1500-2500 sq ft: Spacious 3-4 BHK villa</li>
                <li>• 2500+ sq ft: Large luxury homes</li>
              </ul>
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full group glass-button mt-6"
            disabled={!landArea || parseFloat(landArea) < 100}
          >
            Continue to Room Selection
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
