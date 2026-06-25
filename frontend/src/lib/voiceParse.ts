import { parseFlexibleDate } from "./dates";
import { ENTRY_TYPES, SERVICE_TYPES, CATEGORIES } from "../data/serviceData";
import type { Vehicle } from "./api";

/* ---------------------------------------------------------------------------
   Rule-based extraction of entry fields from spoken text.

   This is deliberately simple (no AI service, no API keys). It scans the
   transcript for known service types, categories, statuses, vehicles, dates
   and an amount, using the same lists and date utilities as the rest of the app.

   It never saves anything — it only suggests values for the form, which the
   user then reviews and corrects before pressing Save.
--------------------------------------------------------------------------- */

export interface VoiceExtraction {
  transcript: string;
  vehicleId?: string;
  entryType?: string;
  serviceType?: string;
  category?: string;
  serviceDate?: string; // ISO "YYYY-MM-DD"
  motDueDate?: string; // ISO, kept separate
  amount?: string;
  status?: string;
  notes?: string;
  missing: string[]; // friendly names of fields we couldn't find
}

const MONTHS_RE =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t)?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

const DATE_PATTERNS: RegExp[] = [
  /\b\d{4}-\d{1,2}-\d{1,2}\b/, // ISO 2024-05-12
  /\b\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}\b/, // 12/05/2024
  new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s+${MONTHS_RE}\\.?\\s+\\d{2,4}\\b`, "i"), // 12 May 2024
  new RegExp(`\\b${MONTHS_RE}\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{2,4}\\b`, "i"), // May 12 2024
];

/** Find the earliest date-like substring in the text. */
function findDate(text: string): { raw: string; index: number } | null {
  let best: { raw: string; index: number } | null = null;
  for (const re of DATE_PATTERNS) {
    const m = re.exec(text);
    if (m && (best === null || m.index < best.index)) {
      best = { raw: m[0], index: m.index };
    }
  }
  return best;
}

/** Strip ordinal suffixes (12th -> 12) so the date parser can read it. */
function cleanDate(raw: string): string {
  return raw.replace(/(\d{1,2})(st|nd|rd|th)/gi, "$1");
}

export function parseVoiceEntry(rawTranscript: string, vehicles: Vehicle[]): VoiceExtraction {
  const transcript = rawTranscript.trim();
  const lower = transcript.toLowerCase();
  const result: VoiceExtraction = { transcript, missing: [] };

  // --- MOT due date (kept separate). Look for "mot ... due/expiry" + a date.
  let motRaw: string | null = null;
  const motPhrase = /m\.?o\.?t\.?[^.]{0,20}?(due|expiry|expires?|expire)/i.exec(transcript);
  if (motPhrase) {
    const after = transcript.slice(motPhrase.index);
    const d = findDate(after);
    if (d) {
      const iso = parseFlexibleDate(cleanDate(d.raw));
      if (iso) {
        result.motDueDate = iso;
        motRaw = d.raw;
      }
    }
  }

  // --- Service date = first date that isn't the MOT date.
  let working = transcript;
  if (motRaw) working = working.replace(motRaw, " ");
  const sd = findDate(working);
  if (sd) {
    const iso = parseFlexibleDate(cleanDate(sd.raw));
    if (iso) result.serviceDate = iso;
  }

  // --- Service type (longest match wins). Then a few spoken synonyms.
  const sortedTypes = [...SERVICE_TYPES].sort((a, b) => b.length - a.length);
  for (const t of sortedTypes) {
    if (lower.includes(t.toLowerCase())) {
      result.serviceType = t;
      break;
    }
  }
  if (!result.serviceType) {
    if (/\bm\.?o\.?t\b/.test(lower)) result.serviceType = "MOT Test";
    else if (/\bfull service\b|\bservice\b/.test(lower)) result.serviceType = "Full Service";
    else if (/\boil\b/.test(lower)) result.serviceType = "Oil Change";
  }

  // --- Entry type.
  if (/\binsurance\b/.test(lower)) result.entryType = "Insurance";
  else if (/\broad tax\b|\bcar tax\b|\bvehicle tax\b/.test(lower)) result.entryType = "Road Tax";
  else if (/\brepair\b/.test(lower)) result.entryType = "Repair";
  else if (/\bm\.?o\.?t\b/.test(lower)) result.entryType = "MOT";
  else if (result.serviceType) result.entryType = "Service";
  // Only use a known value.
  if (result.entryType && !ENTRY_TYPES.includes(result.entryType)) result.entryType = undefined;

  // --- Category (skip generic catch-all categories).
  const skipCats = new Set(["Other", "Other Equipment", "General Defect"]);
  const sortedCats = [...CATEGORIES].filter((c) => !skipCats.has(c)).sort((a, b) => b.length - a.length);
  for (const c of sortedCats) {
    if (lower.includes(c.toLowerCase())) {
      result.category = c;
      break;
    }
  }

  // --- Vehicle: by registration, then brand + model, then brand only.
  const compact = lower.replace(/\s+/g, "");
  for (const v of vehicles) {
    const reg = v.registrationNumber.toLowerCase().replace(/\s+/g, "");
    if (reg && compact.includes(reg)) {
      result.vehicleId = v.id;
      break;
    }
  }
  if (!result.vehicleId) {
    for (const v of vehicles) {
      if (lower.includes(v.brandName.toLowerCase()) && lower.includes(v.model.toLowerCase())) {
        result.vehicleId = v.id;
        break;
      }
    }
  }
  if (!result.vehicleId) {
    for (const v of vehicles) {
      if (lower.includes(v.brandName.toLowerCase())) {
        result.vehicleId = v.id;
        break;
      }
    }
  }

  // --- Amount (search text with the dates removed, so years aren't misread).
  let amtText = lower;
  [sd?.raw, motRaw].forEach((r) => {
    if (r) amtText = amtText.replace(r.toLowerCase(), " ");
  });
  const amtMatch =
    amtText.match(/£\s*(\d+(?:\.\d{1,2})?)/) ||
    amtText.match(/(\d+(?:\.\d{1,2})?)\s*(?:pounds?|quid|gbp)\b/) ||
    amtText.match(/\b(?:amount|cost|costs|price|paid|charge[ds]?|fee)\b\s*(?:of|was|is|:)?\s*£?\s*(\d+(?:\.\d{1,2})?)/);
  if (amtMatch) result.amount = amtMatch[1];

  // --- Status.
  if (/\b(done|completed?|finished)\b/.test(lower)) result.status = "Done";
  else if (/\boverdue\b/.test(lower)) result.status = "Overdue";
  else if (/\bpending\b/.test(lower)) result.status = "Pending";
  else if (/\bcancel(?:l)?ed\b/.test(lower)) result.status = "Cancelled";
  else if (/\bdue\b/.test(lower)) result.status = "Due";

  // --- Notes (text after a "notes"/"fault" keyword).
  const notesMatch = transcript.match(/\b(?:notes?|fault|description|comment)s?\b[:\s-]*(.+)$/i);
  if (notesMatch && notesMatch[1].trim()) result.notes = notesMatch[1].trim();

  // --- Missing information the user should add manually.
  if (!result.serviceDate) result.missing.push("Service Date");
  if (!result.amount) result.missing.push("Amount");

  return result;
}
