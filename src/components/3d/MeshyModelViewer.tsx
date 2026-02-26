import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Stage } from "@react-three/drei";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ModelErrorBoundary from "./ModelErrorBoundary";

interface MeshyModelViewerProps {
  modelUrl: string;
}

const GLBModel = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const MeshyModelViewer = ({ modelUrl }: MeshyModelViewerProps) => {
  return (
    <ModelErrorBoundary>
      <div className="w-full h-[500px] rounded-lg overflow-hidden bg-black/5">
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5}>
              <GLBModel url={modelUrl} />
            </Stage>
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              autoRotate={false}
            />
          </Suspense>
        </Canvas>
      </div>
    </ModelErrorBoundary>
  );
};

export default MeshyModelViewer;
