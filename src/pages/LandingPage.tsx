import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  ArrowRight,
  GitBranch,
  MessageSquare,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import logoImg from "../assets/logo.jpg";
import { cn } from "../utils/cn";

export function LandingPage() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(prev => (prev === idx ? null : idx));
  };

  const faqData = [
    { q: "What is MetaPilot?", a: "MetaPilot is an enterprise-grade AI Engineering Agent that maps your organization's entire data catalog using DataHub integration before writing and executing pipelines solutions." },
    { q: "Does it execute operations directly on our databases?", a: "No, MetaPilot synthesizes fully reviewable code templates, transformation models (DBT), orchestration (Airflow), and analytics queries to run on staging layers first." },
    { q: "How does the DataHub integration work?", a: "MetaPilot queries DataHub General Metadata Service (GMS) APIs to read schema structures, lineage dependencies, and data quality metrics instantly without direct database connections." },
    { q: "Is it secure for PII and sensitive tables?", a: "Yes, MetaPilot respects database tagging schemas. If a column is tagged as PII inside DataHub, the agent flags it and masks column properties from contextual queries automatically." }
  ];

  return (
    <div className="bg-[#050816] text-white min-h-screen relative font-body overflow-x-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[100vh] bg-gradient-radial-glow pointer-events-none z-0" />
      <div className="absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] bg-brand-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] bg-brand-accent/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="fixed top-0 inset-x-0 h-16 border-b border-white/5 bg-[#050816]/60 backdrop-blur-md z-40 flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoImg} alt="MetaPilot logo" className="h-8 w-8 rounded-lg shadow-glow-secondary object-cover" />
          <span className="font-heading text-lg font-bold tracking-tight text-white">MetaPilot</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-brand-muted font-medium font-heading">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-xs py-2 px-4">
            Sign In
          </Button>
          <Button variant="glow" onClick={() => navigate("/login")} className="text-xs py-2 px-4">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center max-w-5xl mx-auto z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Animated top pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-xs text-brand-secondary font-semibold font-heading tracking-wide mb-6 shadow-glow-primary">
            <Sparkles className="h-3 w-3 text-brand-accent animate-spin-slow" />
            <span>Introducing MetaPilot Phase 1</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-bold font-heading tracking-tight leading-[1.1] max-w-4xl text-white">
            Navigate Data Ecosystems. <br />
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
              Build Production pipelines Smarter.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-brand-muted mt-6 max-w-2xl leading-relaxed">
            MetaPilot scans and maps your organization&apos;s complete data dependencies via DataHub, generating robust transformation, lineage and orchestration code instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full justify-center">
            <Button variant="glow" size="lg" onClick={() => navigate("/login")} className="gap-2.5 font-semibold w-full sm:w-auto">
              <span>Access Interactive Workspace</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>
            <a href="#features" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                Explore Features
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Hero mockup frame */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full mt-16 rounded-2xl border border-white/10 glass shadow-2xl p-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 via-brand-secondary/5 to-transparent blur-md pointer-events-none" />
          <div className="rounded-xl border border-white/5 overflow-hidden bg-[#050816]/80 flex flex-col h-[280px] sm:h-[400px]">
            {/* Mock Dashboard Top controls */}
            <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-[10px] text-brand-muted font-bold font-code">app.metapilot.io/dashboard</span>
              <div className="w-6" />
            </div>
            {/* Visual representation */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-brand-muted">
              <Database className="h-10 w-10 text-brand-secondary animate-pulse mb-3" />
              <span className="text-sm font-semibold font-heading text-white">Interactive Telemetry Connected</span>
              <span className="text-xs mt-1 max-w-sm">Mock dashboards, lineage diagrams, and chat agents are initialized. Click Get Started above to enter.</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By logo wall ticker */}
      <section className="py-12 border-y border-white/5 bg-white/[0.005] z-10 relative">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider font-heading">
            Enterprise grade data integration mapping
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-6 opacity-40">
            <span className="text-sm font-bold font-heading text-white tracking-widest uppercase">Snowflake</span>
            <span className="text-sm font-bold font-heading text-white tracking-widest uppercase">PostgreSQL</span>
            <span className="text-sm font-bold font-heading text-white tracking-widest uppercase">dbt labs</span>
            <span className="text-sm font-bold font-heading text-white tracking-widest uppercase">Airflow</span>
            <span className="text-sm font-bold font-heading text-white tracking-widest uppercase">DataHub</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-20 px-6 md:px-12 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
            Engineered for modern data operations
          </h2>
          <p className="text-sm text-brand-muted mt-2 max-w-xl mx-auto">
            MetaPilot brings high-fidelity visualization, code generation and catalog exploration to one dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Card className="flex flex-col gap-4">
            <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary w-fit">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-white">AI chat Workspace</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Interact with schemas using natural language. Synthesize transformations SQL, dbt, and python scripts dynamically with full context scope linking.
            </p>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="p-2.5 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary w-fit">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-white">Interactive Lineage</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Explore complex dependencies paths mapping databases, staging folders, schemas, and BI reports. Trace data flow points with drag and zoom coordinates.
            </p>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="p-2.5 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent w-fit">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-white">Schema Metadata Explorer</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Browse warehouse catalogs. Inspect field tables descriptors, column primary keys, data quality tags, owners, and row preview ledgers.
            </p>
          </Card>
        </div>
      </section>

      {/* Workflow Section: How it works */}
      <section id="workflow" className="py-20 border-t border-white/5 bg-white/[0.005] z-10 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">The MetaPilot Workflow</h2>
            <p className="text-sm text-brand-muted mt-2">How MetaPilot maps metadata profiles to production files.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-heading text-lg font-bold text-brand-secondary mb-4 shadow-glow-primary">
                1
              </div>
              <h3 className="text-lg font-bold font-heading text-white">Ingest Catalog</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed max-w-xs">
                Scan connected database models and lineage pathways from DataHub API structures.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center font-heading text-lg font-bold text-brand-secondary mb-4 shadow-glow-secondary">
                2
              </div>
              <h3 className="text-lg font-bold font-heading text-white">Synthesize lineage</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed max-w-xs">
                Connect transformations and maps tables to data flow systems using interactive DAG graphs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center font-heading text-lg font-bold text-brand-accent mb-4 shadow-glow-accent">
                3
              </div>
              <h3 className="text-lg font-bold font-heading text-white">Generate Code</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed max-w-xs">
                Receive fully tested, copyable, and downloadable Airflow, dbt, SQL or python code files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture section panel */}
      <section id="architecture" className="py-20 px-6 md:px-12 max-w-6xl mx-auto z-10 relative">
        <Card className="text-center flex flex-col items-center p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">Connected Architecture</h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-2 max-w-xl leading-relaxed">
            DataHub acts as the unified metadata catalog provider, passing structured tables, lineages, quality scores, and tags to MetaPilot&apos;s code generator engines.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 w-full max-w-lg justify-center font-heading">
            <div className="px-5 py-3.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-semibold text-brand-muted flex flex-col items-center gap-1.5 shrink-0">
              <Database className="h-5 w-5 text-brand-primary" />
              <span>DataHub Registry</span>
            </div>
            <div className="h-[2px] w-12 bg-gradient-to-r from-brand-primary to-brand-accent hidden sm:block" />
            <div className="px-5 py-3.5 rounded-xl border border-brand-accent/20 bg-brand-primary/5 text-xs font-semibold text-white flex flex-col items-center gap-1.5 shrink-0 shadow-glow-primary">
              <Sparkles className="h-5 w-5 text-brand-secondary animate-pulse" />
              <span>MetaPilot AI</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-white/5 bg-white/[0.005] z-10 relative">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold font-heading tracking-tight mb-16">What data leads say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card>
              <p className="text-xs text-brand-muted leading-relaxed italic">
                &ldquo;Mapping analytics and schemas across Snowflake databases has always been a painful constraint. MetaPilot analyzed column mappings in minutes using our DataHub registry data, generating staging dbt and airflow files that compiled flawlessly.&rdquo;
              </p>
              <div className="flex items-center gap-3.5 mt-5 border-t border-white/5 pt-4">
                <div className="h-8 w-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-[10px] font-bold">MW</div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Marcus Vance</span>
                  <span className="text-[10px] text-brand-muted">Lead Analytics Engineer, Stripe</span>
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-xs text-brand-muted leading-relaxed italic">
                &ldquo;Visual Lineage Graph drags and Zoom properties were incredibly responsive. The AI chat assistant linked schema context scopes immediately without direct database link credentials. A beautiful, handcrafted tool for data teams.&rdquo;
              </p>
              <div className="flex items-center gap-3.5 mt-5 border-t border-white/5 pt-4">
                <div className="h-8 w-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-[10px] font-bold">EL</div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Emma Linwood</span>
                  <span className="text-[10px] text-brand-muted">Director of Data Operations, Vercel</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-6 md:px-12 max-w-3xl mx-auto z-10 relative">
        <h2 className="text-3xl font-bold font-heading tracking-tight text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-3 text-left">
          {faqData.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="glass border border-white/5 rounded-xl overflow-hidden transition-all duration-200">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 font-heading text-sm font-semibold text-white hover:bg-white/[0.02] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-brand-secondary transform transition-transform duration-200", isOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-4 text-xs text-brand-muted leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6 md:px-12 bg-[#050816] z-10 relative text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="MetaPilot logo" className="h-7 w-7 rounded object-cover" />
            <span className="font-heading text-sm font-bold text-white tracking-wide">MetaPilot</span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-brand-muted font-medium font-heading">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <span className="text-[10px] text-brand-muted">
            &copy; 2026 MetaPilot Inc. All rights reserved. Navigate Data. Build Smarter.
          </span>
        </div>
      </footer>
    </div>
  );
}
