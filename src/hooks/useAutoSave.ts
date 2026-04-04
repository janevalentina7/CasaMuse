import { useEffect, useRef, useCallback } from "react";
import { useProjectStorage } from "./useProjectStorage";
import { toast } from "sonner";

interface AutoSaveData {
  projectId: string | null;
  formData?: any;
  floorPlanUrl?: string;
  floorPlanDescription?: string;
  renderedImages?: any;
  model3dLink?: string;
  costEstimationData?: any;
  currentStage?: string;
}

export const useAutoSave = (data: AutoSaveData, intervalMs = 15000) => {
  const { updateProject } = useProjectStorage();
  const lastSavedRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const save = useCallback(async () => {
    if (!data.projectId) return;

    const payload: any = {};
    if (data.formData) payload.form_data = data.formData;
    if (data.floorPlanUrl) payload.floor_plan_url = data.floorPlanUrl;
    if (data.floorPlanDescription) payload.floor_plan_description = data.floorPlanDescription;
    if (data.renderedImages) payload.rendered_images = data.renderedImages;
    if (data.model3dLink) payload.model_3d_link = data.model3dLink;
    if (data.costEstimationData) payload.cost_estimation_data = data.costEstimationData;
    if (data.currentStage) payload.current_stage = data.currentStage;

    if (Object.keys(payload).length === 0) return;

    const hash = JSON.stringify(payload);
    if (hash === lastSavedRef.current) return;

    try {
      await updateProject(data.projectId, payload);
      lastSavedRef.current = hash;
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }, [data, updateProject]);

  useEffect(() => {
    timerRef.current = setInterval(save, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [save, intervalMs]);

  return { saveNow: save };
};
