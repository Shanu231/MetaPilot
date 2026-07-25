import { useNavigate } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden font-body text-white">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main glass card */}
      <div className="w-full max-w-lg glass rounded-2xl border border-white/10 shadow-2xl p-10 relative z-10 flex flex-col items-center text-center">
        {/* Animated icon */}
        <div className="h-16 w-16 rounded-2xl bg-brand-accent/15 border border-brand-accent/25 flex items-center justify-center text-brand-secondary shadow-glow-accent mb-6 animate-bounce">
          <Compass className="h-8 w-8 text-brand-accent" />
        </div>

        <h1 className="text-6xl font-bold font-heading tracking-tight text-white leading-none">404</h1>
        <h2 className="text-xl font-bold font-heading mt-4 text-white">Resource Coordinates Lost</h2>
        
        <p className="text-sm text-brand-muted mt-3 leading-relaxed max-w-sm">
          The dataset schema, lineage catalog, or page you are requesting could not be located in our workspace indexes.
        </p>

        {/* Action Button */}
        <Button
          onClick={() => navigate("/dashboard")}
          variant="glow"
          className="mt-8 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Button>
      </div>
    </div>
  );
}
