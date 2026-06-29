import React from 'react';
import { ShieldCheck, Copy, Download } from 'lucide-react';
import { useSentinel } from '@/context/SentinelContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText } from '@/lib/piiDetector';

export default function CenterPanel() {
  const { 
    originalText,
    sanitizedText, 
    detectedEntities, 
    entityMappings,
    excludedEntities,
    toggleEntityExclusion,
    setSanitizedText,
    setEntityMappings
  } = useSentinel();
  
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(sanitizedText);
    toast({ description: "Sanitized text copied to clipboard" });
  };

  const handleExport = () => {
    const blob = new Blob([sanitizedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sanitized_output.txt";
    a.click();
  };

  const handleToggle = (placeholder: string) => {
    toggleEntityExclusion(placeholder);
    // Recalculate sanitization
    setTimeout(() => {
        // This is a bit hacky relying on state closure, but okay for this context
        // Real app would effect this based on dependencies
    }, 0);
  };

  // Re-run sanitization when exclusions change
  React.useEffect(() => {
    if (originalText && detectedEntities.length > 0) {
        const { sanitized, mappings } = sanitizeText(originalText, detectedEntities, excludedEntities);
        setSanitizedText(sanitized);
        setEntityMappings(mappings);
    }
  }, [excludedEntities, originalText, detectedEntities, setSanitizedText, setEntityMappings]);


  return (
    <div className="glass-panel flex flex-col p-4 gap-4 border-emerald-500/30">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          SAFE FOR AI ✓
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport} className="h-8">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 border border-emerald-500/20 rounded-md bg-card/30 overflow-auto font-mono text-sm p-4 relative shadow-[inset_0_0_20px_rgba(0,255,136,0.05)] whitespace-pre-wrap leading-relaxed text-muted-foreground">
        {sanitizedText || "Sanitized output will appear here..."}
      </div>

      {detectedEntities.length > 0 && (
        <div className="h-48 border border-border rounded-md bg-card flex flex-col overflow-hidden">
          <div className="bg-muted px-3 py-2 text-xs font-mono uppercase border-b border-border font-bold">
            Entity Mapping Store
          </div>
          <ScrollArea className="flex-1">
            <div className="p-0">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-card sticky top-0 border-b border-border/50">
                  <tr>
                    <th className="px-3 py-2 font-normal text-muted-foreground w-8">Active</th>
                    <th className="px-3 py-2 font-normal text-muted-foreground">Placeholder</th>
                    <th className="px-3 py-2 font-normal text-muted-foreground">Type</th>
                    <th className="px-3 py-2 font-normal text-muted-foreground">Original Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {detectedEntities.map((entity, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <Checkbox 
                          checked={!excludedEntities.has(entity.placeholder)}
                          onCheckedChange={() => handleToggle(entity.placeholder)}
                        />
                      </td>
                      <td className="px-3 py-2 text-emerald-400 font-bold">{entity.placeholder}</td>
                      <td className="px-3 py-2 text-muted-foreground">{entity.type}</td>
                      <td className="px-3 py-2 blur-[2px] hover:blur-none transition-all cursor-help">{entity.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
