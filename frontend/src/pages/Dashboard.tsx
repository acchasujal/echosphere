import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { StatCard, Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { ChartContainer } from '../components/ui/ChartContainer';
import { Skeleton, EmptyState } from '../components/ui/Feedback';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface Department {
  id: number;
  name: string;
}

interface DepartmentScore {
  id: number;
  departmentId: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
  department: Department;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  xp: number;
  department?: Department;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  difficulty: string;
  deadline: string;
  status: string;
}

interface DashboardData {
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
  departmentScores: DepartmentScore[];
  topEmployees: Employee[];
  recentChallenges: Challenge[];
  statistics: {
    employeeCount: number;
    challengeCount: number;
    rewardCount: number;
    departmentCount: number;
    carbonTransactionCount: number;
  };
}

interface EsgScores {
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
}

interface DashboardInsights {
  generatedAt: string;
  overallSummary: string;
  environmentalAnalysis: string;
  socialAnalysis: string;
  governanceAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  priorityActions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  priorityDepartment: string;
  executiveSummary: string;
}


// Custom hook for simple count-up numbers
const useCountUp = (target: number, duration: number = 800) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;
    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 10);
    const timer = setInterval(() => {
      start += 1.5;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

export const Dashboard: React.FC = () => {
  const { data, isLoading: isLoadingDashboard, error: errorDashboard, refetch: refetchDashboard } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    },
  });

  const { data: esgScores, isLoading: isLoadingEsg, refetch: refetchEsg } = useQuery<EsgScores>({
    queryKey: ['esg-scores'],
    queryFn: async () => {
      const response = await api.get('/dashboard/esg');
      return response.data.data || response.data;
    },
  });

  const { data: aiInsights, isLoading: isLoadingAI, error: errorAI, refetch: refetchAI } = useQuery<DashboardInsights>({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const response = await api.get('/dashboard/insights');
      return response.data.data || response.data;
    },
  });

  const isLoading = isLoadingDashboard || isLoadingEsg || isLoadingAI;
  const error = errorDashboard || errorAI;
  const refetch = () => {
    refetchDashboard();
    refetchEsg();
    refetchAI();
  };

  const displayOverall = esgScores?.overallScore ?? data?.overallScore ?? 0;
  const displayEnv = esgScores?.environmentalScore ?? data?.environmentalScore ?? 0;
  const displaySocial = esgScores?.socialScore ?? data?.socialScore ?? 0;
  const displayGov = esgScores?.governanceScore ?? data?.governanceScore ?? 0;

  // Animate values (must be called unconditionally before early returns)
  const animatedOverall = useCountUp(displayOverall);
  const animatedEnv = useCountUp(displayEnv);
  const animatedSocial = useCountUp(displaySocial);
  const animatedGov = useCountUp(displayGov);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load dashboard data"
        description={error?.message || "There was an issue fetching corporate scores and metrics."}
        action={
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            Retry Connection
          </button>
        }
      />
    );
  }

  // Format scores for Radar & Bar Chart
  const chartData = [
    { subject: 'Environmental', score: Math.round(displayEnv) },
    { subject: 'Social', score: Math.round(displaySocial) },
    { subject: 'Governance', score: Math.round(displayGov) },
  ];

  const departmentScoresData = data.departmentScores.map((score) => ({
    name: score.department?.name || `Dept ${score.departmentId}`,
    E: score.environmentalScore,
    S: score.socialScore,
    G: score.governanceScore,
    Overall: score.overallScore,
  }));

  const columns = [
    { header: 'Department', accessor: 'name' as const },
    { 
      header: 'Environmental', 
      accessor: (row: any) => <span className="font-mono">{row.E.toFixed(1)}</span>,
      align: 'right' as const
    },
    { 
      header: 'Social', 
      accessor: (row: any) => <span className="font-mono">{row.S.toFixed(1)}</span>,
      align: 'right' as const
    },
    { 
      header: 'Governance', 
      accessor: (row: any) => <span className="font-mono">{row.G.toFixed(1)}</span>,
      align: 'right' as const
    },
    { 
      header: 'Overall Score', 
      accessor: (row: any) => (
        <span className="font-mono font-semibold text-primary">{row.Overall.toFixed(1)}</span>
      ),
      align: 'right' as const
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Corporate sustainability and ESG performance metrics.</p>
        </div>
        {aiInsights && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">AI Risk:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
              ${aiInsights.riskLevel === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                aiInsights.riskLevel === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {aiInsights.riskLevel}
            </span>
          </div>
        )}
      </div>

      {/* AI Insights Digest Panel */}
      {aiInsights && (
        <Card className="p-5 border border-primary/10 bg-gradient-to-r from-primary/[0.01] to-primary/[0.03] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <svg className="w-4 h-4 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Executive AI Insights & Action Digest
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono">Generated: {new Date(aiInsights.generatedAt).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed font-medium">{aiInsights.executiveSummary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1 bg-card/60 p-3 rounded-lg border border-border/60">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strengths</h3>
              {aiInsights.strengths.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">No strengths highlighted</p>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-foreground/80 font-medium">
                  {aiInsights.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-1 bg-card/60 p-3 rounded-lg border border-border/60">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weaknesses</h3>
              {aiInsights.weaknesses.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">No core weaknesses detected</p>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-foreground/80 font-medium font-semibold text-red-700">
                  {aiInsights.weaknesses.map((weak, idx) => (
                    <li key={idx} className="text-red-700">{weak}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-1 bg-card/60 p-3 rounded-lg border border-border/60">
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-wider">Priority Actions</h3>
              {aiInsights.priorityActions.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">No immediate actions needed</p>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-foreground/80 font-medium">
                  {aiInsights.priorityActions.map((act, idx) => (
                    <li key={idx} className="text-primary-hover">{act}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Score Metrics - Premium stands out look */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">ESG</span>
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Overall ESG Score</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-foreground tabular-nums font-mono tracking-tight">{animatedOverall.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-secondary h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${animatedOverall}%` }} />
          </div>
        </div>

        <StatCard 
          title="Environmental (E)" 
          value={animatedEnv.toFixed(1)} 
        />
        <StatCard 
          title="Social (S)" 
          value={animatedSocial.toFixed(1)} 
        />
        <StatCard 
          title="Governance (G)" 
          value={animatedGov.toFixed(1)} 
        />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="ESG Component Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Radar 
                name="EcoSphere Scores" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.15} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Department Score Comparison">
          {departmentScoresData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No department scores available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentScoresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    fontSize: '12px'
                  }} 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
                <Bar dataKey="E" fill="hsl(142, 71%, 45%)" name="Environmental" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="S" fill="hsl(200, 95%, 40%)" name="Social" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="G" fill="hsl(38, 92%, 50%)" name="Governance" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>

      {/* Grid for Table and Side lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Table */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Departmental Scores Breakdown</h2>
          <DataTable columns={columns} data={departmentScoresData} />
        </div>

        {/* Sidebar Lists: Leaders & Stats */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Top Contributors</h2>
            <Card className="p-4 space-y-3">
              {data.topEmployees.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No employees yet.</p>
              ) : data.topEmployees.map((emp, index) => (
                <div key={emp.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-muted-foreground w-4">{index + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center font-medium text-xs">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{emp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{emp.department?.name || 'Staff'}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-primary">{emp.xp} XP</span>
                </div>
              ))}
            </Card>
          </div>

          {/* Statistics Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">System Statistics</h2>
            <Card className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground">Total Staff</p>
                <p className="text-xl font-bold font-mono mt-0.5">{data.statistics.employeeCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground">Departments</p>
                <p className="text-xl font-bold font-mono mt-0.5">{data.statistics.departmentCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground">Challenges</p>
                <p className="text-xl font-bold font-mono mt-0.5">{data.statistics.challengeCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-muted-foreground">Emissions Logged</p>
                <p className="text-xl font-bold font-mono mt-0.5">{data.statistics.carbonTransactionCount}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
