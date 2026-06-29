import React from 'react';
import TopNav from '@/components/TopNav';
import LeftPanel from '@/components/LeftPanel';
import CenterPanel from '@/components/CenterPanel';
import RightPanel from '@/components/RightPanel';
import ThreatConsole from '@/components/ThreatConsole';
import ThreatSimulator from '@/components/ThreatSimulator';
import PipelineViz from '@/components/PipelineViz';
import { useSentinel } from '@/context/SentinelContext';

export default function SentinelApp() {
  const { isThreatSimulationMode } = useSentinel();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/30 font-sans">
      <TopNav />
      
      <main className="flex-1 p-4 flex flex-col gap-4">
        {/* Main 3 Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px] min-h-[600px]">
          <LeftPanel />
          <CenterPanel />
          <RightPanel />
        </div>

        {/* Pipeline & Console */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          <div className="col-span-1 lg:col-span-3">
            <PipelineViz />
          </div>
          <div className="col-span-1">
            <ThreatConsole />
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="flex justify-center gap-6 py-6 border-t border-border mt-4">
          {["GDPR ✓", "HIPAA ✓", "SOC 2 ✓", "ISO 27001 ✓"].map(badge => (
            <div key={badge} className="px-4 py-2 rounded-full bg-card/50 border border-primary/20 text-primary font-mono text-sm tracking-wider shadow-[0_0_10px_rgba(0,255,136,0.1)]">
              {badge}
            </div>
          ))}
        </div>
      </main>

      {isThreatSimulationMode && <ThreatSimulator />}
    </div>
  );
}
