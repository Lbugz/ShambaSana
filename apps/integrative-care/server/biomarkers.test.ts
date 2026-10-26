import test from "node:test";
import assert from "node:assert/strict";
import { observationSchema, resultHistory, resultChange, verifiedResults, type Observation, type LabSource } from "../shared/biomarkers";
const sources: LabSource[] = [
    { id: "lab", kind: "laboratory-results", title: "Fictional lab", status: "final", issuedAt: "2026-04-16T09:00:00Z" },
    { id: "order", kind: "requisition", title: "Fictional order", status: "requested", issuedAt: "2026-04-02T09:00:00Z" },
    { id: "review", kind: "practitioner-report", title: "Fictional review", status: "final", issuedAt: "2026-04-20T09:00:00Z" },
];
const row: Observation = observationSchema.parse({ id: "first", patientId: "fictional", markerId: "example", sourceId: "lab", sourcePage: 1, collectedAt: "2026-01-12T08:00:00Z", originalValue: "112", numericValue: 112, unit: "mg/dL", specimen: "serum", method: "example", origin: "measured", reference: { text: "Illustrative" }, labFlag: "unknown", verification: "verified", verifiedAt: "2026-01-16T09:00:00Z", status: "final" });
const current: Observation = { ...row, id: "second", collectedAt: "2026-04-13T08:00:00Z", originalValue: "96", numericValue: 96 };
test("source document roles do not create duplicate measurements", () => {
    assert.equal(verifiedResults([row, { ...row, id: "order-row", sourceId: "order" }, { ...row, id: "review-row", sourceId: "review" }], sources).length, 1);
});
test("unverified and superseded observations remain outside released history", () => {
    assert.equal(verifiedResults([row, { ...row, id: "pending", verification: "pending" }, { ...row, id: "old", status: "superseded" }, { ...row, id: "unconfirmed", verifiedAt: undefined }], sources).length, 1);
});
test("only compatible results from the same patient enter a trend", () => {
    const incompatible: Observation[] = [{ ...row, id: "other-unit", unit: "nmol/L" }, { ...row, id: "other-patient", patientId: "another" }, { ...row, id: "other-method", method: "different" }, { ...row, id: "other-specimen", specimen: "urine" }, { ...row, id: "derived", origin: "calculated" }];
    assert.deepEqual(resultHistory(current, [...incompatible, current, row], sources).map(r => r.id), ["first", "second"]);
});
test("comparison preserves absolute numeric difference without a health judgment", () => {
    assert.equal(resultChange(current, [current, row], sources)?.difference, -16);
});
test("inequalities and missing history do not create misleading numeric changes", () => {
    assert.equal(resultChange({ ...current, comparator: "<", originalValue: "<96" }, [row, { ...current, comparator: "<", originalValue: "<96" }], sources), undefined);
    assert.equal(resultChange(current, [current], sources), undefined);
    assert.equal(resultChange(current, [{ ...row, comparator: "<" }, current], sources), undefined);
});
