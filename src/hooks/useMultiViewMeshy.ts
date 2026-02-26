import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const proxyGlbUrl = (originalUrl: string): string => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const encoded = encodeURIComponent(originalUrl);
  return `https://${projectId}.supabase.co/functions/v1/proxy-glb?url=${encoded}`;
};

export interface MeshyTask {
  viewKey: string;
  taskId: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress: number;
  modelUrl: string | null;
  imageUrl: string;
}

interface MultiViewMeshyState {
  tasks: Record<string, MeshyTask>;
  isConverting: boolean;
  completedCount: number;
  totalCount: number;
}

export const useMultiViewMeshy = () => {
  const [state, setState] = useState<MultiViewMeshyState>({
    tasks: {},
    isConverting: false,
    completedCount: 0,
    totalCount: 0,
  });
  const pollIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const stopPolling = useCallback((viewKey?: string) => {
    if (viewKey) {
      if (pollIntervalsRef.current[viewKey]) {
        clearInterval(pollIntervalsRef.current[viewKey]);
        delete pollIntervalsRef.current[viewKey];
      }
    } else {
      Object.values(pollIntervalsRef.current).forEach(clearInterval);
      pollIntervalsRef.current = {};
    }
  }, []);

  const pollTask = useCallback(async (viewKey: string, taskId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("image-to-3d-meshy", {
        body: { action: "poll", taskId },
      });
      if (error) throw error;

      if (data.status === "SUCCEEDED" && data.modelUrl) {
        stopPolling(viewKey);
        const proxiedUrl = proxyGlbUrl(data.modelUrl);
        setState((prev) => {
          const newCompleted = prev.completedCount + 1;
          const allDone = newCompleted >= prev.totalCount;
          return {
            ...prev,
            completedCount: newCompleted,
            isConverting: !allDone,
            tasks: {
              ...prev.tasks,
              [viewKey]: { ...prev.tasks[viewKey], status: "SUCCEEDED", progress: 100, modelUrl: proxiedUrl },
            },
          };
        });
        toast.success(`3D model for "${viewKey}" ready!`);
        return;
      }

      if (data.status === "FAILED") {
        stopPolling(viewKey);
        setState((prev) => {
          const newCompleted = prev.completedCount + 1;
          const allDone = newCompleted >= prev.totalCount;
          return {
            ...prev,
            completedCount: newCompleted,
            isConverting: !allDone,
            tasks: {
              ...prev.tasks,
              [viewKey]: { ...prev.tasks[viewKey], status: "FAILED", progress: 0 },
            },
          };
        });
        toast.error(`3D conversion failed for "${viewKey}".`);
        return;
      }

      setState((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [viewKey]: {
            ...prev.tasks[viewKey],
            status: data.status,
            progress: data.progress || prev.tasks[viewKey]?.progress || 0,
          },
        },
      }));
    } catch (err) {
      console.error(`Poll error for ${viewKey}:`, err);
    }
  }, [stopPolling]);

  const convertViews = useCallback(
    async (views: { viewKey: string; imageUrl: string }[]) => {
      if (views.length === 0) return;

      setState({
        tasks: {},
        isConverting: true,
        completedCount: 0,
        totalCount: views.length,
      });

      toast.info(`Submitting ${views.length} views to Meshy AI... Each takes 3-7 minutes.`);

      // Submit all in parallel batches of 3 (Meshy rate limits)
      const batches: typeof views[] = [];
      for (let i = 0; i < views.length; i += 3) {
        batches.push(views.slice(i, i + 3));
      }

      for (const batch of batches) {
        await Promise.all(
          batch.map(async ({ viewKey, imageUrl }) => {
            try {
              const { data, error } = await supabase.functions.invoke("image-to-3d-meshy", {
                body: { action: "create", imageUrl },
              });
              if (error) throw error;
              if (!data?.taskId) throw new Error("No task ID returned");

              const task: MeshyTask = {
                viewKey,
                taskId: data.taskId,
                status: "PENDING",
                progress: 0,
                modelUrl: null,
                imageUrl,
              };

              setState((prev) => ({
                ...prev,
                tasks: { ...prev.tasks, [viewKey]: task },
              }));

              // Start polling
              pollIntervalsRef.current[viewKey] = setInterval(
                () => pollTask(viewKey, data.taskId),
                10000
              );
              setTimeout(() => pollTask(viewKey, data.taskId), 3000);
            } catch (err) {
              console.error(`Failed to submit ${viewKey}:`, err);
              setState((prev) => ({
                ...prev,
                completedCount: prev.completedCount + 1,
                isConverting: prev.completedCount + 1 < prev.totalCount,
                tasks: {
                  ...prev.tasks,
                  [viewKey]: {
                    viewKey,
                    taskId: "",
                    status: "FAILED",
                    progress: 0,
                    modelUrl: null,
                    imageUrl,
                  },
                },
              }));
              toast.error(`Failed to submit "${viewKey}" to Meshy.`);
            }
          })
        );
      }
    },
    [pollTask]
  );

  const getSucceededModels = useCallback(() => {
    return Object.values(state.tasks).filter(
      (t): t is MeshyTask & { modelUrl: string } => t.status === "SUCCEEDED" && !!t.modelUrl
    );
  }, [state.tasks]);

  const reset = useCallback(() => {
    stopPolling();
    setState({ tasks: {}, isConverting: false, completedCount: 0, totalCount: 0 });
  }, [stopPolling]);

  const overallProgress = state.totalCount > 0
    ? Math.round(
        Object.values(state.tasks).reduce((sum, t) => sum + t.progress, 0) / state.totalCount
      )
    : 0;

  return {
    ...state,
    overallProgress,
    convertViews,
    getSucceededModels,
    reset,
  };
};
