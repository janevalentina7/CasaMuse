import { Check, Loader2 } from "lucide-react";

type Stage = "idle" | "exterior" | "interior" | "assembly" | "complete";

interface PipelineProgressProps {
  currentStage: Stage;
}

const steps = [
  { key: "exterior", label: "Exterior Generation" },
  { key: "interior", label: "Interior Generation" },
  { key: "assembly", label: "Unified Assembly" },
  { key: "complete", label: "Complete" },
] as const;

const stageIndex: Record<Stage, number> = {
  idle: -1,
  exterior: 0,
  interior: 1,
  assembly: 2,
  complete: 3,
};

const PipelineProgress = ({ currentStage }: PipelineProgressProps) => {
  const activeIdx = stageIndex[currentStage];

  return (
    <div className="w-full px-2 py-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, i) => {
          const isDone = i < activeIdx || currentStage === "complete";
          const isActive = i === activeIdx && currentStage !== "complete";
          const isPending = i > activeIdx;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ${
                    isDone
                      ? "bg-primary border-primary text-primary-foreground shadow-glow"
                      : isActive
                        ? "border-primary text-primary bg-primary/10 animate-pulse"
                        : "border-muted text-muted-foreground bg-muted/30"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs text-center font-medium leading-tight ${
                    isDone
                      ? "text-primary"
                      : isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mt-[-20px] rounded-full overflow-hidden bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: isDone ? "100%" : isActive ? "50%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineProgress;
