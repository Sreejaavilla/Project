import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Lock, Trash2, ShieldAlert } from 'lucide-react';
import { useSentinel } from '@/context/SentinelContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import { extractTextFromImage } from '@/lib/imageOcr';
import EntityHighlighter from './EntityHighlighter';
import { detectEntities, sanitizeText } from '@/lib/piiDetector';

export default function LeftPanel() {
  const { 
    originalText, 
    setOriginalText, 
    detectedEntities, 
    setDetectedEntities,
    setSanitizedText,
    setEntityMappings,
    addLog,
    clearAll,
    excludedEntities
  } = useSentinel();

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setIsProcessing(true);
    setProgress(0);
    addLog(`Processing file: ${file.name}`, "info");

    try {
      let text = "";
      if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
      } else if (file.type.startsWith("image/")) {
        text = await extractTextFromImage(file, (p) => setProgress(p * 100));
      } else if (file.type === "text/plain") {
        text = await file.text();
      }
      setOriginalText(text);
      addLog(`Extraction complete for ${file.name}`, "success");
    } catch (err) {
      addLog(`Failed to extract text from ${file.name}`, "error");
    } finally {
      setIsProcessing(false);
    }
  }, [setOriginalText, addLog]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt']
    }
  });

  const handleDetect = () => {
    if (!originalText.trim()) return;
    addLog("Scanning text for PII...", "warning");
    const matches = detectEntities(originalText);
    setDetectedEntities(matches);
    matches.forEach(m => addLog(`Found ${m.type}: ${m.value}`, "warning"));
    
    const { sanitized, mappings } = sanitizeText(originalText, matches, excludedEntities);
    setSanitizedText(sanitized);
    setEntityMappings(mappings);
    addLog(`Sanitization generated ${mappings.size} placeholders.`, "success");
  };

  const typeCounts = detectedEntities.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="glass-panel flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          ORIGINAL INPUT
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-8">
            <Trash2 className="w-4 h-4 mr-2" /> Clear
          </Button>
          <Button size="sm" onClick={handleDetect} className="h-8 bg-emerald-600 hover:bg-emerald-500 text-black">
            <ShieldAlert className="w-4 h-4 mr-2" /> Detect
          </Button>
        </div>
      </div>

      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-card/30'}`}>
        <input {...getInputProps()} />
        <Upload className={`w-8 h-8 mb-2 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-sm font-mono text-muted-foreground text-center">
          {isProcessing 
            ? `Processing... ${progress > 0 ? progress.toFixed(0) + '%' : ''}`
            : "Drop .pdf, .txt, .png here or click to upload"
          }
        </p>
      </div>

      <div className="flex-1 relative border border-border rounded-md bg-card/30 overflow-hidden font-mono text-sm">
        {detectedEntities.length > 0 ? (
          <div className="absolute inset-0 overflow-auto p-3">
             <EntityHighlighter text={originalText} entities={detectedEntities} />
          </div>
        ) : (
          <Textarea 
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste your document text here..."
            className="h-full w-full resize-none border-none bg-transparent focus-visible:ring-0 font-mono text-sm p-3"
          />
        )}
      </div>

      {detectedEntities.length > 0 && (
        <div className="bg-card border border-border rounded p-3">
          <div className="text-xs font-mono text-muted-foreground mb-2 uppercase">Detection Summary</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className="px-2 py-1 rounded bg-muted/50 border border-border text-xs flex gap-2 items-center">
                <span className="font-bold">{type}</span>
                <span className="text-emerald-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
