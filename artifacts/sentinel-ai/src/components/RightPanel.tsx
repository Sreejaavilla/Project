import React from 'react';
import { RotateCcw, Copy, Activity } from 'lucide-react';
import { useSentinel } from '@/context/SentinelContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { restoreText } from '@/lib/piiDetector';

export default function RightPanel() {
  const { 
    aiResponseText, 
    setAiResponseText, 
    restoredText, 
    setRestoredText,
    entityMappings,
    addLog,
    logs
  } = useSentinel();

  const handleRestore = () => {
    if (!aiResponseText.trim()) return;
    addLog("Restoring context to AI response...", "info");
    const restored = restoreText(aiResponseText, entityMappings);
    setRestoredText(restored);
    
    // Log restorations
    entityMappings.forEach((val, key) => {
      if (aiResponseText.includes(key)) {
         addLog(`Restored ${key} → [REDACTED]`, "success");
      }
    });
  };

  const restorationLogs = logs.filter(l => l.message.startsWith("Restored"));

  return (
    <div className="glass-panel flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-blue-400" />
          CONTEXT RESTORATION
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="text-xs font-mono text-muted-foreground">1. Paste AI Response</div>
        <Textarea 
          value={aiResponseText}
          onChange={(e) => setAiResponseText(e.target.value)}
          placeholder="Paste AI response containing placeholders like [PERSON_1]..."
          className="h-32 resize-none font-mono text-sm bg-card/50"
        />
        
        <Button onClick={handleRestore} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm" disabled={entityMappings.size === 0}>
          <RotateCcw className="w-4 h-4 mr-2" /> Restore Original Data
        </Button>

        <div className="text-xs font-mono text-muted-foreground mt-2">2. Restored Output</div>
        <div className="flex-1 border border-border rounded-md bg-card/30 overflow-auto font-mono text-sm p-4 whitespace-pre-wrap">
          {restoredText ? (
             <span dangerouslySetInnerHTML={{ 
               __html: Array.from(entityMappings.entries()).reduce(
                 (acc, [placeholder, val]) => acc.replace(new RegExp(val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `<span class="text-blue-400 bg-blue-400/10 px-1 rounded">${val}</span>`),
                 restoredText
               )
             }} />
          ) : (
            <span className="text-muted-foreground">Final output will appear here...</span>
          )}
        </div>
      </div>

      <div className="h-32 border border-border rounded-md bg-card flex flex-col overflow-hidden">
         <div className="bg-muted px-3 py-1 text-xs font-mono border-b border-border flex items-center gap-2">
            <Activity className="w-3 h-3 text-blue-400" /> Restoration Log
         </div>
         <ScrollArea className="flex-1 p-2">
            {restorationLogs.length === 0 ? (
              <div className="text-xs text-muted-foreground font-mono text-center mt-8">No restorations yet</div>
            ) : (
              <div className="space-y-1">
                {restorationLogs.map(log => (
                  <div key={log.id} className="text-xs font-mono text-blue-400/80">
                    <span className="text-muted-foreground">[{log.timestamp.toISOString().split('T')[1].slice(0,-1)}]</span> {log.message}
                  </div>
                ))}
              </div>
            )}
         </ScrollArea>
      </div>
    </div>
  );
}
