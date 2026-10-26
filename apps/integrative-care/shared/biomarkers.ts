import { z } from "zod";
// A document is evidence, not a new measurement. Requisitions and interpretation
// reports must never create another observation for the same laboratory result.
export const labSourceSchema = z.object({
    id: z.string().min(1),
    kind: z.enum(["requisition", "laboratory-results", "practitioner-report"]),
    title: z.string().min(1),
    status: z.enum(["requested", "partial", "final", "corrected"]),
    issuedAt: z.string().datetime(),
});
export const observationSchema = z.object({
    id: z.string().min(1), patientId: z.string().min(1), markerId: z.string().min(1),
    sourceId: z.string().min(1), sourcePage: z.number().int().positive(),
    collectedAt: z.string().datetime(),
    originalValue: z.string().min(1), numericValue: z.number().finite().optional(),
    comparator: z.enum(["=", "<", "<=", ">", ">="]).default("="),
    unit: z.string(), specimen: z.string().min(1), method: z.string().min(1),
    origin: z.enum(["measured", "calculated"]),
    reference: z.object({ text: z.string(), low: z.number().optional(), high: z.number().optional() }),
    labFlag: z.enum(["normal", "high", "low", "critical", "unknown"]),
    verification: z.enum(["pending", "verified"]), verifiedAt: z.string().datetime().optional(),
    status: z.enum(["final", "corrected", "superseded"]),
});
export type LabSource = z.infer<typeof labSourceSchema>;
export type Observation = z.infer<typeof observationSchema>;
export function verifiedResults(rows: Observation[], sources: LabSource[]) {
    const laboratorySources = new Set(sources.filter(s => s.kind === "laboratory-results").map(s => s.id));
    return rows.filter(r => laboratorySources.has(r.sourceId) && r.verification === "verified" && !!r.verifiedAt && r.status !== "superseded");
}
export function resultHistory(current: Observation, rows: Observation[], sources: LabSource[]) {
    return verifiedResults(rows, sources).filter(r => r.patientId === current.patientId && r.markerId === current.markerId
        && r.unit === current.unit && r.specimen === current.specimen && r.method === current.method && r.origin === current.origin)
        .sort((a, b) => a.collectedAt.localeCompare(b.collectedAt));
}
export function resultChange(current: Observation, rows: Observation[], sources: LabSource[]) {
    const history = resultHistory(current, rows, sources);
    if (!history.some(r => r.id === current.id))
        return undefined;
    const previous = history.filter(r => r.collectedAt < current.collectedAt).at(-1);
    // An inequality is not an exact measurement and must not create a false delta.
    if (!previous || current.comparator !== "=" || previous.comparator !== "=" || current.numericValue === undefined || previous.numericValue === undefined)
        return undefined;
    return { previous, difference: Number((current.numericValue - previous.numericValue).toPrecision(10)) };
}
