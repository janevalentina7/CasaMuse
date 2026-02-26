import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Stage, Html } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { Loader2 } from "lucide-react";
import type { MeshyTask } from "@/hooks/useMultiViewMeshy";
import ModelErrorBoundary from "./ModelErrorBoundary";

interface MultiModelViewerProps {
  models: (MeshyTask & { modelUrl: string })[];
}

const GLBModel = ({ url, index, total }: { url: string; index: number; total: number }) => {
  const { scene } = useGLTF(url);

  // Arrange models in a grid layout for side-by-side comparison
  const position = useMemo(() => {
    if (total === 1) return [0, 0, 0] as [number, number, number];
    const cols = Math.min(total, 3);
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacing = 4;
    const offsetX = (col - (cols - 1) / 2) * spacing;
    const offsetZ = row * -spacing;
    return [offsetX, 0, offsetZ] as [number, number, number];
  }, [index, total]);

  return <primitive object={scene.clone()} position={position} />;
};

const LoadingFallback = () => (
  <Html center>
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/90 px-4 py-2 rounded-lg">
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading models...
    </div>
  </Html>
);

const MultiModelViewer = ({ models }: MultiModelViewerProps) => {
  if (models.length === 0) return null;

  return (
    <ModelErrorBoundary>
      <div className="w-full h-[600px] rounded-lg overflow-hidden bg-muted/10 border border-border">
        <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
          <Suspense fallback={<LoadingFallback />}>
            <Stage environment="city" intensity={0.5} adjustCamera={models.length === 1}>
              {models.map((model, i) => (
                <GLBModel key={model.viewKey} url={model.modelUrl} index={i} total={models.length} />
              ))}
            </Stage>
            <OrbitControls enablePan enableZoom enableRotate autoRotate={false} />
          </Suspense>
        </Canvas>
      </div>
    </ModelErrorBoundary>
  );
};

export default MultiModelViewer;
