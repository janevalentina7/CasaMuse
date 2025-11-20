import { useState } from "react";
import { FormProgress } from "./FormProgress";
import { Step1LandArea } from "./Step1LandArea";
import { Step2Rooms, RoomSelection } from "./Step2Rooms";
import { Step3Preferences, DesignPreferences } from "./Step3Preferences";
import { Step4Review } from "./Step4Review";
import { toast } from "sonner";

const STEPS = ["Land Area", "Rooms", "Preferences", "Review"];

export const DesignForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [landArea, setLandArea] = useState("");
  const [rooms, setRooms] = useState<RoomSelection[]>([]);
  const [preferences, setPreferences] = useState<DesignPreferences>({
    style: "Modern",
    floors: 1,
    vastuCompliant: false,
    dynamicScaling: true,
    outdoorFeatures: [],
  });

  const handleStep1Next = () => {
    const area = parseFloat(landArea);
    if (!area || area < 100) {
      toast.error("Please enter a valid land area (minimum 100 sq ft)");
      return;
    }
    setCurrentStep(2);
    toast.success("Land area saved!");
  };

  const handleStep2Next = () => {
    if (rooms.length === 0) {
      toast.error("Please select at least one room");
      return;
    }
    setCurrentStep(3);
    toast.success("Rooms selected!");
  };

  const handleStep3Next = () => {
    if (!preferences.style) {
      toast.error("Please select an architectural style");
      return;
    }
    setCurrentStep(4);
    toast.success("Preferences saved!");
  };

  const handleSubmit = () => {
    // Here you would normally send the data to your backend/AI service
    toast.success("Generating your design! This may take a moment...", {
      duration: 5000,
    });
    
    // Log the complete form data
    console.log("Design Form Submission:", {
      landArea,
      rooms,
      preferences,
    });

    // Simulate processing
    setTimeout(() => {
      toast.success("Your floor plan is ready!", {
        description: "Check your email for the complete design package.",
        duration: 5000,
      });
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <FormProgress
        currentStep={currentStep}
        totalSteps={STEPS.length}
        steps={STEPS}
      />

      <div className="mt-8">
        {currentStep === 1 && (
          <Step1LandArea
            landArea={landArea}
            setLandArea={setLandArea}
            onNext={handleStep1Next}
          />
        )}

        {currentStep === 2 && (
          <Step2Rooms
            rooms={rooms}
            setRooms={setRooms}
            onNext={handleStep2Next}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Preferences
            preferences={preferences}
            setPreferences={setPreferences}
            onNext={handleStep3Next}
            onPrev={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Review
            landArea={landArea}
            rooms={rooms}
            preferences={preferences}
            onPrev={() => setCurrentStep(3)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};
