import { useRef, useState } from "react";
import { FileText, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { ErrorMessage } from "./CareLayout";
import { uploadIssue } from "@shared/client-journey";
import { documentLabels } from "@shared/care-review";
import type { CareCase, Document } from "@shared/care";

type Kind = NonNullable<Document["kind"]>;
export function LabDocuments({c,busy,onUpload,onRemove}:{c:CareCase;busy:boolean;onUpload:(file:File,kind?:Kind)=>Promise<void>;onRemove:(id:string)=>Promise<void>}) {
  const [file,setFile] = useState<File>();
  const [kind,setKind] = useState<Kind|"">("");
  const [error,setError] = useState<unknown>();
  const [uploading,setUploading] = useState(false);
  const [removing,setRemoving] = useState("");
  const [confirmRemove,setConfirmRemove] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const documents = c.documents.filter(d=>d.purpose==="lab");
  const locked = !!c.reports.length || !["paid","unpaid-pilot"].includes(c.payment.status);
  const working = busy || uploading || !!removing;
  async function upload() {
    if (!file) return;
    setError(undefined); setUploading(true);
    try { await onUpload(file,kind || undefined);setFile(undefined);setKind("");if(input.current)input.current.value=""; }
    catch(e){setError(e);} finally {setUploading(false);}
  }
  async function remove(id:string) {
    setError(undefined);setRemoving(id);
    try{await onRemove(id);setConfirmRemove("");}catch(e){setError(e);}finally{setRemoving("");}
  }
  return <section aria-labelledby="lab-documents-heading" className="space-y-5">
    <div><h2 id="lab-documents-heading" className="text-2xl">Your lab documents</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">Include all pages of the original results with your name, collection date, units and laboratory ranges. Orders and previous interpretations can be added as supporting documents.</p></div>
    <ErrorMessage error={error}/>
    {!locked && <div className="rounded-2xl border border-dashed border-primary/30 bg-card p-5 sm:p-7" aria-busy={uploading}>
      <Upload aria-hidden="true" className="mb-4 h-6 w-6 text-primary"/><h3 className="text-xl">Add a document</h3><p id="upload-help" className="my-3 text-xs leading-6 text-muted-foreground">PDF, JPG, PNG or WebP: up to 5 MB. TXT or CSV: up to 512 KB. Maximum 12 documents per episode, including photos.</p>
      <input ref={input} id="lab-upload" aria-label="Choose lab document" aria-describedby="upload-help" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv" disabled={working || c.documents.length>=12} className="sr-only" onChange={e=>{setError(undefined);const next=e.target.files?.[0];if(!next)return;const issue=uploadIssue(next);if(issue){setFile(undefined);e.target.value="";setError(new Error(issue));return;}setFile(next);}}/>
      <Button variant="outline" className="min-h-12" disabled={working || c.documents.length>=12} onClick={()=>input.current?.click()}>{file?"Choose a different file":"Choose a file"}</Button>
      {c.documents.length>=12 && <p className="mt-3 text-sm">Document limit reached. Remove an unneeded document before adding another.</p>}
      {file && <div className="mt-5 space-y-4 rounded-xl bg-secondary/30 p-4"><p className="break-words text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{Math.max(1,Math.ceil(file.size/1024))} KB · Selected, not uploaded</p>{documents.some(d=>d.name===file.name && d.size===file.size) && <p className="text-sm">A file with this name and size is already in this episode. Check the list below before uploading another copy.</p>}
      <fieldset disabled={working}><legend className="mb-3 text-sm font-medium">What are you adding?</legend><div className="grid gap-2 sm:grid-cols-2">{(["laboratory-results","requisition","practitioner-report",""] as const).map(value=><button key={value} type="button" aria-pressed={kind===value} className={`min-h-12 rounded-xl border px-3 py-3 text-left text-sm ${kind===value?"border-primary bg-secondary":"border-border bg-card"}`} onClick={()=>setKind(value)}>{value?documentLabels[value]:"Not sure — let my practitioner review"}</button>)}</div></fieldset>
      <p className="text-xs leading-6 text-muted-foreground">Your practitioner still checks the document and verifies results. Uploading does not generate an assessment.</p>
      <div className="flex flex-wrap gap-3"><Button disabled={working} className="min-h-12" onClick={upload}>{uploading && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin"/>}{uploading?"Uploading document…":"Upload selected file"}</Button><Button variant="ghost" disabled={working} className="min-h-12" onClick={()=>{setFile(undefined);if(input.current)input.current.value="";}}>Cancel selection</Button></div></div>}
    </div>}
    {!documents.length ? <p className="rounded-xl border border-border p-5 text-sm text-muted-foreground">No lab documents yet. Add existing results above, or request help with testing below.</p> : <ul className="space-y-3">{documents.map(d=><li key={d.id} className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex items-start gap-3"><FileText aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary"/><div className="min-w-0 flex-1"><a className="inline-flex min-h-11 max-w-full items-center break-all text-sm font-medium underline underline-offset-4" href={`/api/cases/${c.id}/documents/${d.id}`}>{d.name}</a><p className="mt-2 text-xs leading-6 text-muted-foreground">{d.kind?documentLabels[d.kind]:"Document type awaiting review"} · {Math.max(1,Math.ceil(d.size/1024))} KB</p><p className="mt-1 text-xs leading-6">{d.kind && d.kind!=="laboratory-results"?"Supporting context · does not supply lab measurements":d.verifiedAt?"Results verified by your practitioner":"Received · awaiting practitioner verification"}</p></div>{!locked && <Button aria-label={`Remove ${d.name}`} variant="ghost" className="min-h-11 shrink-0 px-2" disabled={working} onClick={()=>setConfirmRemove(d.id)}><Trash2 aria-hidden="true" className="h-4 w-4"/></Button>}</div>{confirmRemove===d.id && <div className="mt-4 rounded-xl bg-secondary/40 p-4"><p className="text-sm leading-6">Remove this document? Its verified results will also be removed and any assessment draft will need to be prepared again. You can upload the original again.</p><div className="mt-3 flex flex-wrap gap-3"><Button variant="outline" disabled={working} className="min-h-11" onClick={()=>remove(d.id)}>{removing===d.id?"Removing…":"Confirm removal"}</Button><Button variant="ghost" disabled={working} className="min-h-11" onClick={()=>setConfirmRemove("")}>Keep document</Button></div></div>}</li>)}</ul>}
  </section>;
}
