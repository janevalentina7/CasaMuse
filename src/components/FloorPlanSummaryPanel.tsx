import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Info, Home, Ruler, MapPin } from 'lucide-react';
import { FloorPlanSummary } from '@/utils/floorPlanGenerator';

interface FloorPlanSummaryPanelProps {
  summary: FloorPlanSummary;
  style?: string;
}

export const FloorPlanSummaryPanel: React.FC<FloorPlanSummaryPanelProps> = ({
  summary,
  style = 'Modern'
}) => {
  const utilizationPercent = Math.round((summary.totalBuiltUpArea / summary.totalLandArea) * 100);
  
  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Home className="w-5 h-5 text-primary" />
          Floor Plan Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Area Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Land Area</div>
            <div className="text-lg font-bold">{summary.totalLandArea.toLocaleString()} sq ft</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Built-up Area</div>
            <div className="text-lg font-bold">{summary.totalBuiltUpArea.toLocaleString()} sq ft</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Rooms</div>
            <div className="text-lg font-bold">{summary.numberOfRooms}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Utilization</div>
            <div className="text-lg font-bold">{utilizationPercent}%</div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-primary/10">
            <Ruler className="w-3 h-3 mr-1" />
            {style} Style
          </Badge>
          {summary.vastuCompliant && (
            <Badge variant="outline" className="bg-green-500/10 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Vastu Compliant
            </Badge>
          )}
          {summary.dynamicScalingApplied && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700">
              <Info className="w-3 h-3 mr-1" />
              Scaled to Fit
            </Badge>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Design Notes</h4>
          <ul className="space-y-1">
            {summary.notes.slice(0, 5).map((note, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorPlanSummaryPanel;
