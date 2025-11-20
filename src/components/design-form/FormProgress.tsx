import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const FormProgress = ({ currentStep, totalSteps, steps }: FormProgressProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {/* Step circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 flex-shrink-0",
                    isCompleted && "bg-primary text-primary-foreground shadow-glow",
                    isCurrent && "bg-gradient-primary text-primary-foreground shadow-glow scale-110",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all duration-300",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              
              {/* Step label */}
              <div
                className={cn(
                  "text-xs mt-2 text-center font-medium transition-all duration-300",
                  isCurrent && "text-primary font-semibold",
                  isCompleted && "text-primary",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mt-6">
        <div
          className="bg-gradient-primary h-2 rounded-full transition-all duration-500 shadow-glow"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};
