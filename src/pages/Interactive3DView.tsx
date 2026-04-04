import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ArrowLeft, ArrowRight, Box, Loader2, Cuboid, Download, Eye, RotateCcw, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import PipelineProgress from "@/components/3d/PipelineProgress";
import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ROOM_DATA } from "@/data/roomSizes";
import { toast } from "sonner";
import { viewCache } from "@/lib/viewCache";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage, Html } from "@react-three/drei";
import ModelErrorBoundary from "@/components/3d/ModelErrorBoundary";
import HouseConnectors from "@/components/3d/HouseConnectors";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/UpgradeModal";

interface ViewImage {
  url: string;
  description: string;
}

interface MeshyTaskInfo {
  taskId: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress: number;
  modelUrl: string | null;
  label: string;
  imageUrl: string;
  category: "exterior" | "interior";
}

type PipelineStage = "idle" | "exterior" | "interior" | "assembly" | "complete";

const proxyGlbUrl = (originalUrl: string): string => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  return `https://${projectId}.supabase.co/functions/v1/proxy-glb?url=${encodeURIComponent(originalUrl)}`;
};

// 3D model component
const GLBModel = ({ url, position }: { url: string; position: [number, number, number] }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} position={position} />;
};

const LoadingFallback = () => (
  <Html center>
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/90 px-4 py-2 rounded-lg">
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading 3D model...
    </div>
  </Html>
);

const Interactive3DView = () => {
  const { canAccess, canGenerate3D, incrementGeneration, remainingGenerations, plan, isOwner } = useSubscription();
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string; plan: "pro" | "pro_plus" }>({ open: false, feature: "", plan: "pro" });
  const location = useLocation();
  const navigate = useNavigate();
  
  // Restore from cache if location.state is missing
  const cached = viewCache.getFloorPlan();
  const cachedExt = viewCache.getExteriorViews();
  const cachedInt = viewCache.getInteriorViews();
  const cachedMeshy = viewCache.getMeshyTasks();

  const imageUrl = location.state?.imageUrl || cached?.imageUrl;
  const formData = location.state?.formData || cached?.formData;
  const description = location.state?.description || cached?.description;
  const exteriorViews = location.state?.exteriorViews || (Object.keys(cachedExt).length > 0 ? cachedExt : {});
  const interiorViews = location.state?.interiorViews || (Object.keys(cachedInt).length > 0 ? cachedInt : {});

  // Restore completed meshy tasks from cache
  const initialTasks: Record<string, MeshyTaskInfo> = {};
  const hasCachedMeshy = Object.keys(cachedMeshy).length > 0;
  if (hasCachedMeshy) {
    Object.entries(cachedMeshy).forEach(([key, task]: [string, any]) => {
      if (task.status === "SUCCEEDED" && task.modelUrl) {
        initialTasks[key] = task;
      }
    });
  }

  const [tasks, setTasks] = useState<Record<string, MeshyTaskInfo>>(initialTasks);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(hasCachedMeshy ? "complete" : "idle");
  const [selectedView, setSelectedView] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"unified" | "individual">("unified");
  const pollIntervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const hasStarted = useRef(hasCachedMeshy);

  const stopPolling = useCallback((key?: string) => {
    if (key) {
      if (pollIntervalsRef.current[key]) {
        clearInterval(pollIntervalsRef.current[key]);
        delete pollIntervalsRef.current[key];
      }
    } else {
      Object.values(pollIntervalsRef.current).forEach(clearInterval);
      pollIntervalsRef.current = {};
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  const pollTask = useCallback(async (key: string, taskId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("image-to-3d-meshy", {
        body: { action: "poll", taskId },
      });
      if (error) throw error;

      if (data.status === "SUCCEEDED" && data.modelUrl) {
        stopPolling(key);
        const proxiedUrl = proxyGlbUrl(data.modelUrl);
        setTasks(prev => {
          const updated: Record<string, MeshyTaskInfo> = { ...prev, [key]: { ...prev[key], status: "SUCCEEDED" as const, progress: 100, modelUrl: proxiedUrl } };
          viewCache.saveMeshyTasks(updated);
          return updated;
        });
        return;
      }

      if (data.status === "FAILED") {
        stopPolling(key);
        setTasks(prev => ({
          ...prev,
          [key]: { ...prev[key], status: "FAILED", progress: 0 },
        }));
        return;
      }

      setTasks(prev => ({
        ...prev,
        [key]: { ...prev[key], status: data.status, progress: data.progress || prev[key]?.progress || 0 },
      }));
    } catch (err) {
      console.error(`Poll error for ${key}:`, err);
    }
  }, [stopPolling]);

  const submitToMeshy = useCallback(async (key: string, imageUrl: string, label: string, category: "exterior" | "interior") => {
    setTasks(prev => ({
      ...prev,
      [key]: { taskId: "", status: "PENDING", progress: 0, modelUrl: null, label, imageUrl, category },
    }));

    try {
      const { data, error } = await supabase.functions.invoke("image-to-3d-meshy", {
        body: { action: "create", imageUrl },
      });
      if (error) throw error;
      if (!data?.taskId) throw new Error("No task ID returned");

      setTasks(prev => ({
        ...prev,
        [key]: { ...prev[key], taskId: data.taskId },
      }));

      pollIntervalsRef.current[key] = setInterval(() => pollTask(key, data.taskId), 10000);
      setTimeout(() => pollTask(key, data.taskId), 3000);
    } catch (err) {
      console.error(`Failed to submit ${key}:`, err);
      setTasks(prev => ({
        ...prev,
        [key]: { ...prev[key], status: "FAILED" },
      }));
      toast.error(`Failed to submit "${label}" to 3D conversion.`);
    }
  }, [pollTask]);

  // Wait for all tasks of a category to complete
  const waitForCategory = useCallback((category: "exterior" | "interior"): Promise<void> => {
    return new Promise((resolve) => {
      const check = () => {
        setTasks(current => {
          const categoryTasks = Object.values(current).filter(t => t.category === category);
          const allDone = categoryTasks.length > 0 && categoryTasks.every(t => t.status === "SUCCEEDED" || t.status === "FAILED");
          if (allDone) {
            resolve();
          } else {
            setTimeout(check, 2000);
          }
          return current;
        });
      };
      setTimeout(check, 5000);
    });
  }, []);

  // Main pipeline: exterior first, then interior
  const startPipeline = useCallback(async () => {
    const extEntries = Object.entries(exteriorViews as Record<string, ViewImage>);
    const intEntries = Object.entries(interiorViews as Record<string, ViewImage>);

    if (extEntries.length === 0 && intEntries.length === 0) {
      toast.error("No rendered views available. Go back and generate views first.");
      return;
    }

    toast.info("Starting 3D model generation — exterior first, then interior...");

    // Phase 1: Exterior
    if (extEntries.length > 0) {
      setPipelineStage("exterior");
      toast.info(`Submitting ${extEntries.length} exterior view(s) to Meshy AI...`);

      // Submit in batches of 3
      for (let i = 0; i < extEntries.length; i += 3) {
        const batch = extEntries.slice(i, i + 3);
        await Promise.all(batch.map(([key, view]) =>
          submitToMeshy(`ext_${key}`, view.url, `Exterior: ${key}`, "exterior")
        ));
      }

      await waitForCategory("exterior");
      const extSucceeded = Object.values(tasks).filter(t => t.category === "exterior" && t.status === "SUCCEEDED").length;
      toast.success(`Exterior done! ${extSucceeded} model(s) ready.`);
    }

    // Phase 2: Interior
    if (intEntries.length > 0) {
      setPipelineStage("interior");
      toast.info(`Submitting ${intEntries.length} interior view(s) to Meshy AI...`);

      for (let i = 0; i < intEntries.length; i += 3) {
        const batch = intEntries.slice(i, i + 3);
        await Promise.all(batch.map(([key, view]) =>
          submitToMeshy(`int_${key}`, view.url, `Interior: ${key}`, "interior")
        ));
      }

      await waitForCategory("interior");
      const intSucceeded = Object.values(tasks).filter(t => t.category === "interior" && t.status === "SUCCEEDED").length;
      toast.success(`Interior done! ${intSucceeded} model(s) ready.`);
    }

    // Phase 3: Assembly
    setPipelineStage("assembly");
    toast.info("Assembling unified house model...");
    await new Promise(r => setTimeout(r, 2000));

    setPipelineStage("complete");
    toast.success("All 3D models generated! Viewing unified house model.");
  }, [exteriorViews, interiorViews, submitToMeshy, waitForCategory, tasks]);

  // Auto-start pipeline on mount
  useEffect(() => {
    if (hasStarted.current || !imageUrl || !formData) return;
    const hasViews = Object.keys(exteriorViews).length > 0 || Object.keys(interiorViews).length > 0;
    if (!hasViews) return;
    hasStarted.current = true;
    startPipeline();
  }, [imageUrl, formData, exteriorViews, interiorViews, startPipeline]);

  // Derived state
  const allTasks = Object.entries(tasks);
  const exteriorTasks = allTasks.filter(([, t]) => t.category === "exterior");
  const interiorTasks = allTasks.filter(([, t]) => t.category === "interior");
  const succeededModels = allTasks.filter(([, t]) => t.status === "SUCCEEDED" && t.modelUrl);
  const totalProgress = allTasks.length > 0
    ? Math.round(allTasks.reduce((sum, [, t]) => sum + t.progress, 0) / allTasks.length)
    : 0;

  // Compute positions for unified view: arrange interior around exterior using floor plan
  // Build floor-plan-based positions using actual room dimensions from formData
  // Build floor-plan-based positions and room rectangles for connectors
  const { modelPositions, roomRects } = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};
    const rects: Array<{ key: string; x: number; z: number; width: number; depth: number }> = [];
    const SCALE = 0.3;

    exteriorTasks.forEach(([key]) => {
      positions[key] = [0, 0, 0];
    });

    const roomSelections: Array<{ roomId: string; size: string; count: number }> =
      formData?.rooms || [];

    const roomLayouts: Array<{ key: string; width: number; depth: number }> = [];
    interiorTasks.forEach(([key]) => {
      const roomId = key.replace(/^int_/, "").replace(/_\d+$/, "");
      const selection = roomSelections.find((r: any) => r.roomId === roomId);
      const roomData = ROOM_DATA[roomId];

      let width = 12, depth = 12;
      if (roomData && selection) {
        const sizeKey = selection.size || "medium";
        const sizeData = roomData.sizes[sizeKey as keyof typeof roomData.sizes] || roomData.sizes.medium;
        if (sizeData) { width = sizeData.width; depth = sizeData.height; }
      } else if (roomData) {
        const sizeData = roomData.sizes.medium;
        width = sizeData.width; depth = sizeData.height;
      }

      roomLayouts.push({ key, width: width * SCALE, depth: depth * SCALE });
    });

    let curX = 0, curZ = 0, rowMaxDepth = 0;
    const maxRowWidth = roomLayouts.length <= 4 ? 20 : 30;

    roomLayouts.forEach((room) => {
      if (curX + room.width > maxRowWidth && curX > 0) {
        curX = 0;
        curZ += rowMaxDepth + 0.3;
        rowMaxDepth = 0;
      }
      positions[room.key] = [curX + room.width / 2, 0, curZ + room.depth / 2];
      rects.push({ key: room.key, x: curX + room.width / 2, z: curZ + room.depth / 2, width: room.width, depth: room.depth });
      curX += room.width + 0.3;
      rowMaxDepth = Math.max(rowMaxDepth, room.depth);
    });

    // Center around origin
    if (rects.length > 0) {
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      rects.forEach((r) => {
        minX = Math.min(minX, r.x); maxX = Math.max(maxX, r.x);
        minZ = Math.min(minZ, r.z); maxZ = Math.max(maxZ, r.z);
      });
      const offsetX = (minX + maxX) / 2, offsetZ = (minZ + maxZ) / 2;
      rects.forEach((r) => { r.x -= offsetX; r.z -= offsetZ; });
      rects.forEach((r) => { positions[r.key] = [r.x, 0, r.z]; });
    }

    return { modelPositions: positions, roomRects: rects };
  }, [exteriorTasks, interiorTasks, formData]);

  // Models to show in viewer
  const modelsToDisplay = useMemo(() => {
    if (viewMode === "individual" && selectedView) {
      const task = tasks[selectedView];
      if (task?.status === "SUCCEEDED" && task.modelUrl) {
        return [{ key: selectedView, url: task.modelUrl, position: [0, 0, 0] as [number, number, number] }];
      }
      return [];
    }
    // Unified: show all succeeded
    return succeededModels.map(([key, t]) => ({
      key,
      url: t.modelUrl!,
      position: modelPositions[key] || [0, 0, 0] as [number, number, number],
    }));
  }, [viewMode, selectedView, tasks, succeededModels, modelPositions]);

  if (!imageUrl || !formData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Floor Plan Available</h2>
            <p className="text-muted-foreground mb-6">Please generate a floor plan first.</p>
            <Link to="/design">
              <Button variant="hero"><ArrowLeft className="w-4 h-4 mr-2" />Back to Design Tool</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasNoViews = Object.keys(exteriorViews).length === 0 && Object.keys(interiorViews).length === 0;

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
            <div className="flex gap-2">
              <Link to="/ai-rendered-view" state={{ imageUrl, description, formData }}>
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              </Link>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/vr-walkthrough', { state: { imageUrl, description, formData, exteriorViews, interiorViews } })}
              >
                Next: VR Walkthrough<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              3D <span className="bg-gradient-primary bg-clip-text text-transparent">House Model</span>
            </h1>
            <p className="text-muted-foreground">
              {pipelineStage === "exterior" && "Generating exterior 3D model..."}
              {pipelineStage === "interior" && "Generating interior 3D models..."}
              {pipelineStage === "assembly" && "Assembling unified house model..."}
              {pipelineStage === "complete" && "All models generated — viewing unified house"}
              {pipelineStage === "idle" && (hasNoViews ? "No rendered views found" : "Starting 3D conversion pipeline...")}
            </p>
          </div>

          {/* Step Progress Indicator */}
          {pipelineStage !== "idle" && (
            <PipelineProgress currentStage={pipelineStage} />
          )}

          {/* No views warning */}
          {hasNoViews && pipelineStage === "idle" && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Box className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rendered Views Available</h3>
                <p className="text-muted-foreground mb-4">Go back to AI Rendered Views and generate exterior/interior images first.</p>
                <Link to="/ai-rendered-view" state={{ imageUrl, description, formData }}>
                  <Button variant="hero"><ArrowLeft className="w-4 h-4 mr-2" />Back to AI Views</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Pipeline Progress */}
          {allTasks.length > 0 && pipelineStage !== "complete" && (
            <Card className="glass-card border-2 border-primary/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cuboid className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold">
                      {pipelineStage === "exterior" ? "Phase 1: Exterior" : "Phase 2: Interior"}
                    </h3>
                  </div>
                  <Badge variant="secondary">
                    {succeededModels.length}/{allTasks.length} complete
                  </Badge>
                </div>

                <Progress value={totalProgress} className="w-full" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {allTasks.map(([key, task]) => (
                    <div key={key} className="flex items-center gap-1.5 p-2 rounded bg-muted/50">
                      {task.status === "SUCCEEDED" ? (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      ) : task.status === "FAILED" ? (
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                      ) : (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      )}
                      <span className="truncate">{task.label}</span>
                      <span className="ml-auto">{task.progress}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3D Viewer */}
          {modelsToDisplay.length > 0 && (
            <Card className="glass-card border-2">
              <CardContent className="p-4 space-y-4">
                {/* View mode toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "unified" ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setViewMode("unified"); setSelectedView(null); }}
                    >
                      <Box className="w-4 h-4 mr-2" />Unified House
                    </Button>
                    <Button
                      variant={viewMode === "individual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("individual")}
                    >
                      <Eye className="w-4 h-4 mr-2" />Individual View
                    </Button>
                  </div>
                  {viewMode === "individual" && selectedView && (
                    <Badge>{tasks[selectedView]?.label}</Badge>
                  )}
                </div>

                {/* Individual model selector */}
                {viewMode === "individual" && (
                  <div className="flex flex-wrap gap-2">
                    {succeededModels.map(([key, task]) => (
                      <Button
                        key={key}
                        variant={selectedView === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedView(key)}
                      >
                        {task.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Canvas */}
                <ModelErrorBoundary>
                  <div className="w-full h-[600px] rounded-lg overflow-hidden bg-muted/10 border border-border">
                    <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
                      <Suspense fallback={<LoadingFallback />}>
                        <Stage environment="city" intensity={0.5} adjustCamera={modelsToDisplay.length === 1}>
                          {modelsToDisplay.map(m => (
                            <GLBModel key={m.key} url={m.url} position={m.position} />
                          ))}
                          {viewMode === "unified" && roomRects.length > 0 && (
                            <HouseConnectors rooms={roomRects} />
                          )}
                        </Stage>
                        <OrbitControls enablePan enableZoom enableRotate autoRotate={false} />
                      </Suspense>
                    </Canvas>
                  </div>
                </ModelErrorBoundary>
              </CardContent>
            </Card>
          )}

          {/* Download section */}
          {succeededModels.length > 0 && (
            <Card className={`glass-card ${!canAccess("canDownload3D") ? "relative" : ""}`}>
              <CardContent className="p-4">
                {canAccess("canDownload3D") ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {succeededModels.map(([key, task]) => (
                      <Button key={key} variant="outline" size="sm" asChild>
                        <a href={task.modelUrl!} download={`${task.label.replace(/[: ]/g, '_')}.glb`}>
                          <Download className="w-4 h-4 mr-2" />{task.label}.glb
                        </a>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-4">
                    <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">3D model download requires Pro plan</p>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => setUpgradeModal({ open: true, feature: "3D Model Download", plan: "pro" })}
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Box className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Rotate & Zoom</h3>
                <p className="text-xs text-muted-foreground">Click and drag to rotate, scroll to zoom</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">View Modes</h3>
                <p className="text-xs text-muted-foreground">Switch between unified house and individual room views</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Download className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Download</h3>
                <p className="text-xs text-muted-foreground">Download .glb models for use in other 3D tools</p>
              </CardContent>
            </Card>
          </div>

          {/* Sequential Navigation */}
          <div className="flex justify-between pt-8 border-t border-border/50">
            <Link to="/ai-rendered-view" state={{ imageUrl, description, formData }}>
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />Previous: AI Rendered Views
              </Button>
            </Link>
            {canAccess("canVRWalkthrough") ? (
              <Link to="/vr-walkthrough" state={{ imageUrl, description, formData, exteriorViews, interiorViews }}>
                <Button variant="hero" size="lg">
                  Next: VR Walkthrough<ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="hero"
                size="lg"
                onClick={() => setUpgradeModal({ open: true, feature: "VR Walkthrough", plan: "pro" })}
              >
                <Lock className="w-4 h-4 mr-2" />VR Walkthrough (Pro)
              </Button>
            )}
          </div>
        </div>
      </main>

      <UpgradeModal
        open={upgradeModal.open}
        onOpenChange={(open) => setUpgradeModal((prev) => ({ ...prev, open }))}
        feature={upgradeModal.feature}
        requiredPlan={upgradeModal.plan}
      />
    </div>
  );
};

export default Interactive3DView;
