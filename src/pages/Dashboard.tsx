import ModuleCard3D from '@/components/ModuleCard3D';
import { Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero */}
      <section className="text-center py-16 px-4">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-muted-foreground mb-6">
            <Sparkles className="w-4 h-4 text-primary" /> Smart Predictions. Better Decisions.
          </div>
          <img src={logo} alt="Zentrix Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            <span className="gradient-text">ZENTRIX</span>
            <br />
            <span className="text-foreground text-2xl sm:text-3xl">Professional Analytics Dashboard</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            An intelligent platform to help you understand student performance, manage finances, and gain useful health insights — all in one place.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="flex-1 px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <ModuleCard3D
            module="student"
            title="Student Excellence"
            description="Understand student performance and get smart insights based on academic data."
            to="/student"
            delay={0}
          />
          <ModuleCard3D
            module="finance"
            title="Financial Health"
            description="Track your income and expenses to get clear financial insights and better saving decisions."
            to="/finance"
            delay={150}
          />
          <ModuleCard3D
            module="disease"
            title="Health Insights"
            description="Analyze your symptoms and receive helpful guidance and general health insights."
            to="/disease"
            delay={300}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="Zentrix" className="w-4 h-4 object-contain" />
          ZENTRIX — Professional Analytics Platform
        </div>
      </footer>
    </div>
  );
}
