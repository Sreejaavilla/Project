import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { useSentinel } from '@/context/SentinelContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ThreatConsole() {
  const { logs } = useSentinel();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-panel h-full flex flex-col overflow-hidden border-border bg-black">
      <div className="bg-muted/50 px-3 py-2 flex items-center gap-2 border-b border-border">
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">System Events</span>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-1 font-mono text-xs">
          {logs.map((log) => {
            let colorClass = "text-muted-foreground";
            let prefix = "•";
            
            if (log.type === "warning") {
              colorClass = "text-yellow-500";
              prefix = "⚠️";
            } else if (log.type === "success") {
              colorClass = "text-emerald-500";
              prefix = "✓";
            } else if (log.type === "error") {
              colorClass = "text-destructive";
              prefix = "✖";
            }

            return (
              <div key={log.id} className={`${colorClass} flex gap-2`}>
                <span className="opacity-50 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
                <span className="shrink-0">{prefix}</span>
                <span className="break-all">{log.message}</span>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="text-muted-foreground/50 italic">Waiting for system events...</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
