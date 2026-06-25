import { parseVoiceEntry } from "./voiceParse";
import type { Vehicle } from "./api";

/* ---------------------------------------------------------------------------
   Voice / NLP extraction evaluation.

   This runs the REAL voice parser (voiceParse.ts) over a small set of
   hand-labelled example sentences and computes Precision / Recall / F1 on the
   extracted fields. It is a genuine (if small) sample evaluation, not made-up
   numbers — but it is still clearly labelled as a sample.

   Counting (per field, per example):
     - expected present & predicted == expected         -> true positive
     - expected present & predicted missing/wrong       -> false negative
     - predicted present but wrong/unexpected           -> false positive
--------------------------------------------------------------------------- */

const FIELDS = [
  "vehicleId",
  "entryType",
  "serviceType",
  "category",
  "serviceDate",
  "motDueDate",
  "amount",
  "status",
] as const;
type Field = (typeof FIELDS)[number];

// Synthetic vehicles so the test is self-contained and deterministic.
const TEST_VEHICLES = [
  { id: "v1", brandName: "Ford", model: "Focus", registrationNumber: "AB12 CDE" },
  { id: "v2", brandName: "BMW", model: "3 Series", registrationNumber: "ZZ99 ZZZ" },
  { id: "v3", brandName: "Tesla", model: "Model 3", registrationNumber: "EV23 TST" },
] as unknown as Vehicle[];

interface ExampleSpec {
  transcript: string;
  expected: Partial<Record<Field, string>>;
}

const EXAMPLES: ExampleSpec[] = [
  {
    transcript: "Oil change for Ford Focus on 12 May 2024, amount 120 pounds, status done",
    expected: { vehicleId: "v1", entryType: "Service", serviceType: "Oil Change", serviceDate: "2024-05-12", amount: "120", status: "Done" },
  },
  {
    transcript: "Full service for BMW 3 Series on 12/05/2024 cost 199 status done, brakes",
    expected: { vehicleId: "v2", entryType: "Service", serviceType: "Full Service", category: "Brakes", serviceDate: "2024-05-12", amount: "199", status: "Done" },
  },
  {
    transcript: "MOT test for AB12 CDE on 2024-05-12, mot due 11 May 2025, amount 54.85, done",
    expected: { vehicleId: "v1", entryType: "MOT", serviceType: "MOT Test", serviceDate: "2024-05-12", motDueDate: "2025-05-11", amount: "54.85", status: "Done" },
  },
  {
    transcript: "Brake pad replacement for Tesla Model 3, status pending",
    expected: { vehicleId: "v3", entryType: "Service", serviceType: "Brake Pad Replacement", status: "Pending" },
  },
  {
    transcript: "Repair for Ford Focus on 5 June 2025 amount 75 pounds",
    expected: { vehicleId: "v1", entryType: "Repair", serviceDate: "2025-06-05", amount: "75" },
  },
];

export interface EvalFieldRow {
  field: Field;
  expected: string;
  got: string;
  correct: boolean;
}

export interface EvalCase {
  transcript: string;
  rows: EvalFieldRow[];
}

export interface VoiceEvalResult {
  cases: EvalCase[];
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
}

export function runVoiceEvaluation(): VoiceEvalResult {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  const cases: EvalCase[] = [];

  for (const ex of EXAMPLES) {
    const got = parseVoiceEntry(ex.transcript, TEST_VEHICLES) as unknown as Record<
      string,
      string | undefined
    >;
    const rows: EvalFieldRow[] = [];

    for (const field of FIELDS) {
      const expected = ex.expected[field];
      const predicted = got[field];

      if (expected != null) {
        if (predicted === expected) tp++;
        else {
          fn++;
          if (predicted != null) fp++;
        }
        rows.push({
          field,
          expected,
          got: predicted ?? "—",
          correct: predicted === expected,
        });
      } else if (predicted != null) {
        fp++; // extracted something we didn't expect
      }
    }

    cases.push({ transcript: ex.transcript, rows });
  }

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return { cases, tp, fp, fn, precision, recall, f1 };
}
