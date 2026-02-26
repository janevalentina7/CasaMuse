import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Plus, Trash2, Eye, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getProjects, deleteProject, startNewProject, type ProjectData } from "@/lib/projectStorage";

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
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(getProjects());
    toast.success("Project deleted");
  };

  const handleNewDesign = () => {
    startNewProject();
  };

  const getResumeRoute = (project: ProjectData) => {
    const routes: Record<string, string> = {
      'design': '/design',
      'floor-plan': '/floor-plan-result',
      'ai-rendered': '/ai-rendered-view',
      'interactive-3d': '/interactive-3d',
      'vr-walkthrough': '/vr-walkthrough',
      'cost-estimation': '/cost-estimation',
      'summary': '/design-summary',
    };
    return routes[project.currentStage] || '/design-summary';
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
            <Link to="/design" onClick={handleNewDesign}>
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4 mr-2" />New Design
              </Button>
            </Link>
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

          {projects.length === 0 ? (
            <Card className="glass-card border-2">
              <CardContent className="p-12 text-center space-y-6">
                <Home className="w-16 h-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">No Projects Yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start designing your dream home and your projects will appear here.
                </p>
                <Link to="/design" onClick={handleNewDesign}>
                  <Button variant="hero" size="lg">
                    <Plus className="w-5 h-5 mr-2" />Create Your First Design
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="glass-card overflow-hidden group">
                  {project.imageUrl ? (
                    <div className="aspect-video bg-white overflow-hidden">
                      <img
                        src={project.imageUrl}
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
                        <p className="font-semibold">{project.formData?.landArea || '—'} sq ft</p>
                        <p className="text-sm text-muted-foreground">
                          {project.formData?.preferences?.style || 'Modern'} • {project.formData?.preferences?.floors || 1} floor(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {STAGE_LABELS[project.currentStage] || project.currentStage}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={getResumeRoute(project)}
                        state={{
                          imageUrl: project.imageUrl,
                          formData: project.formData,
                          description: project.description,
                          costEstimationData: project.costEstimationData,
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
                          imageUrl: project.imageUrl,
                          formData: project.formData,
                          description: project.description,
                          costEstimationData: project.costEstimationData,
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
