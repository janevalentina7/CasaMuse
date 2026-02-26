import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: string | null;
}

class ModelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.warn("3D Model loading error caught:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[500px] rounded-lg border border-border bg-muted/10 flex flex-col items-center justify-center gap-3 p-6">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {this.props.fallbackMessage || "Failed to load 3D model. The model URL may have expired. Try regenerating."}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ModelErrorBoundary;
