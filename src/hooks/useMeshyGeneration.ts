import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const proxyGlbUrl = (originalUrl: string): string => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const encoded = encodeURIComponent(originalUrl);
  return `https://${projectId}.supabase.co/functions/v1/proxy-glb?url=${encoded}`;
};

interface MeshyState {
  isGenerating: boolean;
  progress: number;
  status: string;
  modelUrl: string | null;
  error: string | null;
}

export const useMeshyGeneration = () => {
  const [state, setState] = useState<MeshyState>({
    isGenerating: false,
    progress: 0,
    status: '',
    modelUrl: null,
    error: null,
  });
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const pollTask = useCallback(async (taskId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('image-to-3d-meshy', {
        body: { action: 'poll', taskId },
      });

      if (error) throw error;

      if (data.status === 'SUCCEEDED' && data.modelUrl) {
        stopPolling();
        const proxiedUrl = proxyGlbUrl(data.modelUrl);
        setState(prev => ({
          ...prev,
          isGenerating: false,
          progress: 100,
          status: 'Complete!',
          modelUrl: proxiedUrl,
        }));
        toast.success("3D model generated successfully!");
        return;
      }

      if (data.status === 'FAILED') {
        stopPolling();
        setState(prev => ({
          ...prev,
          isGenerating: false,
          status: 'Failed',
          error: 'Meshy generation failed. Please try again.',
        }));
        toast.error("3D model generation failed.");
        return;
      }

      setState(prev => ({
        ...prev,
        progress: data.progress || prev.progress,
        status: data.status === 'IN_PROGRESS' ? `Generating... ${data.progress || 0}%` : 'Pending...',
      }));
    } catch (err) {
      console.error('Poll error:', err);
      // Don't stop polling on transient errors
    }
  }, [stopPolling]);

  const generateModel = useCallback(async (imageUrl: string) => {
    setState({
      isGenerating: true,
      progress: 0,
      status: 'Submitting to Meshy AI...',
      modelUrl: null,
      error: null,
    });

    try {
      const { data, error } = await supabase.functions.invoke('image-to-3d-meshy', {
        body: { action: 'create', imageUrl },
      });

      if (error) throw error;
      if (!data?.taskId) throw new Error('No task ID returned');

      toast.info("3D generation started! This takes 3-7 minutes...");
      setState(prev => ({ ...prev, status: 'Processing...' }));

      // Poll every 10 seconds
      pollIntervalRef.current = setInterval(() => pollTask(data.taskId), 10000);
      // Also poll immediately after a short delay
      setTimeout(() => pollTask(data.taskId), 3000);
    } catch (err) {
      console.error('Meshy create error:', err);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
      toast.error("Failed to start 3D generation.");
    }
  }, [pollTask]);

  const reset = useCallback(() => {
    stopPolling();
    setState({
      isGenerating: false,
      progress: 0,
      status: '',
      modelUrl: null,
      error: null,
    });
  }, [stopPolling]);

  return { ...state, generateModel, reset };
};
