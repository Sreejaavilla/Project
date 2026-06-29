import React from 'react';
import { Shield, Zap, Lock, Terminal, Skull } from 'lucide-react';
import { useSentinel } from '@/context/SentinelContext';
import { Button } from '@/components/ui/button';
import { detectEntities, sanitizeText } from '@/lib/piiDetector';

export default function TopNav() {
  const { 
    setOriginalText, 
    setDetectedEntities, 
    setSanitizedText, 
    setEntityMappings,
    addLog,
    clearAll,
    isThreatSimulationMode,
    setIsThreatSimulationMode,
    excludedEntities
  } = useSentinel();

  const runDemo = () => {
    clearAll();
    const demoText = `Medical Report - Patient: Dr. Amelia Watson
Date: January 15, 2024
Patient Email: amelia.watson@healthcare.com
Phone: +91-9876543210
Aadhaar: 4532 8891 2234
PAN: ABCPW3456Q
Salary: $120,000 annually
Address: 742 Evergreen Terrace, Springfield, IL 62701
Diagnosis: Type 2 Diabetes Mellitus
Prescription: Metformin 500mg twice daily
Account Balance: $45,231.50
Bank: HDFC Bank Account #384729102`;

    setOriginalText(demoText);
    addLog("Demo scenario loaded.", "info");

    setTimeout(() => {
      addLog("Starting automated detection scan...", "warning");
      const matches = detectEntities(demoText);
      setDetectedEntities(matches);
      matches.forEach(m => addLog(`${m.type} detected: ${m.value} (Conf: ${(m.confidence * 100).toFixed(1)}%)`, "warning"));
      
      const { sanitized, mappings } = sanitizeText(demoText, matches, excludedEntities);
      setSanitizedText(sanitized);
      setEntityMappings(mappings);
      addLog(`Sanitization complete. ${matches.length} entities protected.`, "success");
    }, 800);
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm h-16 flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-6 h-6 animate-pulse" />
          <h1 className="font-mono font-bold text-xl tracking-tighter">SENTINEL-AI</h1>
        </div>
        <div className="hidden md:flex items-center gap-3 ml-8 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1 bg-card px-2 py-1 rounded border border-border"><Zap className="w-3 h-3 text-emerald-500" /> LOCAL INFERENCE ✓</span>
          <span className="flex items-center gap-1 bg-card px-2 py-1 rounded border border-border"><Shield className="w-3 h-3 text-emerald-500" /> ZERO CLOUD EXPOSURE ✓</span>
          <span className="flex items-center gap-1 bg-card px-2 py-1 rounded border border-border"><Lock className="w-3 h-3 text-emerald-500" /> E2E ENCRYPTED ✓</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4">
           <span className="text-xs font-mono text-muted-foreground">RISK LEVEL</span>
           <div className="h-2 w-24 bg-card rounded overflow-hidden flex border border-border">
              <div className="bg-emerald-500 h-full w-full shadow-[0_0_10px_rgba(0,255,136,0.5)]"></div>
           </div>
        </div>

        <Button variant="outline" size="sm" onClick={runDemo} className="font-mono text-xs border-primary/50 hover:bg-primary/10 hover:text-primary">
          <Terminal className="w-4 h-4 mr-2" />
          RUN DEMO SCENARIO
        </Button>
        <Button 
          variant={isThreatSimulationMode ? "destructive" : "secondary"} 
          size="sm" 
          onClick={() => setIsThreatSimulationMode(!isThreatSimulationMode)}
          className="font-mono text-xs"
        >
          <Skull className="w-4 h-4 mr-2" />
          {isThreatSimulationMode ? "EXIT SIMULATION" : "THREAT SIMULATION"}
        </Button>
      </div>
    </header>
  );
}
