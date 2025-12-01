import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

interface ModelExporterProps {
  scene: THREE.Scene;
  fileName?: string;
}

export default function ModelExporter({ scene, fileName = "house-model" }: ModelExporterProps) {
  
  const exportGLB = () => {
    toast.info("Preparing GLB export...");
    
    const exporter = new GLTFExporter();
    exporter.parse(
      scene.children as any,
      (result) => {
        if (result instanceof ArrayBuffer) {
          saveArrayBuffer(result, `${fileName}.glb`);
          toast.success("GLB file downloaded!");
        }
      },
      (error) => {
        console.error("Export error:", error);
        toast.error("Failed to export GLB");
      },
      { binary: true }
    );
  };

  const exportGLTF = () => {
    toast.info("Preparing GLTF export...");
    
    const exporter = new GLTFExporter();
    exporter.parse(
      scene.children as any,
      (result) => {
        if (typeof result === 'object') {
          const output = JSON.stringify(result, null, 2);
          saveString(output, `${fileName}.gltf`);
          toast.success("GLTF file downloaded!");
        }
      },
      (error) => {
        console.error("Export error:", error);
        toast.error("Failed to export GLTF");
      },
      { binary: false }
    );
  };

  const exportOBJ = () => {
    toast.info("Preparing OBJ export...");
    
    try {
      let objContent = "# Exported from DreamHome AI\n";
      let vertexIndex = 1;
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const geometry = object.geometry;
          const position = geometry.attributes.position;
          
          if (position) {
            objContent += `o ${object.name || 'mesh'}\n`;
            
            // Vertices
            for (let i = 0; i < position.count; i++) {
              const x = position.getX(i);
              const y = position.getY(i);
              const z = position.getZ(i);
              objContent += `v ${x} ${y} ${z}\n`;
            }
            
            // Faces
            if (geometry.index) {
              for (let i = 0; i < geometry.index.count; i += 3) {
                const a = geometry.index.getX(i) + vertexIndex;
                const b = geometry.index.getX(i + 1) + vertexIndex;
                const c = geometry.index.getX(i + 2) + vertexIndex;
                objContent += `f ${a} ${b} ${c}\n`;
              }
            }
            
            vertexIndex += position.count;
          }
        }
      });
      
      saveString(objContent, `${fileName}.obj`);
      toast.success("OBJ file downloaded!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export OBJ");
    }
  };

  const exportFBX = () => {
    toast.info("FBX export requires additional processing. Using GLTF instead...");
    exportGLTF();
  };

  const saveArrayBuffer = (buffer: ArrayBuffer, filename: string) => {
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const saveString = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="absolute top-20 right-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 space-y-2 z-10">
      <h3 className="font-semibold text-sm mb-2">Download 3D Model</h3>
      <div className="flex flex-col gap-2">
        <Button size="sm" variant="outline" onClick={exportGLB} className="justify-start">
          <Download className="w-4 h-4 mr-2" />
          .GLB (Binary)
        </Button>
        <Button size="sm" variant="outline" onClick={exportGLTF} className="justify-start">
          <Download className="w-4 h-4 mr-2" />
          .GLTF (JSON)
        </Button>
        <Button size="sm" variant="outline" onClick={exportOBJ} className="justify-start">
          <Download className="w-4 h-4 mr-2" />
          .OBJ (Classic)
        </Button>
        <Button size="sm" variant="outline" onClick={exportFBX} className="justify-start">
          <Download className="w-4 h-4 mr-2" />
          .FBX (Advanced)
        </Button>
      </div>
    </div>
  );
}
