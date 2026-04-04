import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Plus, Trash2, Eye, ArrowRight, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectStorage, type CloudProject } from "@/hooks/useProjectStorage";
import { useIsOwner } from "@/hooks/useIsOwner";

const STAGE_LABELS: Record<string, string> = {
  'design': 'Design Form',
  'floor-plan': 'Floor Plan',
  'ai-rendered': 'AI Rendered Views',
  'interactive-3d': '3D Model',
  'vr-walkthrough': 'VR Walkthrough',
  'cost-estimation': 'Cost Estimation',
  'summary': 'Summary',
};

const Dashboard = () => {
  const { displayName, signOut } = useAuth();
  const isOwner = useIsOwner();
  const { fetchProjects, deleteProject, createProject } = useProjectStorage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<CloudProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleNewDesign = async () => {
    try {
      const project = await createProject({ project_name: "New Design", current_stage: "design" });
      navigate("/design", { state: { projectId: project.id } });
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const getResumeRoute = (project: CloudProject) => {
    const routes: Record<string, string> = {
      'design': '/design',
      'floor-plan': '/floor-plan-result',
      'ai-rendered': '/ai-rendered-view',
      'interactive-3d': '/interactive-3d',
      'vr-walkthrough': '/vr-walkthrough',
      'cost-estimation': '/cost-estimation',
      'summary': '/design-summary',
    };
    return routes[project.current_stage] || '/design-summary';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">CasaMuse</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{displayName}</span>
                {isOwner && <Badge className="bg-gradient-primary text-white text-xs">Owner</Badge>}
              </div>
              <Button variant="hero" size="sm" onClick={handleNewDesign}>
                <Plus className="w-4 h-4 mr-2" />New Design
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Your <span className="bg-gradient-primary bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">View and manage all your saved home designs</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : projects.length === 0 ? (
            <Card className="glass-card border-2">
              <CardContent className="p-12 text-center space-y-6">
                <Home className="w-16 h-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">No Projects Yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start designing your dream home and your projects will appear here.
                </p>
                <Button variant="hero" size="lg" onClick={handleNewDesign}>
                  <Plus className="w-5 h-5 mr-2" />Create Your First Design
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="glass-card overflow-hidden group">
                  {project.floor_plan_url ? (
                    <div className="aspect-video bg-white overflow-hidden">
                      <img
                        src={project.floor_plan_url}
                        alt="Floor Plan"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted/50 flex items-center justify-center">
                      <Home className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{project.project_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.form_data?.landArea ? `${project.form_data.landArea} sq ft` : 'No data yet'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {STAGE_LABELS[project.current_stage] || project.current_stage}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(project.updated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={getResumeRoute(project)}
                        state={{
                          projectId: project.id,
                          imageUrl: project.floor_plan_url,
                          formData: project.form_data,
                          description: project.floor_plan_description,
                          costEstimationData: project.cost_estimation_data,
                        }}
                        className="flex-1"
                      >
                        <Button variant="hero" size="sm" className="w-full">
                          <ArrowRight className="w-4 h-4 mr-1" />Resume
                        </Button>
                      </Link>
                      <Link
                        to="/design-summary"
                        state={{
                          projectId: project.id,
                          imageUrl: project.floor_plan_url,
                          formData: project.form_data,
                          description: project.floor_plan_description,
                          costEstimationData: project.cost_estimation_data,
                        }}
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
