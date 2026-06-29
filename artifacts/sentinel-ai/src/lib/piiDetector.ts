export interface EntityMatch {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  placeholder: string;
}

const COMMON_NAMES = [
  "John", "Jane", "Alice", "Bob", "Michael", "Sarah", "David", "Emily", "James", "Emma",
  "Robert", "Olivia", "William", "Sophia", "Joseph", "Isabella", "Thomas", "Mia",
  "Charles", "Charlotte", "Amelia", "Watson", "Doe", "Smith", "Johnson", "Williams", "Brown", "Jones"
];

const PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g,
  FINANCIAL: /(?:salary|income|revenue|account balance)[\s:]*[\$€£₹]?[\d,]+(?:\.\d{2})?|[\$€£₹][\d,]+(?:\.\d{2})?|USD\s*[\d,]+(?:\.\d{2})?/gi,
  AADHAAR: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  PAN: /\b[A-Z]{5}\d{4}[A-Z]{1}\b/g,
  MEDICAL: /\b(?:diagnosis|prescription|blood type|medication|disease|illness|syndrome|mellitus|metformin|diabetes)\b/gi,
  ADDRESS: /\b\d{1,5}\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Terrace|Drive|Dr|Court|Ct|Circle|Cir)\b|[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/gi,
};

export function detectEntities(text: string): EntityMatch[] {
  const matches: EntityMatch[] = [];
  const typeCounts: Record<string, number> = {};

  const getPlaceholder = (type: string) => {
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    return `[${type}_${typeCounts[type]}]`;
  };

  const addMatch = (type: string, match: RegExpExecArray | { index: number; [0]: string }) => {
    const value = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + value.length;
    // Prevent overlapping matches
    if (!matches.some(m => Math.max(startIndex, m.startIndex) < Math.min(endIndex, m.endIndex))) {
      matches.push({
        type,
        value,
        startIndex,
        endIndex,
        confidence: 0.8 + Math.random() * 0.19,
        placeholder: getPlaceholder(type)
      });
    }
  };

  // Find patterns
  Object.entries(PATTERNS).forEach(([type, regex]) => {
    let match;
    const re = new RegExp(regex);
    while ((match = re.exec(text)) !== null) {
      addMatch(type, match);
    }
  });

  // Simple Person detection
  const personRegex = /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g;
  let pMatch;
  while ((pMatch = personRegex.exec(text)) !== null) {
    addMatch("PERSON", pMatch);
  }

  // Very naive name extraction from prefixes like "Patient:"
  const namePrefixRegex = /(?:Patient|Name|Employee):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  let npMatch;
  while ((npMatch = namePrefixRegex.exec(text)) !== null) {
    if (npMatch[1]) {
      addMatch("PERSON", { index: npMatch.index + npMatch[0].indexOf(npMatch[1]), 0: npMatch[1] });
    }
  }

  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

export function sanitizeText(text: string, entities: EntityMatch[], excluded: Set<string>): { sanitized: string, mappings: Map<string, string> } {
  let result = text;
  const mappings = new Map<string, string>();
  
  // Replace from end to start to not mess up indices
  const sorted = [...entities].sort((a, b) => b.startIndex - a.startIndex);
  
  for (const entity of sorted) {
    if (!excluded.has(entity.placeholder)) {
      result = result.substring(0, entity.startIndex) + entity.placeholder + result.substring(entity.endIndex);
      mappings.set(entity.placeholder, entity.value);
    }
  }
  
  return { sanitized: result, mappings };
}

export function restoreText(text: string, mappings: Map<string, string>): string {
  let result = text;
  mappings.forEach((originalValue, placeholder) => {
    // Escape placeholder for regex
    const escaped = placeholder.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    result = result.replace(regex, originalValue);
  });
  return result;
}
