export interface ProjectData {
  id: string;
  imageUrl?: string;
  formData?: any;
  description?: string;
  costEstimationData?: any;
  currentStage: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'casaMuseProjects';
const CURRENT_PROJECT_KEY = 'casaMuseCurrentProject';

export const saveProjectProgress = (data: {
  imageUrl?: string;
  formData?: any;
  description?: string;
  costEstimationData?: any;
  stage: string;
}) => {
  try {
    // Get or create current project
    let projectId = localStorage.getItem(CURRENT_PROJECT_KEY);
    const stored = localStorage.getItem(STORAGE_KEY);
    const projects: ProjectData[] = stored ? JSON.parse(stored) : [];

    if (projectId) {
      // Update existing project
      const idx = projects.findIndex(p => p.id === projectId);
      if (idx >= 0) {
        projects[idx] = {
          ...projects[idx],
          ...data.imageUrl && { imageUrl: data.imageUrl },
          ...data.formData && { formData: data.formData },
          ...data.description && { description: data.description },
          ...data.costEstimationData && { costEstimationData: data.costEstimationData },
          currentStage: data.stage,
          updatedAt: new Date().toISOString(),
        };
      } else {
        projectId = null; // Project not found, create new
      }
    }

    if (!projectId) {
      projectId = Date.now().toString();
      localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
      projects.push({
        id: projectId,
        imageUrl: data.imageUrl,
        formData: data.formData,
        description: data.description,
        costEstimationData: data.costEstimationData,
        currentStage: data.stage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save project progress:', e);
  }
};

export const startNewProject = () => {
  localStorage.removeItem(CURRENT_PROJECT_KEY);
};

export const getProjects = (): ProjectData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const deleteProject = (id: string) => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};
