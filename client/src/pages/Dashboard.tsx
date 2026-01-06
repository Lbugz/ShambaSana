import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUp, ArrowDown, Download, Calendar, Pill, Leaf, Activity } from "lucide-react";

const mockTrendData = [
  { month: 'Jan', value: 20 },
  { month: 'Mar', value: 45 },
  { month: 'May', value: 35 },
  { month: 'Jul', value: 60 },
  { month: 'Sep', value: 55 },
  { month: 'Nov', value: 80 },
];

const mockTCMData = [
  { name: 'Qi', level: 60 },
  { name: 'Blood', level: 40 },
  { name: 'Yin', level: 30 },
  { name: 'Yang', level: 70 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Mockup */}
      <aside className="w-64 border-r border-border hidden md:flex flex-col bg-sidebar/50 backdrop-blur-sm fixed h-full">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold text-primary">LifeRX</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start font-medium">Overview</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">Lab Results</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">TCM Insights</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">My Protocol</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">Appointments</Button>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
               <p className="text-sm font-medium">John Doe</p>
               <p className="text-xs text-muted-foreground">Premium Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Welcome back, John</h1>
            <p className="text-muted-foreground">Here's your latest health snapshot from January 2026.</p>
          </div>
          <Button className="hidden sm:flex">
             <Calendar className="mr-2 h-4 w-4" /> Schedule Follow-up
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           {/* Key Stats */}
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Health Score</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-4xl font-bold text-primary">82<span className="text-lg text-muted-foreground font-normal">/100</span></div>
               <p className="text-sm text-green-600 flex items-center mt-1">
                 <ArrowUp className="h-4 w-4 mr-1" /> +5pts from last test
               </p>
             </CardContent>
           </Card>
           
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Biomarkers Tested</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-4xl font-bold">104</div>
               <p className="text-sm text-muted-foreground mt-1">
                 Last panel: Jan 2, 2026
               </p>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">Out of Range</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-4xl font-bold text-amber-500">3</div>
               <p className="text-sm text-muted-foreground mt-1">
                 Vitamin D, Ferritin, TSH
               </p>
             </CardContent>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Biomarker Trends</CardTitle>
                <CardDescription>Tracking your Vitamin D levels over time.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTrendData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-start p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                     <Leaf className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900">TCM Diagnosis: Kidney Yang Deficiency</h4>
                    <p className="text-sm text-amber-800 mt-1">
                      Your fatigue and cold hands correlate with low Vitamin D and Ferritin levels. This pattern indicates a need to warm and nourish the body's foundation.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
                   <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                     <Download className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">New Lab Report Available</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Your Q1 2026 Comprehensive Panel results are ready.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white">View</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Protocol */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Protocol</CardTitle>
                <CardDescription>Daily checklist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <Pill className="text-primary h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">Vitamin D3 + K2</p>
                      <p className="text-xs text-muted-foreground">5,000 IU / Morning</p>
                    </div>
                    <Badge variant="outline">Supp</Badge>
                 </div>
                 <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                    <Leaf className="text-green-600 h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">Jin Gui Shen Qi Wan</p>
                      <p className="text-xs text-muted-foreground">8 pills / 2x daily</p>
                    </div>
                     <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Herb</Badge>
                 </div>
                 <div className="flex items-center gap-3">
                    <Activity className="text-blue-500 h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">Warm Breakfast</p>
                      <p className="text-xs text-muted-foreground">Avoid cold/raw foods</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Diet</Badge>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                 <CardTitle>TCM Balance</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockTCMData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={50} tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="level" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
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
