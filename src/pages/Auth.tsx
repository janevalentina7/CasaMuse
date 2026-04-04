import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const { user, loading, signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signUpSchema.safeParse({ name, email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signUp(email, password, name);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account!");
      setTab("login");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setIsSubmitting(true);
    const { error } = await resetPassword(resetEmail);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent to your email!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">CasaMuse</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Home className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome to CasaMuse</CardTitle>
            <CardDescription>Design your dream home with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" type="email" placeholder="you@example.com" className="pl-9"
                        value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="login-password" type="password" placeholder="••••••••" className="pl-9"
                        value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-name" placeholder="John Doe" className="pl-9"
                        value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="you@example.com" className="pl-9"
                        value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className="pl-9"
                        value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a link to reset your password.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="reset-email" type="email" placeholder="you@example.com" className="pl-9"
                        value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
