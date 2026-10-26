import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CareLayout, ErrorMessage } from "@/components/CareLayout";
import { IntakeJourney } from "@/components/IntakeJourney";
import { useAuth, useCase, useCaseAction, hashParams, uploadDocument } from "@/lib/care";
export default function TcmAssessment(){
  const auth=useAuth("customer");
  const [,navigate]=useLocation();
  const id=hashParams().get("case")||"";
  const query=useCase(id,auth.user?.role==="customer");
  const action=useCaseAction(id);
  const c=query.data;
  if(auth.isLoading)return <p className="p-10">Loading your intake…</p>;
  if(!id)return <CareLayout><h1 className="text-3xl">Choose a care episode first</h1><p className="my-5 text-sm">Your intake belongs to your private care record.</p><Button onClick={()=>navigate("/dashboard")}>Go to my care</Button></CareLayout>;
  if(!c)return <CareLayout><ErrorMessage error={query.error}/>{!query.error && <p>Loading your saved intake…</p>}</CareLayout>;
  if(c.payment.status==="pending"||c.reports.length)return <CareLayout><h1 className="text-3xl">{c.reports.length?"Your case has an approved report":"Complete enrollment first"}</h1><Button className="mt-6" onClick={()=>navigate("/dashboard")}>Return to my care</Button></CareLayout>;
  return <CareLayout><IntakeJourney key={id} initial={c.intake} documents={c.documents} documentUrl={documentId=>`/api/cases/${id}/documents/${documentId}`} onExit={()=>navigate("/dashboard")} onSave={async(intake,submit)=>{await action.mutateAsync({path:"/intake",method:"PUT",body:{revision:c.revision,intake,submit}});}} onUpload={async(file)=>{await action.mutateAsync({path:"/documents",body:await uploadDocument(file,"tongue",c.revision)});}}/></CareLayout>;
}
