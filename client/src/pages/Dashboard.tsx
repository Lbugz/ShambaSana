import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ArrowUp, ArrowDown, Download, Calendar, Pill, Leaf, Activity, Droplets, Wind, Sparkles, Menu, BookOpen, BrainCircuit, ChevronRight, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mockTrendData = [
  { month: 'Jan', value: 20 },
  { month: 'Mar', value: 45 },
  { month: 'May', value: 35 },
  { month: 'Jul', value: 60 },
  { month: 'Sep', value: 55 },
  { month: 'Nov', value: 80 },
];

const mockTCMData = [
  { subject: 'Qi', A: 85, fullMark: 100 },
  { subject: 'Blood', A: 65, fullMark: 100 },
  { subject: 'Yin', A: 45, fullMark: 100 },
  { subject: 'Yang', A: 90, fullMark: 100 },
  { subject: 'Shen', A: 70, fullMark: 100 },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const NavItem = ({ href, icon: Icon, children, isActive = false }: any) => {
    const isCurrentPath = location === href || isActive;
    
    return (
      <Link href={href}>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start h-12 transition-all duration-200",
            isCurrentPath 
              ? "bg-primary/10 text-primary font-semibold shadow-sm" 
              : "text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
          )}
        >
          <Icon className={cn("mr-3 h-4 w-4", isCurrentPath ? "text-primary" : "text-muted-foreground/70")} />
          {children}
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl">
        <div className="p-8 pt-10">
          <h2 className="text-3xl font-serif font-bold text-primary flex items-center gap-2 tracking-tight">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
               <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
            </div>
            LifeRX
          </h2>
        </div>
        
        <div className="flex-1 px-4 space-y-8 overflow-y-auto">
          <div className="space-y-2">
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-3">Your Health</p>
            <nav className="space-y-1">
              <NavItem href="/" icon={Activity} isActive>Overview</NavItem>
              <NavItem href="/labs" icon={Droplets}>Lab Results</NavItem>
              <NavItem href="/tcm" icon={Wind}>TCM Insights</NavItem>
              <NavItem href="/protocol" icon={Sparkles}>My Protocol</NavItem>
            </nav>
          </div>

          <div className="space-y-2">
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-3">Resources</p>
            <nav className="space-y-1">
              <NavItem href="/formula-library" icon={BookOpen}>Formula Library</NavItem>
              <NavItem href="/tcm-assessment" icon={BrainCircuit}>Assessments</NavItem>
              <NavItem href="/appointments" icon={Calendar}>Appointments</NavItem>
            </nav>
          </div>
        </div>

        <div className="p-6 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/80 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10 hover:shadow-sm">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary font-bold">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
               <p className="text-sm font-bold text-primary truncate">John Doe</p>
               <p className="text-xs text-muted-foreground truncate">Premium Member</p>
            </div>
          </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1601055903647-8f1925345d06?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-fixed bg-center flex font-sans text-foreground">
      {/* Heavy frosted glass overlay for the entire background to soften the image */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-[60px] z-0 pointer-events-none" />

      {/* Sidebar Desktop */}
      <aside className="w-72 border-r border-white/20 hidden md:flex flex-col fixed h-full z-20 shadow-[4px_0_24px_-12px_rgba(14,70,52,0.1)]">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 sm:p-8 md:p-12 overflow-y-auto relative z-10 h-screen">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.header variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div className="flex items-start gap-4">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden shrink-0 bg-white/50 backdrop-blur-sm border-white/40 shadow-sm mt-1">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r-white/20 shadow-2xl w-72">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <div>
                <Badge variant="outline" className="mb-3 bg-white/50 backdrop-blur-sm border-emerald-200/50 text-emerald-800 font-medium tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  Health Score Updated
                </Badge>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3 tracking-tight">Welcome back, John</h1>
                <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">Your Qi levels are steadily rising. Here is your personalized health snapshot for today.</p>
              </div>
            </div>
            
            <Button className="w-full sm:w-auto rounded-full px-6 py-6 shadow-[0_8px_16px_-6px_rgba(14,70,52,0.4)] bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300 text-base font-semibold group">
               <Calendar className="mr-2 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" /> Schedule Follow-up
            </Button>
          </motion.header>

          {/* Action Banner */}
          <motion.div variants={fadeUp} className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-primary text-white shadow-xl relative overflow-hidden group cursor-pointer border border-white/10">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 right-32 w-32 h-32 bg-emerald-400 opacity-20 rounded-full blur-2xl translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                  <Pill className="h-6 w-6 text-emerald-100" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm font-medium tracking-wide uppercase mb-1">Morning Routine</p>
                  <h3 className="text-xl font-serif font-bold">Time for your morning protocol</h3>
                </div>
              </div>
              <Button variant="secondary" className="rounded-full bg-white text-primary hover:bg-emerald-50 border-none shadow-md font-bold px-6">
                Log Protocol <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            
             {/* Main Hero Stat (Takes up 2 columns) */}
             <motion.div variants={fadeUp} className="lg:col-span-2">
               <Card className="h-full border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl rounded-[2rem] overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />
                 <CardHeader className="relative z-10 pb-2">
                   <CardTitle className="text-xs font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                     <Activity className="h-4 w-4 text-emerald-600" /> Overall Wellness Score
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="relative z-10 flex flex-col justify-end h-[calc(100%-4rem)]">
                   <div className="flex items-baseline gap-2 mb-4">
                     <span className="text-7xl lg:text-8xl font-serif font-bold text-primary tracking-tighter leading-none">82</span>
                     <span className="text-2xl text-muted-foreground font-medium mb-2">/100</span>
                   </div>
                   <div className="flex flex-wrap items-center gap-3">
                     <span className="text-sm text-emerald-800 font-bold flex items-center bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200/50 shadow-sm backdrop-blur-sm">
                       <ArrowUp className="h-4 w-4 mr-1 stroke-[3]" /> +5pts from last test
                     </span>
                     <span className="text-sm text-muted-foreground font-medium">Top 15% of peers</span>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>

             {/* Small Stat 1 */}
             <motion.div variants={fadeUp}>
               <Card className="h-full border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl rounded-[2rem] hover:bg-white/80 transition-colors cursor-pointer group">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-xs font-bold tracking-widest uppercase text-muted-foreground flex justify-between items-center">
                     Biomarkers
                     <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col justify-end h-[calc(100%-3rem)]">
                   <div className="text-5xl font-serif font-bold text-primary mb-2">104</div>
                   <p className="text-sm text-muted-foreground font-medium">Tested Jan 2, 2026</p>
                 </CardContent>
               </Card>
             </motion.div>

             {/* Small Stat 2 */}
             <motion.div variants={fadeUp}>
               <Card className="h-full border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl rounded-[2rem] hover:bg-white/80 transition-colors cursor-pointer group">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-xs font-bold tracking-widest uppercase text-[hsl(2,35%,54%)] flex justify-between items-center">
                     Needs Attention
                     <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[hsl(2,35%,54%)]" />
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col justify-end h-[calc(100%-3rem)]">
                   <div className="text-5xl font-serif font-bold text-[hsl(2,35%,54%)] mb-2">3</div>
                   <p className="text-sm text-[hsl(2,35%,54%)]/80 font-semibold line-clamp-1">Vit D, Ferritin, TSH</p>
                 </CardContent>
               </Card>
             </motion.div>

          </div>

          {/* Lower Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
              <Card className="border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-2xl text-primary mb-1">Biomarker Trends</CardTitle>
                    <CardDescription className="text-base">Tracking your Vitamin D levels over time.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full bg-white/50 border-white/80 shadow-sm font-semibold">
                    Last 6 Months <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[380px] p-8 pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(14, 70, 52, 0.08)" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill: '#0e4634', opacity: 0.5, fontSize: 13, fontWeight: 500}} dy={10} />
                      <YAxis tickLine={false} axisLine={false} tick={{fill: '#0e4634', opacity: 0.5, fontSize: 13, fontWeight: 500}} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'Plus Jakarta Sans', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }} 
                        itemStyle={{ color: '#0e4634', fontWeight: 700 }}
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: "var(--color-primary)" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Insights Card */}
              <Card className="border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2rem]">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="font-serif text-2xl text-primary flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <BrainCircuit className="h-6 w-6 text-emerald-700" />
                    </div>
                    Pattern Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <div className="bg-gradient-to-br from-[hsl(38,40%,96%)] to-white rounded-[1.5rem] border border-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] p-6 md:p-8">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative">
                      {/* Divider for desktop */}
                      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/60 to-transparent -translate-x-1/2" />
                      
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-border/50 shadow-sm text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <Droplets className="h-3.5 w-3.5" /> Western Lab Signal
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground mb-1">Low Ferritin <span className="text-muted-foreground font-medium text-lg">(22 ng/mL)</span></p>
                          <p className="text-foreground/70 font-medium">Borderline B12 Levels</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-border/50 shadow-sm text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <Wind className="h-3.5 w-3.5" /> Eastern TCM Pattern
                        </div>
                        <div>
                          <p className="font-serif text-3xl text-primary font-bold mb-1">Blood Deficiency</p>
                          <p className="text-foreground/70 font-medium">with underlying Liver Stagnation</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-border/40">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-white/60">
                        <div>
                          <p className="text-sm font-bold text-foreground mb-1">Recommended Formula</p>
                          <p className="text-sm text-muted-foreground">Consider <span className="font-semibold text-primary">Si Wu Tang</span> to nourish blood.</p>
                        </div>
                        <Link href="/formula-library">
                          <Button variant="secondary" size="sm" className="rounded-full bg-white shadow-sm hover:bg-primary hover:text-white transition-colors">
                            Explore Formula
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center p-5 bg-white/60 border border-white shadow-sm rounded-2xl hover:border-primary/20 transition-all cursor-pointer group">
                     <div className="bg-primary/5 p-4 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                       <Download className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-primary text-base mb-1">New Lab Report Available</h4>
                      <p className="text-sm text-muted-foreground font-medium">
                        Q1 2026 Comprehensive Panel • PDF
                      </p>
                    </div>
                    <Button variant="ghost" className="rounded-full hover:bg-primary/5 font-semibold self-stretch sm:self-auto">View Report</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar Columns (Radar & Protocol) */}
            <motion.div variants={fadeUp} className="space-y-6">
              
              {/* Radar Chart Card */}
              <Card className="border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2rem]">
                <CardHeader className="p-6 pb-0">
                   <CardTitle className="font-serif text-xl text-primary">Five Elements Balance</CardTitle>
                   <CardDescription>Your current energetic state</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] flex items-center justify-center p-6">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockTCMData}>
                        <PolarGrid stroke="rgba(14,70,52,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{fill: '#0e4634', fontWeight: 600, fontSize: 12}} />
                        <Radar name="Balance" dataKey="A" stroke="var(--color-primary)" strokeWidth={2} fill="var(--color-primary)" fillOpacity={0.15} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.9)' }} 
                          itemStyle={{ color: '#0e4634', fontWeight: 600 }}
                        />
                      </RadarChart>
                   </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Protocol Card */}
              <Card className="border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2rem]">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="font-serif text-xl text-primary">Daily Protocol</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0">
                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                         <Pill className="h-5 w-5" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-bold text-foreground text-sm mb-1">Vitamin D3 + K2</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">5,000 IU / Morning</p>
                      </div>
                   </div>
                   
                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-100 group-hover:scale-105 transition-transform">
                        <Leaf className="h-5 w-5" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-bold text-emerald-950 text-sm mb-1">Jin Gui Shen Qi Wan</p>
                        <p className="text-xs text-emerald-700/70 uppercase tracking-wider font-bold">8 pills / 2x daily</p>
                      </div>
                   </div>
                   
                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="h-12 w-12 rounded-xl bg-[hsl(38,40%,94%)] flex items-center justify-center text-[hsl(38,50%,30%)] shadow-sm border border-[hsl(38,40%,90%)] group-hover:scale-105 transition-transform">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-bold text-[hsl(38,60%,20%)] text-sm mb-1">Warm Breakfast</p>
                        <p className="text-xs text-[hsl(38,40%,40%)] uppercase tracking-wider font-bold">Avoid cold/raw foods</p>
                      </div>
                   </div>
                </CardContent>
              </Card>

            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
