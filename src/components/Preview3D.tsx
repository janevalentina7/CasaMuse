import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import housePreview from "@/assets/3d-house-preview.jpg";

const Preview3D = () => {
  return (
    <section className="py-20 sm:py-32 bg-gradient-dark text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="order-2 lg:order-1 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-glow">
              <img 
                src={housePreview} 
                alt="Photorealistic 3D house model with modern architecture" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent" />
              
              {/* Floating badge */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                <div className="text-xs text-accent font-medium">3D Rendering</div>
                <div className="text-sm font-bold text-foreground">Photorealistic Quality</div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium">
              High-Quality 3D Models
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Visualize Your Home
              <span className="block text-secondary">
                Before It's Built
              </span>
            </h2>
            
            <p className="text-lg text-white/80 leading-relaxed">
              Get stunning photorealistic 3D renderings of your house design. See every detail - 
              from exterior facades to interior layouts - with accurate materials, lighting, and textures.
            </p>

            <ul className="space-y-4">
              {[
                "Realistic materials and textures",
                "Natural lighting and shadows",
                "Interior and exterior views",
                "Multiple angles and perspectives",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  </div>
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>

            <Button variant="secondary" size="lg" className="group mt-4">
              Explore 3D Features
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Preview3D;