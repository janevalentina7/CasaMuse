import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormProgress } from "./FormProgress";
import { Step1LandArea } from "./Step1LandArea";
import { Step2Rooms, RoomSelection } from "./Step2Rooms";
import { Step3Preferences, DesignPreferences } from "./Step3Preferences";
import { Step4Review } from "./Step4Review";
import { toast } from "sonner";
import { ROOM_DATA } from "@/data/roomSizes";
import { generateFloorPlan, RoomData, FloorPlanPreferences } from "@/utils/floorPlanGenerator";

const STEPS = ["Land Area", "Rooms", "Preferences", "Review"];

export const DesignForm = () => {
  const navigate = useNavigate();
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
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleSubmit = async () => {
    setIsGenerating(true);
    toast.info("Generating your professional floor plan...", {
      description: "Processing your design requirements",
      duration: 2000,
    });

    try {
      // Prepare room data with full details
      const roomsWithDetails: RoomData[] = rooms.map((room) => {
        const roomData = ROOM_DATA[room.roomId];
        const sizeData = roomData.sizes[room.size];
        return {
          roomId: room.roomId,
          roomName: roomData.name,
          count: room.count,
          size: room.size,
          width: sizeData.width,
          height: sizeData.height,
          attachedBathroom: room.attachedBathroom,
        };
      });

      // Generate floor plan procedurally (no AI needed!)
      const floorPlanPrefs: FloorPlanPreferences = {
        style: preferences.style,
        floors: preferences.floors,
        vastuCompliant: preferences.vastuCompliant,
        dynamicScaling: preferences.dynamicScaling,
        outdoorFeatures: preferences.outdoorFeatures,
      };

      const floorPlanResult = generateFloorPlan(
        parseFloat(landArea),
        roomsWithDetails,
        floorPlanPrefs
      );

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success("Floor plan generated successfully!");

      // Navigate to results page with the generated data
      navigate('/floor-plan-result', {
        state: {
          floorPlanData: floorPlanResult,
          description: `Professional ${preferences.style} floor plan for ${landArea} sq ft with ${roomsWithDetails.length} rooms. Built-up area: ${floorPlanResult.builtUpArea} sq ft.`,
          formData: {
            landArea,
            rooms: roomsWithDetails,
            preferences,
          },
        },
      });

    } catch (error) {
      console.error('Error generating floor plan:', error);
      toast.error("Failed to generate floor plan", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
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
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
};
