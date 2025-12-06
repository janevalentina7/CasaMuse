import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormProgress } from "./FormProgress";
import { Step1LandArea } from "./Step1LandArea";
import { Step2Rooms, RoomSelection } from "./Step2Rooms";
import { Step3Preferences, DesignPreferences } from "./Step3Preferences";
import { Step4Review } from "./Step4Review";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ROOM_DATA } from "@/data/roomSizes";

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
      description: "This may take 20-30 seconds",
      duration: 3000,
    });

    try {
      // Prepare room data with full details
      const roomsWithDetails = rooms.map((room) => {
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

      // Call the edge function to generate floor plan
      const { data, error } = await supabase.functions.invoke('generate-floor-plan', {
        body: {
          landArea,
          rooms: roomsWithDetails,
          preferences,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate floor plan');
      }

      toast.success("Floor plan generated successfully!");

      // Navigate to results page with the generated image
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

    } catch (error: any) {
      console.error('Error generating floor plan:', error);
      
      const errorMessage = error?.message || "Please try again";
      const errorContext = error?.context;
      
      if (errorContext?.errorType === 'payment_required') {
        toast.error("Not enough AI credits", {
          description: "Please add credits to your Lovable workspace at Settings → Workspace → Usage.",
          duration: 10000,
        });
      } else if (errorContext?.errorType === 'rate_limited') {
        toast.error("Rate limit exceeded", {
          description: "Please wait a moment and try again.",
        });
      } else {
        toast.error("Failed to generate floor plan", {
          description: errorMessage,
        });
      }
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
