import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PipelineViz() {
  const steps = [
    { label: "Original Input", icon: "📄", color: "text-muted-foreground" },
    { label: "PII Detection", icon: "🔍", color: "text-emerald-400", pulse: true },
    { label: "Sanitized", icon: "🛡️", color: "text-blue-400" },
    { label: "External LLM", icon: "🧠", color: "text-purple-400" },
    { label: "AI Response", icon: "💬", color: "text-purple-400" },
    { label: "Restored", icon: "✨", color: "text-emerald-400" }
  ];

  return (
    <div className="glass-panel p-4 flex flex-col h-full justify-center">
      <div className="text-xs font-mono text-muted-foreground mb-4 font-bold uppercase tracking-widest text-center">Secure Data Flow</div>
      <div className="flex items-center justify-between px-8">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-2 z-10 relative">
              <div className={`w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-xl shadow-lg relative ${step.pulse ? 'shadow-[0_0_15px_rgba(0,255,136,0.3)] border-emerald-500/50' : ''}`}>
                {step.icon}
                {step.pulse && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-emerald-500/50"
                    animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </div>
              <div className={`text-[10px] font-mono whitespace-nowrap ${step.color}`}>{step.label}</div>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-px bg-border relative overflow-hidden flex items-center mx-2">
                 <motion.div 
                   className="w-16 h-0.5 bg-emerald-500/50 absolute left-0 shadow-[0_0_8px_rgba(0,255,136,0.8)]"
                   animate={{ left: ['-20%', '120%'] }}
                   transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: idx * 0.2 }}
                 />
                 <ArrowRight className="w-3 h-3 text-muted-foreground/30 absolute left-1/2 -translate-x-1/2" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
