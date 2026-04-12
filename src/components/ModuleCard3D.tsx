import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, TrendingUp, HeartPulse, ArrowRight } from 'lucide-react';

const icons = { student: GraduationCap, finance: TrendingUp, disease: HeartPulse };
const gradients = {
  student: 'from-violet-500/20 to-blue-500/20',
  finance: 'from-emerald-500/20 to-teal-500/20',
  disease: 'from-rose-500/20 to-orange-500/20',
};
const iconColors = { student: 'text-violet-400', finance: 'text-emerald-400', disease: 'text-rose-400' };

interface Props {
  module: 'student' | 'finance' | 'disease';
  title: string;
  description: string;
  to: string;
  delay: number;
}

export default function ModuleCard3D({ module, title, description, to, delay }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const Icon = icons[module];

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) scale3d(1.03, 1.03, 1.03)`);
  };

  return (
    <Link to={to} className="block" style={{ animationDelay: `${delay}ms` }}>
      <div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={() => setTransform('')}
        className={`glass-card rounded-2xl p-8 transition-all duration-300 cursor-pointer group animate-fade-in-up bg-gradient-to-br ${gradients[module]} hover:shadow-xl`}
        style={{ transform, transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <div className="mb-6" style={{ transform: 'translateZ(40px)' }}>
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradients[module]} flex items-center justify-center animate-pulse-glow`}>
            <Icon className={`w-8 h-8 ${iconColors[module]}`} />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground" style={{ transform: 'translateZ(30px)' }}>{title}</h3>
        <p className="text-muted-foreground text-sm mb-6" style={{ transform: 'translateZ(20px)' }}>{description}</p>
        <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all" style={{ transform: 'translateZ(25px)' }}>
          Explore <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
