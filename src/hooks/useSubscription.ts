import { useAuth } from "@/contexts/AuthContext";
import { useIsOwner } from "@/hooks/useIsOwner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";

export type PlanType = "free" | "pro" | "pro_plus";

export interface PlanLimits {
  maxRooms: number;
  maxProjects: number;
  maxGenerations: number; // 3D model generations
  allowedStyles: string[];
  canDownload3D: boolean;
  canVRWalkthrough: boolean;
  canHighQualityRender: boolean;
  canUltraHDRender: boolean;
  canAdvancedCost: boolean;
  canAPIAccess: boolean;
  renderQuality: "low" | "standard" | "ultra";
  processingPriority: "normal" | "fast" | "priority";
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxRooms: 4,
    maxProjects: 2,
    maxGenerations: 0,
    allowedStyles: ["Modern", "Contemporary"],
    canDownload3D: false,
    canVRWalkthrough: false,
    canHighQualityRender: false,
    canUltraHDRender: false,
    canAdvancedCost: false,
    canAPIAccess: false,
    renderQuality: "low",
    processingPriority: "normal",
  },
  pro: {
    maxRooms: 99,
    maxProjects: 4,
    maxGenerations: 2,
    allowedStyles: ["Modern", "Contemporary", "Traditional", "Mediterranean", "Colonial", "Minimalist", "Craftsman"],
    canDownload3D: true,
    canVRWalkthrough: true,
    canHighQualityRender: true,
    canUltraHDRender: false,
    canAdvancedCost: true,
    canAPIAccess: false,
    renderQuality: "standard",
    processingPriority: "fast",
  },
  pro_plus: {
    maxRooms: 99,
    maxProjects: 999,
    maxGenerations: 999,
    allowedStyles: ["Modern", "Contemporary", "Traditional", "Mediterranean", "Colonial", "Minimalist", "Craftsman", "Art Deco", "Victorian", "Japanese", "Scandinavian"],
    canDownload3D: true,
    canVRWalkthrough: true,
    canHighQualityRender: true,
    canUltraHDRender: true,
    canAdvancedCost: true,
    canAPIAccess: true,
    renderQuality: "ultra",
    processingPriority: "priority",
  },
};

export const PLAN_PRICES = {
  free: { inr: 0, label: "Free" },
  pro: { inr: 4000, label: "Pro" },
  pro_plus: { inr: 6000, label: "Pro+" },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const isOwner = useIsOwner();
  const [plan, setPlan] = useState<PlanType>("free");
  const [generationCount, setGenerationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("subscription_plan, generation_count")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setPlan((data.subscription_plan as PlanType) || "free");
        setGenerationCount(data.generation_count || 0);
      }
      setLoading(false);
    };

    fetchPlan();
  }, [user]);

  // Owner always gets pro_plus limits
  const effectivePlan: PlanType = isOwner ? "pro_plus" : plan;
  const limits = PLAN_LIMITS[effectivePlan];

  const canAccess = useCallback(
    (feature: keyof PlanLimits): boolean => {
      if (isOwner) return true;
      const value = limits[feature];
      return typeof value === "boolean" ? value : true;
    },
    [isOwner, limits]
  );

  const canGenerate3D = useCallback((): boolean => {
    if (isOwner) return true;
    if (plan === "free") return false;
    return generationCount < limits.maxGenerations;
  }, [isOwner, plan, generationCount, limits]);

  const incrementGeneration = useCallback(async () => {
    if (!user || isOwner) return;
    const newCount = generationCount + 1;
    await supabase
      .from("profiles")
      .update({ generation_count: newCount } as any)
      .eq("user_id", user.id);
    setGenerationCount(newCount);
  }, [user, isOwner, generationCount]);

  const remainingGenerations = isOwner
    ? 999
    : Math.max(0, limits.maxGenerations - generationCount);

  return {
    plan: effectivePlan,
    rawPlan: plan,
    limits,
    loading,
    canAccess,
    canGenerate3D,
    incrementGeneration,
    generationCount,
    remainingGenerations,
    isOwner,
  };
};
