import { Card, CardContent } from "@/components/ui/card";
import { Home, Layers, Ruler, Zap, CheckCircle, Sparkles } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "2D Floor Plans",
    description: "Professional architect-grade 2D layouts with precise measurements, room labels, and furniture placement.",
    gradient: "from-primary to-primary/80",
  },
  {
    icon: Layers,
    title: "3D House Models",
    description: "Photorealistic 3D renderings with accurate materials, lighting, and detailed interiors & exteriors.",
    gradient: "from-secondary to-secondary/80",
  },
  {
    icon: Ruler,
    title: "Precise Dimensions",
    description: "Every room sized according to Indian construction standards with built-up and carpet area calculations.",
    gradient: "from-accent to-accent/80",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get complete designs in minutes, not days. AI processes your requirements and delivers professional results.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: CheckCircle,
    title: "Vastu Compliant",
    description: "Optional Vastu adherence with proper room direction, entrance placement, and traditional guidelines.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: Sparkles,
    title: "Fully Customizable",
    description: "Choose rooms, styles, floors, outdoor features, and modern amenities. Your dream home, your way.",
    gradient: "from-accent to-primary",
  },
];

const Features = () => {
  return (
    <section className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Design Your Dream Home
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional architectural tools powered by AI. Create stunning designs with accuracy and ease.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-border/50 overflow-hidden"
            >
              <CardContent className="p-6 sm:p-8">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;