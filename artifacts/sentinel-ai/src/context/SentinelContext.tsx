import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EntityMatch } from '@/lib/piiDetector';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface SentinelState {
  originalText: string;
  setOriginalText: (text: string) => void;
  detectedEntities: EntityMatch[];
  setDetectedEntities: (entities: EntityMatch[]) => void;
  sanitizedText: string;
  setSanitizedText: (text: string) => void;
  entityMappings: Map<string, string>;
  setEntityMappings: (mappings: Map<string, string>) => void;
  logs: LogEntry[];
  addLog: (message: string, type: LogEntry['type']) => void;
  aiResponseText: string;
  setAiResponseText: (text: string) => void;
  restoredText: string;
  setRestoredText: (text: string) => void;
  isThreatSimulationMode: boolean;
  setIsThreatSimulationMode: (active: boolean) => void;
  excludedEntities: Set<string>;
  toggleEntityExclusion: (placeholder: string) => void;
  clearAll: () => void;
}

const SentinelContext = createContext<SentinelState | undefined>(undefined);

export function SentinelProvider({ children }: { children: ReactNode }) {
  const [originalText, setOriginalText] = useState("");
  const [detectedEntities, setDetectedEntities] = useState<EntityMatch[]>([]);
  const [sanitizedText, setSanitizedText] = useState("");
  const [entityMappings, setEntityMappings] = useState<Map<string, string>>(new Map());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiResponseText, setAiResponseText] = useState("");
  const [restoredText, setRestoredText] = useState("");
  const [isThreatSimulationMode, setIsThreatSimulationMode] = useState(false);
  const [excludedEntities, setExcludedEntities] = useState<Set<string>>(new Set());

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), timestamp: new Date(), message, type }]);
  };

  const toggleEntityExclusion = (placeholder: string) => {
    setExcludedEntities(prev => {
      const next = new Set(prev);
      if (next.has(placeholder)) {
        next.delete(placeholder);
      } else {
        next.add(placeholder);
      }
      return next;
    });
  };

  const clearAll = () => {
    setOriginalText("");
    setDetectedEntities([]);
    setSanitizedText("");
    setEntityMappings(new Map());
    setLogs([]);
    setAiResponseText("");
    setRestoredText("");
    setExcludedEntities(new Set());
  };

  return (
    <SentinelContext.Provider value={{
      originalText, setOriginalText,
      detectedEntities, setDetectedEntities,
      sanitizedText, setSanitizedText,
      entityMappings, setEntityMappings,
      logs, addLog,
      aiResponseText, setAiResponseText,
      restoredText, setRestoredText,
      isThreatSimulationMode, setIsThreatSimulationMode,
      excludedEntities, toggleEntityExclusion,
      clearAll
    }}>
      {children}
    </SentinelContext.Provider>
  );
}

export function useSentinel() {
  const context = useContext(SentinelContext);
  if (context === undefined) {
    throw new Error("useSentinel must be used within a SentinelProvider");
  }
  return context;
}
