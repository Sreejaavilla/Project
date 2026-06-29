import React from 'react';
import { EntityMatch } from '@/lib/piiDetector';

const TYPE_COLORS: Record<string, string> = {
  PERSON: "text-emerald-400 bg-emerald-400/20 border-emerald-400/30",
  EMAIL: "text-blue-400 bg-blue-400/20 border-blue-400/30",
  PHONE: "text-yellow-400 bg-yellow-400/20 border-yellow-400/30",
  FINANCIAL: "text-purple-400 bg-purple-400/20 border-purple-400/30",
  ID: "text-red-400 bg-red-400/20 border-red-400/30",
  AADHAAR: "text-red-400 bg-red-400/20 border-red-400/30",
  PAN: "text-red-400 bg-red-400/20 border-red-400/30",
  MEDICAL: "text-pink-400 bg-pink-400/20 border-pink-400/30",
  ADDRESS: "text-orange-400 bg-orange-400/20 border-orange-400/30",
};

interface Props {
  text: string;
  entities: EntityMatch[];
}

export default function EntityHighlighter({ text, entities }: Props) {
  if (!entities.length) return <>{text}</>;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  entities.forEach((entity, idx) => {
    if (entity.startIndex > lastIndex) {
      elements.push(<span key={`text-${idx}`}>{text.substring(lastIndex, entity.startIndex)}</span>);
    }
    
    const colorClass = TYPE_COLORS[entity.type] || "text-foreground bg-muted border-border";
    
    elements.push(
      <span key={`ent-${idx}`} className={`relative inline-block border rounded px-1 py-0.5 mx-0.5 group cursor-default ${colorClass}`}>
        <span className="absolute -top-4 left-0 text-[8px] uppercase tracking-wider font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background px-1 rounded z-10">
          {entity.type} ({(entity.confidence * 100).toFixed(0)}%)
        </span>
        {entity.value}
      </span>
    );
    
    lastIndex = entity.endIndex;
  });

  if (lastIndex < text.length) {
    elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
  }

  return <div className="whitespace-pre-wrap leading-relaxed">{elements}</div>;
}
