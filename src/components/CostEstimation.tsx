import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  IndianRupee, 
  Home, 
  Hammer, 
  Lightbulb, 
  Droplets, 
  Brush,
  TrendingDown,
  TrendingUp,
  Info
} from "lucide-react";

interface CostEstimationProps {
  data: {
    summary?: {
      totalCost: number;
      costPerSqFt: number;
      breakdown: {
        civil: number;
        interior: number;
        exterior: number;
        labor: number;
        electrical: number;
        plumbing: number;
      };
      buildTime: string;
    };
    materials?: Array<{
      category: string;
      items: Array<{
        name: string;
        quantity: string;
        cost: number;
        total: number;
        advantages: string[];
        disadvantages: string[];
        alternatives?: string;
      }>;
    }>;
    costOptimization?: {
      savings: Array<{
        area: string;
        suggestion: string;
        savings: number;
      }>;
      improvements: Array<{
        area: string;
        suggestion: string;
        additionalCost: number;
        benefit: string;
      }>;
    };
    fullDetails?: string;
  };
}

export default function CostEstimation({ data }: CostEstimationProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {data.summary && (
        <Card className="glass-card border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-primary" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(data.summary.totalCost)}
                </p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Cost per Sq Ft</p>
                <p className="text-2xl font-bold text-secondary">
                  {formatCurrency(data.summary.costPerSqFt)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded">
                <Home className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Civil</p>
                  <p className="font-semibold text-sm">{formatCurrency(data.summary.breakdown.civil)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded">
                <Brush className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Interior</p>
                  <p className="font-semibold text-sm">{formatCurrency(data.summary.breakdown.interior)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded">
                <Home className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Exterior</p>
                  <p className="font-semibold text-sm">{formatCurrency(data.summary.breakdown.exterior)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded">
                <Hammer className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Labor</p>
                  <p className="font-semibold text-sm">{formatCurrency(data.summary.breakdown.labor)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded">
                <Lightbulb className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Electrical</p>
                  <p className="font-semibold text-sm">{formatCurrency(data.summary.breakdown.electrical)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded">
                <Droplets className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Plumbing</p>
                  <p className="font-semibold text-sm">{formatCurrency(data.summary.breakdown.plumbing)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 bg-accent/20 rounded">
              <Info className="w-4 h-4" />
              <p className="text-sm">Estimated build time: <strong>{data.summary.buildTime}</strong></p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials Section */}
      {data.materials && data.materials.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Material Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.materials.map((category, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Badge variant="outline">{category.category}</Badge>
                </h3>
                <div className="space-y-4">
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Unit Cost</p>
                          <p className="font-semibold">{formatCurrency(item.cost)}</p>
                          <p className="text-lg font-bold text-primary">{formatCurrency(item.total)}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm font-semibold text-green-600 mb-2">✓ Advantages</p>
                          <ul className="text-sm space-y-1">
                            {item.advantages.map((adv, i) => (
                              <li key={i} className="text-muted-foreground">• {adv}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-orange-600 mb-2">⚠ Considerations</p>
                          <ul className="text-sm space-y-1">
                            {item.disadvantages.map((dis, i) => (
                              <li key={i} className="text-muted-foreground">• {dis}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {item.alternatives && (
                        <div className="mt-3 p-2 bg-accent/20 rounded text-sm">
                          <strong>Alternatives:</strong> {item.alternatives}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {idx < data.materials.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cost Optimization Section */}
      {data.costOptimization && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Savings */}
          {data.costOptimization.savings.length > 0 && (
            <Card className="glass-card border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingDown className="w-5 h-5" />
                  Cost Savings Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.costOptimization.savings.map((saving, idx) => (
                  <div key={idx} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm">{saving.area}</h4>
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        Save {formatCurrency(saving.savings)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{saving.suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {data.costOptimization.improvements.length > 0 && (
            <Card className="glass-card border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                  Value Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.costOptimization.improvements.map((improvement, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm">{improvement.area}</h4>
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        +{formatCurrency(improvement.additionalCost)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{improvement.suggestion}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      <strong>Benefit:</strong> {improvement.benefit}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Full Details */}
      {data.fullDetails && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {data.fullDetails}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
