import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export interface CloudProject {
  id: string;
  user_id: string;
  project_name: string;
  form_data: any;
  floor_plan_url: string | null;
  floor_plan_description: string | null;
  rendered_images: any;
  model_3d_link: string | null;
  cost_estimation_data: any;
  current_stage: string;
  created_at: string;
  updated_at: string;
}

export const useProjectStorage = () => {
  const { user } = useAuth();

  const fetchProjects = useCallback(async (): Promise<CloudProject[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CloudProject[];
  }, [user]);

  const createProject = useCallback(async (data: Partial<CloudProject>): Promise<CloudProject> => {
    if (!user) throw new Error("Not authenticated");
    const { data: project, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, ...data } as any)
      .select()
      .single();
    if (error) throw error;
    return project as CloudProject;
  }, [user]);

  const updateProject = useCallback(async (id: string, data: Partial<CloudProject>) => {
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("projects")
      .update(data as any)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
  }, [user]);

  const deleteProject = useCallback(async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
  }, [user]);

  const getProject = useCallback(async (id: string): Promise<CloudProject | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error) return null;
    return data as CloudProject;
  }, [user]);

  return { fetchProjects, createProject, updateProject, deleteProject, getProject };
};
