import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download } from "lucide-react";

interface FloorPlanData {
  imageUrl: string;
  description: string;
  formData: any;
  id: string;
}

interface FloorPlanComparisonProps {
  plans: FloorPlanData[];
  onRemovePlan: (id: string) => void;
}

export default function FloorPlanComparison({ plans, onRemovePlan }: FloorPlanComparisonProps) {
  const handleDownload = (imageUrl: string, planId: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `floor-plan-${planId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan, index) => (
        <Card key={plan.id} className="glass-card relative group">
          <CardContent className="p-4">
            <div className="relative mb-3">
              <img
                src={plan.imageUrl}
                alt={`Floor Plan ${index + 1}`}
                className="w-full h-auto rounded-lg"
              />
              <Badge className="absolute top-2 left-2 bg-primary text-white">
                Design {index + 1}
              </Badge>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemovePlan(plan.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm line-clamp-2">
                {plan.description}
              </h3>
              
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {plan.formData?.landArea} sq ft
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {plan.formData?.rooms?.length || 0} rooms
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {plan.formData?.preferences?.style || 'Modern'}
                </Badge>
                {plan.formData?.preferences?.vastuCompliant && (
                  <Badge variant="outline" className="text-xs">
                    Vastu ✓
                  </Badge>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => handleDownload(plan.imageUrl, plan.id)}
              >
                <Download className="w-3 h-3 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {plans.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            No floor plans added for comparison yet.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Generate multiple designs and add them here to compare.
          </p>
        </div>
      )}
    </div>
  );
}
