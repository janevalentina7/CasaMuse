import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, ArrowLeft, ArrowRight, IndianRupee, MapPin, Wallet, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CostEstimationEnhanced from "@/components/CostEstimationEnhanced";

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Kochi', 'Indore', 'Nagpur', 'Coimbatore'
];

const CostEstimationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, formData, description, costEstimationData: initialData } = location.state || {};
  const [costEstimationData, setCostEstimationData] = useState<any>(initialData || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [userBudget, setUserBudget] = useState('');
  const [userBuildTime, setUserBuildTime] = useState('');

  const handleGenerate = async () => {
    if (!formData) return;

    setIsGenerating(true);
    toast.info("Generating detailed cost estimation...");

    try {
      const budgetValue = userBudget ? parseInt(userBudget.replace(/,/g, '')) : undefined;

      const { data, error } = await supabase.functions.invoke('generate-cost-estimation', {
        body: {
          landArea: formData.landArea,
          rooms: formData.rooms,
          preferences: formData.preferences,
          floorPlanDescription: description,
          location: userLocation || undefined,
          userBudget: budgetValue,
          desiredBuildTime: userBuildTime ? parseInt(userBuildTime) : undefined,
        }
      });

      if (error) throw error;

      if (data?.success && data?.estimation) {
        setCostEstimationData(data.estimation);
        toast.success("Cost estimation generated!");
      } else {
        throw new Error(data?.error || "Failed to generate cost estimation");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate cost estimation.");
    } finally {
      setIsGenerating(false);
    }
  };

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
              <Link to="/vr-walkthrough" state={{ imageUrl, description, formData }}>
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              </Link>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/design-summary', { state: { imageUrl, description, formData, costEstimationData } })}
              >
                Next: Summary<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Cost <span className="bg-gradient-primary bg-clip-text text-transparent">Estimation</span>
            </h1>
            <p className="text-muted-foreground">Get a detailed construction cost breakdown for your home</p>
          </div>

          {/* Settings */}
          {!costEstimationData && (
            <Card className="glass-card border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Estimation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />Location
                    </Label>
                    <Select value={userLocation} onValueChange={setUserLocation}>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_CITIES.map(city => (
                          <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />Budget (₹, optional)
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., 5000000"
                      value={userBudget}
                      onChange={(e) => setUserBudget(e.target.value.replace(/[^0-9]/g, ''))}
                      className="text-foreground bg-background"
                    />
                    {userBudget && (
                      <p className="text-sm text-primary font-medium">₹{parseInt(userBudget).toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />Build Time
                    </Label>
                    <Select value={userBuildTime} onValueChange={setUserBuildTime}>
                      <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="9">9 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-center pt-4">
                  <Button variant="hero" size="lg" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <IndianRupee className="w-5 h-5 mr-2" />}
                    {isGenerating ? 'Calculating...' : 'Generate Cost Estimation'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {isGenerating && !costEstimationData && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating detailed cost estimation...</p>
            </div>
          )}

          {costEstimationData && (
            <CostEstimationEnhanced
              data={costEstimationData}
              formData={formData}
              onUpdate={(newData: any) => setCostEstimationData(newData)}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8">
            <Link to="/vr-walkthrough" state={{ imageUrl, description, formData }}>
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />Previous: VR Walkthrough
              </Button>
            </Link>
            <Link to="/design-summary" state={{ imageUrl, description, formData, costEstimationData }}>
              <Button variant="hero" size="lg">
                Next: Project Summary<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CostEstimationPage;
