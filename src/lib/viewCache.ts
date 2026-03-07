/**
 * Session-level cache for generated views and 3D models.
 * Uses sessionStorage so data persists across page navigation but clears on tab close.
 */

const EXTERIOR_VIEWS_KEY = 'casaMuse_exteriorViews';
const INTERIOR_VIEWS_KEY = 'casaMuse_interiorViews';
const MESHY_TASKS_KEY = 'casaMuse_meshyTasks';
const FLOOR_PLAN_KEY = 'casaMuse_floorPlan';

interface ViewData {
  url: string;
  description: string;
}

export const viewCache = {
  // Floor plan
  saveFloorPlan(data: { imageUrl: string; description?: string; formData: any }) {
    try { sessionStorage.setItem(FLOOR_PLAN_KEY, JSON.stringify(data)); } catch {}
  },
  getFloorPlan(): { imageUrl: string; description?: string; formData: any } | null {
    try {
      const d = sessionStorage.getItem(FLOOR_PLAN_KEY);
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  },

  // Exterior views
  saveExteriorViews(views: Record<string, ViewData>) {
    try { sessionStorage.setItem(EXTERIOR_VIEWS_KEY, JSON.stringify(views)); } catch {}
  },
  getExteriorViews(): Record<string, ViewData> {
    try {
      const d = sessionStorage.getItem(EXTERIOR_VIEWS_KEY);
      return d ? JSON.parse(d) : {};
    } catch { return {}; }
  },

  // Interior views
  saveInteriorViews(views: Record<string, ViewData>) {
    try { sessionStorage.setItem(INTERIOR_VIEWS_KEY, JSON.stringify(views)); } catch {}
  },
  getInteriorViews(): Record<string, ViewData> {
    try {
      const d = sessionStorage.getItem(INTERIOR_VIEWS_KEY);
      return d ? JSON.parse(d) : {};
    } catch { return {}; }
  },

  // Meshy 3D tasks (only save succeeded ones with modelUrl)
  saveMeshyTasks(tasks: Record<string, any>) {
    try { sessionStorage.setItem(MESHY_TASKS_KEY, JSON.stringify(tasks)); } catch {}
  },
  getMeshyTasks(): Record<string, any> {
    try {
      const d = sessionStorage.getItem(MESHY_TASKS_KEY);
      return d ? JSON.parse(d) : {};
    } catch { return {}; }
  },

  clearAll() {
    sessionStorage.removeItem(EXTERIOR_VIEWS_KEY);
    sessionStorage.removeItem(INTERIOR_VIEWS_KEY);
    sessionStorage.removeItem(MESHY_TASKS_KEY);
    sessionStorage.removeItem(FLOOR_PLAN_KEY);
  },
};
