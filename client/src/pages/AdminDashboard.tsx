import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Activity, BrainCircuit, Search, Bell, Settings, 
  ChevronRight, FileText, Filter, Menu, UserCircle, Beaker, LogOut, CheckCircle2, Share2
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const { toast } = useToast();

  const [assessments, setAssessments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const loadPatients = () => {
      try {
        const savedAssessments = localStorage.getItem('mockAssessments');
        if (savedAssessments) {
          const parsed = JSON.parse(savedAssessments);
          // Convert assessments to unique patients
          const uniquePatients = parsed.map((a: any, idx: number) => ({
            id: a.id || idx,
            name: a.patient,
            email: a.patient.toLowerCase().replace(' ', '.') + '@example.com',
            status: a.status === "Pending Review" ? "Onboarding" : "Active",
            lastActive: a.date,
            alert: a.status === "Pending Review" ? "Review TCM Assessment" : ""
          }));
          
          // Use unique patients or fallback to empty array
          setPatients(uniquePatients);
        } else {
          setPatients([]);
        }
      } catch (e) {
        setPatients([]);
      }
    };

    loadPatients();
    window.addEventListener('storage', loadPatients);
    const interval = setInterval(loadPatients, 2000);

    return () => {
      window.removeEventListener('storage', loadPatients);
      clearInterval(interval);
    };
  }, []);

  // Load any mock submissions from local storage on mount
  useEffect(() => {
    const checkStorage = () => {
      try {
        const saved = localStorage.getItem('mockAssessments');
        if (saved) {
          setAssessments(JSON.parse(saved));
        } else {
          setAssessments([]); // If nothing saved, show empty state instead of mock data
        }
      } catch(e) {
        setAssessments([]);
      }
    };

    // Run once on mount
    checkStorage();

    window.addEventListener('storage', checkStorage);
    // Also poll every 2 seconds just in case the storage event doesn't fire in the iframe environment
    const interval = setInterval(checkStorage, 2000);

    return () => {
      window.removeEventListener('storage', checkStorage);
      clearInterval(interval);
    };
  }, []);

  const handleReviewClick = (assessment: any) => {
    setSelectedAssessment(assessment);
    setReviewModalOpen(true);
  };

  const handleApproveReport = () => {
    setReviewModalOpen(false);
    toast({
      title: "Report Approved",
      description: `Assessment for ${selectedAssessment?.patient} has been finalized.`,
    });
  };

  const SidebarContent = () => (
    <>
      <div className="p-8 pb-6">
        <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-emerald-400" />
          LifeRX
        </h2>
        <p className="text-emerald-400/60 text-xs tracking-[0.2em] uppercase mt-1">Clinical Portal</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Button variant="secondary" className="w-full justify-start font-medium text-base h-12 bg-white/10 text-white hover:bg-white/20 border border-white/5">
          <Activity className="mr-3 h-4 w-4" /> Overview
        </Button>
        <Button variant="ghost" className="w-full justify-start text-emerald-100/70 h-12 hover:text-white hover:bg-white/5">
          <Users className="mr-3 h-4 w-4" /> Patient Roster
        </Button>
        <Button variant="ghost" className="w-full justify-start text-emerald-100/70 h-12 hover:text-white hover:bg-white/5 relative">
          <FileText className="mr-3 h-4 w-4" /> TCM Assessments
          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-rose-500 text-white text-xs flex items-center justify-center rounded-full font-bold shadow-md">2</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-emerald-100/70 h-12 hover:text-white hover:bg-white/5">
          <Beaker className="mr-3 h-4 w-4" /> Lab Integrations
        </Button>
        <Button variant="ghost" className="w-full justify-start text-emerald-100/70 h-12 hover:text-white hover:bg-white/5">
          <UserCircle className="mr-3 h-4 w-4" /> Team Directory
        </Button>
        <Button variant="ghost" className="w-full justify-start text-emerald-100/70 h-12 hover:text-white hover:bg-white/5">
          <Settings className="mr-3 h-4 w-4" /> Portal Settings
        </Button>
      </nav>
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/20">
              <AvatarFallback className="bg-emerald-800 text-emerald-100 font-serif">DR</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-white">Dr. Sarah Chen</p>
              <p className="text-xs text-emerald-100/60">Lead Practitioner</p>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-emerald-100/40 group-hover:text-emerald-100 transition-colors" />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[hsl(38,35%,94%)] flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="w-72 hidden xl:flex flex-col bg-[hsl(161,67%,12%)] fixed h-full z-20 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 xl:ml-72 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="xl:hidden shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-[hsl(161,67%,12%)] border-none w-72">
                <div className="flex flex-col h-full">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patients, assessments, or labs..." className="pl-10 bg-white border-border/50 rounded-full h-10 w-[300px] lg:w-[400px] shadow-sm focus-visible:ring-primary/20" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
            </Button>
            <Link href="/">
               <Button variant="outline" size="sm" className="rounded-full hidden sm:flex border-border/50 shadow-sm text-muted-foreground hover:text-primary">Public Site</Button>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary mb-2">Good morning, Dr. Chen</h1>
              <p className="text-muted-foreground">You have <span className="font-bold text-foreground">{assessments.filter(a => a.status === 'Pending Review').length} patient assessments</span> pending your clinical review.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-3xl border-border shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col justify-center">
                  <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2 flex items-center gap-2">
                     <Users className="w-4 h-4 text-emerald-600" /> Active Patients
                  </p>
                  <div className="text-4xl font-serif font-bold text-primary">{patients.length}</div>
                  <p className="text-sm text-emerald-600 font-medium mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">+{patients.length} this month</p>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-border shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col justify-center">
                  <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2 flex items-center gap-2">
                     <FileText className="w-4 h-4 text-rose-500" /> Pending Review
                  </p>
                  <div className="text-4xl font-serif font-bold text-rose-500">{assessments.filter(a => a.status === 'Pending Review').length}</div>
                  <p className="text-sm text-muted-foreground mt-2">Requires practitioner output</p>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-border shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col justify-center">
                  <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2 flex items-center gap-2">
                     <Beaker className="w-4 h-4 text-amber-600" /> Lab Integrations
                  </p>
                  <div className="text-4xl font-serif font-bold text-primary">8</div>
                  <p className="text-sm text-amber-600 font-medium mt-2 bg-amber-50 w-fit px-2 py-0.5 rounded-md">2 new panels synced</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Assessments Review Queue */}
              <Card className="lg:col-span-2 rounded-3xl border-border shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-6 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-serif text-primary">Assessment Review Queue</CardTitle>
                    <CardDescription className="mt-1">Recently submitted TCM assessments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full shadow-sm text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/tcm-assessment?public=true`);
                        toast({
                          title: "Link Copied",
                          description: "Public assessment link copied to clipboard. Ready to paste in SMS/Email.",
                        });
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Generate Link
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full shadow-sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {assessments.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="font-medium">No pending assessments</p>
                        <p className="text-sm">Share the assessment link to get started</p>
                      </div>
                    ) : assessments.map((assessment) => (
                      <div key={assessment.id} className="p-6 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                            <BrainCircuit className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-foreground text-base">{assessment.patient}</h4>
                              <Badge variant={assessment.status === "Pending Review" ? "destructive" : "outline"} className="text-[10px] uppercase tracking-wider px-2 py-0">
                                {assessment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{assessment.type} • {assessment.date}</p>
                            <div className="flex flex-wrap items-center gap-2">
                               <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-medium">Pri: {assessment.primary}</Badge>
                               <Badge variant="outline" className="bg-[hsl(35,50%,95%)] text-[hsl(35,60%,30%)] border-[hsl(35,60%,80%)] shadow-sm font-medium">Sec: {assessment.secondary}</Badge>
                               <span className="text-xs font-semibold text-foreground px-2.5 py-1 bg-muted/80 rounded-md border border-border/50">{assessment.pattern}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="shrink-0 rounded-full shadow-md" 
                          variant={assessment.status === "Pending Review" ? "default" : "secondary"}
                          onClick={() => handleReviewClick(assessment)}
                        >
                          {assessment.status === "Pending Review" ? "Review Output" : "View Details"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Patient Roster */}
              <Card className="rounded-3xl border-border shadow-sm bg-white overflow-hidden flex flex-col">
                <CardHeader className="p-6 pb-4 border-b border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xl font-serif text-primary">Patient Roster</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Filter className="h-4 w-4" /></Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter patients..." className="pl-9 bg-muted/50 border-border/50 h-10 text-sm rounded-xl focus-visible:ring-primary/20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="divide-y divide-border/50 flex-1">
                    {patients.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                          <Users className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="font-medium">No active patients</p>
                      </div>
                    ) : patients.map((patient) => (
                      <div key={patient.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10 border border-border shadow-sm">
                             <AvatarFallback className="bg-[hsl(35,50%,95%)] text-primary font-bold text-sm">{patient.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                           </Avatar>
                           <div>
                             <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{patient.name}</h4>
                             <p className={`text-xs truncate max-w-[140px] font-medium ${patient.alert ? 'text-rose-500' : 'text-muted-foreground'}`}>
                               {patient.alert || `Last active: ${patient.lastActive}`}
                             </p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border/50 mt-auto bg-muted/10">
                     <Button variant="outline" className="w-full text-sm rounded-full bg-white shadow-sm hover:text-primary">View Full Directory</Button>
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>
        </div>

        {/* Assessment Review Modal */}
        <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-border">
            {selectedAssessment && (
              <>
                <DialogHeader className="p-6 border-b border-border/50 bg-primary/5">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={selectedAssessment.status === "Pending Review" ? "destructive" : "outline"} className="uppercase tracking-wider">
                      {selectedAssessment.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-medium">{selectedAssessment.date}</span>
                  </div>
                  <DialogTitle className="text-2xl font-serif text-primary">
                    Assessment Review: {selectedAssessment.patient}
                  </DialogTitle>
                  <DialogDescription className="text-base text-foreground/80">
                    {selectedAssessment.type} • System generated pattern impression
                  </DialogDescription>
                </DialogHeader>
                
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-border p-4 rounded-2xl shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Primary Element</p>
                      <p className="text-xl font-serif font-bold text-primary">{selectedAssessment.primary}</p>
                    </div>
                    <div className="bg-white border border-border p-4 rounded-2xl shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Secondary Element</p>
                      <p className="text-xl font-serif font-bold text-primary">{selectedAssessment.secondary}</p>
                    </div>
                  </div>

                  <div className="bg-[hsl(35,50%,95%)] border border-[hsl(35,50%,90%)] p-6 rounded-2xl">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" /> AI Pattern Impression
                    </p>
                    <h3 className="text-2xl font-bold text-primary mb-2">{selectedAssessment.pattern}</h3>
                    <p className="text-foreground/80">
                      Based on the intake responses, {selectedAssessment.patient}'s system is primarily leaning towards {selectedAssessment.primary}. 
                      The specific symptom cluster strongly indicates {selectedAssessment.pattern.toLowerCase()}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground">Practitioner Clinical Notes</h4>
                    <textarea 
                      className="w-full min-h-[100px] p-4 rounded-xl border border-border/50 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                      placeholder="Add your clinical observations, tongue/pulse notes, or adjustments to the generated pattern here before approving the report for the patient..."
                    ></textarea>
                  </div>
                </div>

                <DialogFooter className="p-6 border-t border-border/50 bg-muted/20 sm:justify-between items-center">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                    Request Follow-up Info
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleApproveReport} className="shadow-md">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Generate Report
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}