import { Card, CardContent } from "@/components/ui/card";
import { FileText, Sparkles, Download, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Enter Your Requirements",
    description: "Specify land area, number of rooms, style preferences, floors, outdoor features, and optional Vastu compliance.",
    color: "text-primary",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Generates Design",
    description: "Our advanced AI processes your inputs following real architectural standards and generates professional floor plans.",
    color: "text-secondary",
  },
  {
    number: "03",
    icon: Download,
    title: "Download & Customize",
    description: "Get your 2D floor plans and 3D models instantly. Review, customize, and download in multiple formats.",
    color: "text-accent",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Design in
            <span className="bg-gradient-primary bg-clip-text text-transparent"> 3 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From idea to professional architectural design in minutes
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines - desktop only */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-30" />
            
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="border-border/50 hover:shadow-soft transition-all duration-300">
                  <CardContent className="p-6 sm:p-8 text-center">
                    {/* Step number */}
                    <div className="text-6xl sm:text-7xl font-bold opacity-10 absolute top-4 right-4">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${step.color.replace('text-', '')} to-${step.color.replace('text-', '')}/80 flex items-center justify-center mx-auto mb-6 relative z-10`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Arrow - mobile only */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center md:hidden my-4">
                    <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;