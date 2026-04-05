import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUp, ArrowDown, Download, Calendar, Pill, Leaf, Activity, Droplets, Wind, Sparkles, Menu, BookOpen, BrainCircuit } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link } from "wouter";

const mockTrendData = [
  { month: 'Jan', value: 20 },
  { month: 'Mar', value: 45 },
  { month: 'May', value: 35 },
  { month: 'Jul', value: 60 },
  { month: 'Sep', value: 55 },
  { month: 'Nov', value: 80 },
];

const mockTCMData = [
  { name: 'Qi', level: 60, fill: "var(--color-accent-qi)" },
  { name: 'Blood', level: 40, fill: "var(--color-accent-blood)" },
  { name: 'Yin', level: 30, fill: "var(--color-chart-4)" },
  { name: 'Yang', level: 70, fill: "var(--color-chart-5)" },
];

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
        <div className="p-8">
          <h2 className="text-3xl font-serif font-bold text-primary flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
               <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
            LifeRX
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start font-medium text-base h-12 bg-primary/5 text-primary">
            <Activity className="mr-3 h-4 w-4" /> Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground h-12 hover:text-primary hover:bg-primary/5">
            <Droplets className="mr-3 h-4 w-4" /> Lab Results
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground h-12 hover:text-primary hover:bg-primary/5">
            <Wind className="mr-3 h-4 w-4" /> TCM Insights
          </Button>
          <Link href="/tcm-assessment">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground h-12 hover:text-primary hover:bg-primary/5">
              <BrainCircuit className="mr-3 h-4 w-4" /> Take Assessment
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground h-12 hover:text-primary hover:bg-primary/5">
            <Sparkles className="mr-3 h-4 w-4" /> My Protocol
          </Button>
          <Link href="/formula-library">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground h-12 hover:text-primary hover:bg-primary/5">
              <BookOpen className="mr-3 h-4 w-4" /> Formula Library
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground h-12 hover:text-primary hover:bg-primary/5">
            <Calendar className="mr-3 h-4 w-4" /> Appointments
          </Button>
        </nav>
        <div className="p-6 border-t border-border/50">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
            </Avatar>
            <div>
               <p className="text-sm font-bold text-primary">John Doe</p>
               <p className="text-xs text-muted-foreground">Premium Member</p>
            </div>
          </div>
        </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="w-72 border-r border-border hidden md:flex flex-col bg-white/50 backdrop-blur-md fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-white/95 backdrop-blur-xl w-72">
                <div className="flex flex-col h-full">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">Welcome back, John</h1>
              <p className="text-muted-foreground text-base md:text-lg">Your Qi levels are rising. Here's your latest snapshot.</p>
            </div>
          </div>
          <Button className="hidden sm:flex rounded-full px-6 shadow-md bg-primary text-white hover:bg-primary/90">
             <Calendar className="mr-2 h-4 w-4" /> Schedule Follow-up
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
           {/* Key Stats */}
           <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Health Score</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-5xl font-serif font-bold text-primary mb-2">82<span className="text-xl text-muted-foreground font-sans font-normal ml-1">/100</span></div>
               <p className="text-sm text-emerald-700 font-medium flex items-center bg-emerald-100/50 w-fit px-2 py-1 rounded-md">
                 <ArrowUp className="h-4 w-4 mr-1" /> +5pts from last test
               </p>
             </CardContent>
           </Card>
           
           <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Biomarkers Tested</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-5xl font-serif font-bold text-primary mb-2">104</div>
               <p className="text-sm text-muted-foreground mt-1 flex items-center">
                 <Calendar className="h-3 w-3 mr-1" /> Last panel: Jan 2, 2026
               </p>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Out of Range</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-5xl font-serif font-bold text-[hsl(2,35%,54%)] mb-2">3</div>
               <p className="text-sm text-muted-foreground mt-1 font-medium">
                 Vitamin D, Ferritin, TSH
               </p>
             </CardContent>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-serif text-2xl text-primary">Biomarker Trends</CardTitle>
                <CardDescription>Tracking your Vitamin D levels over time.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] p-8 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTrendData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#0e4634" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill: '#0e4634', opacity: 0.6}} />
                    <YAxis tickLine={false} axisLine={false} tick={{fill: '#0e4634', opacity: 0.6}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontFamily: 'Plus Jakarta Sans' }} 
                      itemStyle={{ color: '#0e4634', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-3xl p-2">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="font-serif text-2xl text-primary flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6 text-emerald-600" />
                  Pattern Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="bg-[hsl(35,60%,97%)] rounded-2xl border border-[hsl(35,60%,90%)] p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="border-r border-[hsl(35,20%,85%)] pr-6 last:border-0">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Lab Signal</h5>
                      <p className="font-medium text-foreground">Low Ferritin (22 ng/mL)</p>
                      <p className="font-medium text-foreground">Borderline B12</p>
                    </div>
                    <div className="border-r border-[hsl(35,20%,85%)] pr-6 last:border-0">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">TCM Pattern</h5>
                      <p className="font-serif text-lg text-primary font-bold">Blood Deficiency</p>
                      <p className="text-sm text-muted-foreground">with underlying Liver Stagnation</p>
                    </div>
                    <div className="pl-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Educational Context</h5>
                      <p className="text-sm text-foreground/80 mb-2">Historically, <span className="font-semibold text-primary">Si Wu Tang</span> is discussed for this pattern to nourish blood.</p>
                      <Link href="/formula-library">
                        <a className="text-xs text-primary underline decoration-primary/30 hover:decoration-primary">Learn more in Library</a>
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-5 items-center p-4 bg-white border border-border rounded-xl hover:border-primary/30 transition-colors">
                   <div className="bg-primary/5 p-3 rounded-xl text-primary">
                     <Download className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary text-sm">New Lab Report Available</h4>
                    <p className="text-xs text-muted-foreground">
                      Q1 2026 Comprehensive Panel
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:text-primary">View PDF</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Protocol */}
          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="font-serif text-2xl text-primary">Daily Protocol</CardTitle>
                <CardDescription>Your personalized routine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-2">
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-secondary/50">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                       <Pill className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-primary">Vitamin D3 + K2</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">5,000 IU / Morning</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(155,50%,95%)] border border-[hsl(155,50%,90%)]">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-emerald-700 shadow-sm">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-emerald-900">Jin Gui Shen Qi Wan</p>
                      <p className="text-xs text-emerald-700/70 uppercase tracking-wider font-semibold">8 pills / 2x daily</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(35,50%,95%)] border border-[hsl(35,50%,90%)]">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[hsl(35,60%,40%)] shadow-sm">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[hsl(35,60%,20%)]">Warm Breakfast</p>
                      <p className="text-xs text-[hsl(35,60%,40%)] uppercase tracking-wider font-semibold">Avoid cold/raw foods</p>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-4">
                 <CardTitle className="font-serif text-2xl text-primary">Element Balance</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] flex items-center justify-center p-6 pt-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockTCMData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={40} tickLine={false} axisLine={false} fontSize={14} fontWeight={600} tick={{fill: '#0e4634'}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="level" radius={[0, 6, 6, 0]} barSize={24} background={{ fill: 'rgba(0,0,0,0.03)', radius: 6 }} />
                    </BarChart>
                 </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
