import { Outlet, Link } from "react-router-dom";
import logoImg from "../assets/logo.jpg";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden font-body text-white">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main glass box wrapper */}
      <div className="w-full max-w-md glass rounded-2xl border border-white/10 shadow-2xl p-8 relative z-10 flex flex-col items-center">
        {/* Branding header */}
        <Link to="/" className="flex flex-col items-center gap-2.5 mb-8">
          <img src={logoImg} alt="MetaPilot logo" className="h-12 w-12 rounded-xl shadow-glow-secondary object-cover" />
          <h2 className="text-2xl font-bold font-heading tracking-tight text-white mt-2">
            MetaPilot
          </h2>
          <p className="text-xs text-brand-muted uppercase font-semibold tracking-wider">
            Navigate Data. Build Smarter.
          </p>
        </Link>

        {/* Auth inputs container */}
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
