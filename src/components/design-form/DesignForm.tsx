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
import { supabase } from "@/integrations/supabase/client";

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

  const handleSubmit = async (useAI: boolean = false) => {
    setIsGenerating(true);
    
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

    if (useAI) {
      // Use OpenAI for floor plan generation
      toast.info("Generating AI floor plan with OpenAI...", {
        description: "This may take 15-30 seconds",
        duration: 5000,
      });

      try {
        const { data, error } = await supabase.functions.invoke('generate-floor-plan', {
          body: {
            landArea,
            rooms: roomsWithDetails,
            preferences,
          },
        });

        if (data?.errorType === 'auth_error') {
          toast.error("OpenAI API Key Invalid", {
            description: "Please check your OpenAI API key in the settings.",
            duration: 10000,
          });
          setIsGenerating(false);
          return;
        }

        if (data?.errorType === 'rate_limited') {
          toast.error("Rate Limit Reached", {
            description: "OpenAI rate limit exceeded. Please wait and try again.",
            duration: 5000,
          });
          setIsGenerating(false);
          return;
        }

        if (error) throw error;

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to generate floor plan');
        }

        toast.success("AI floor plan generated successfully!");

        navigate('/floor-plan-result', {
          state: {
            imageUrl: data.imageUrl,
            description: data.description,
            formData: {
              landArea,
              rooms: roomsWithDetails,
              preferences,
            },
          },
        });

      } catch (error) {
        console.error('Error generating AI floor plan:', error);
        toast.error("Failed to generate AI floor plan", {
          description: error instanceof Error ? error.message : "Please try again or use Quick SVG mode",
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Use procedural SVG generation (no AI needed)
      toast.info("Generating your professional floor plan...", {
        description: "Processing your design requirements",
        duration: 2000,
      });

      try {
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

        await new Promise(resolve => setTimeout(resolve, 500));

        toast.success("Floor plan generated successfully!");

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
