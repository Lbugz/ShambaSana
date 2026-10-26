import type { LabSource, Observation } from "@shared/biomarkers";
// Entirely invented examples. No patient values, identifiers, dates, source files,
// recommendations or proprietary practitioner targets were copied into this data.
export const sampleSources: LabSource[] = [
    { id: "sample-order", kind: "requisition", title: "Sample laboratory order", status: "requested", issuedAt: "2026-04-02T09:00:00Z" },
    { id: "sample-baseline", kind: "laboratory-results", title: "Baseline laboratory results", status: "final", issuedAt: "2026-01-15T09:00:00Z" },
    { id: "sample-followup", kind: "laboratory-results", title: "Follow-up laboratory results", status: "final", issuedAt: "2026-04-16T09:00:00Z" },
    { id: "sample-review", kind: "practitioner-report", title: "Sample practitioner review", status: "final", issuedAt: "2026-04-20T09:00:00Z" },
];
export const sampleMarkers = [
    { id: "apob", name: "Apolipoprotein B", short: "ApoB", category: "Heart", unit: "mg/dL", values: [112, 96], range: [0, 90], origin: "measured", description: "A protein carried by certain cholesterol-containing particles. Your practitioner considers it alongside other results and your health history." },
    { id: "ldl", name: "LDL cholesterol", short: "LDL-C", category: "Heart", unit: "mg/dL", values: [142, 128], range: [0, 100], origin: "calculated", description: "A cholesterol measurement that may be calculated from other lipid results. Calculation methods and clinical context matter when comparing reports." },
    { id: "hdl", name: "HDL cholesterol", short: "HDL-C", category: "Heart", unit: "mg/dL", values: [49, 52], range: [40, 100], origin: "measured", description: "One component of a lipid panel. A single result is interpreted alongside the wider cardiovascular picture." },
    { id: "triglycerides", name: "Triglycerides", short: "Triglycerides", category: "Heart", unit: "mg/dL", values: [164, 137], range: [0, 150], origin: "measured", description: "Fats measured in the blood. Meals, sample preparation and other factors can influence results." },
    { id: "a1c", name: "Hemoglobin A1c", short: "HbA1c", category: "Metabolic", unit: "%", values: [5.8, 5.6], range: [4, 5.6], origin: "measured", description: "A measure used to estimate average blood glucose over time. Your practitioner considers conditions that may affect its interpretation." },
    { id: "glucose", name: "Glucose", short: "Glucose", category: "Metabolic", unit: "mg/dL", values: [104, 97], range: [70, 99], origin: "measured", description: "Blood glucose at the time the sample was taken. Fasting status and collection context belong with the result." },
    { id: "tsh", name: "Thyroid-stimulating hormone", short: "TSH", category: "Thyroid", unit: "mIU/L", values: [3.1, 2.8], range: [0.4, 4.5], origin: "measured", description: "A hormone involved in signaling the thyroid. Interpretation depends on symptoms, medications and other thyroid findings." },
    { id: "alt", name: "Alanine aminotransferase", short: "ALT", category: "Liver & kidney", unit: "U/L", values: [31, 26], range: [9, 46], origin: "measured", description: "An enzyme considered with other findings when reviewing liver health. Changes alone do not identify a cause." },
    { id: "creatinine", name: "Creatinine", short: "Creatinine", category: "Liver & kidney", unit: "mg/dL", values: [1.14, 1.09], range: [0.7, 1.3], origin: "measured", description: "A marker used in assessing kidney filtration. Muscle mass, hydration and other factors can influence its interpretation." },
    { id: "hemoglobin", name: "Hemoglobin", short: "Hemoglobin", category: "Blood", unit: "g/dL", values: [14.2, 14.5], range: [13.2, 17.1], origin: "measured", description: "The oxygen-carrying protein in red blood cells. It is considered with the rest of the blood count and relevant history." },
] as const;
export const sampleObservations: Observation[] = sampleMarkers.flatMap((marker, index) => marker.values.map((value, i) => ({
    id: `${marker.id}-${i}`, patientId: "fictional-example", markerId: marker.id,
    sourceId: i ? "sample-followup" : "sample-baseline", sourcePage: Math.floor(index / 4) + 1,
    collectedAt: i ? "2026-04-13T08:00:00Z" : "2026-01-12T08:00:00Z",
    originalValue: String(value), numericValue: value, comparator: "=" as const, unit: marker.unit,
    specimen: "serum-or-whole-blood-example", method: `example-${marker.id}`, origin: marker.origin,
    reference: { text: `${marker.range[0]}–${marker.range[1]}`, low: marker.range[0], high: marker.range[1] },
    labFlag: value > marker.range[1] ? "high" as const : value < marker.range[0] ? "low" as const : "normal" as const,
    verification: "verified" as const, verifiedAt: i ? "2026-04-19T09:00:00Z" : "2026-01-16T09:00:00Z", status: "final" as const,
})));
export const latestSamples = sampleObservations.filter(r => r.sourceId === "sample-followup");
