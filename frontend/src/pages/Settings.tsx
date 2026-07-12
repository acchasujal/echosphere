import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card, StatCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Skeleton, EmptyState } from '../components/ui/Feedback';
import { Building2, Bell, SlidersHorizontal, Shield, ToggleLeft, ToggleRight } from 'lucide-react';

interface DepartmentScore {
  id: number;
  departmentId: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
  department: { id: number; name: string; code: string };
}

interface Employee {
  id: number;
  name: string;
  role: string;
  departmentId: number;
}

interface ToggleItemProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, description, value, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
    <div className="space-y-0.5 flex-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className="shrink-0 mt-0.5 transition-colors"
      aria-checked={value}
      role="switch"
    >
      {value
        ? <ToggleRight className="w-8 h-8 text-primary" />
        : <ToggleLeft className="w-8 h-8 text-muted-foreground" />
      }
    </button>
  </div>
);

export const Settings: React.FC = () => {
  // ESG notification toggles — UI state only (no backend needed)
  const [notifyAllDuties, setNotifyAllDuties] = useState(true);
  const [requireBilling, setRequireBilling] = useState(false);
  const [advancedBudget, setAdvancedBudget] = useState(true);
  const [badgeAlerts, setBadgeAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Fetch dashboard data (which includes department scores + employees)
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery<any>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    },
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data.data || res.data || [];
    },
  });

  const departmentScores: DepartmentScore[] = dashboardData?.departmentScores || [];

  // Compute per-department employee counts
  const deptEmployeeCount = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const e of employees) {
      map.set(e.departmentId, (map.get(e.departmentId) || 0) + 1);
    }
    return map;
  }, [employees]);

  const deptTableData = departmentScores.map(ds => ({
    id: ds.department.id,
    name: ds.department.name,
    code: ds.department.code,
    employeeCount: deptEmployeeCount.get(ds.department.id) || 0,
    overallScore: ds.overallScore,
    environmentalScore: ds.environmentalScore,
    socialScore: ds.socialScore,
    governanceScore: ds.governanceScore,
  }));

  const isLoading = isLoadingDashboard || isLoadingEmployees;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <EmptyState
        title="Settings unavailable"
        description="Could not load organization configuration data."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Settings & Configuration</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage organization structure, ESG configuration, and notification preferences.
          </p>
        </div>
      </div>

      {/* Organization Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Departments"
          value={deptTableData.length.toString()}
        />
        <StatCard
          title="Total Employees"
          value={employees.length.toString()}
        />
        <StatCard
          title="Platform ESG Score"
          value={
            deptTableData.length > 0
              ? `${(deptTableData.reduce((s, d) => s + d.overallScore, 0) / deptTableData.length).toFixed(1)}`
              : '—'
          }
        />
      </div>

      {/* Department Management Table */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Department Registry</h2>
        </div>
        <DataTable
          columns={[
            {
              header: 'Department',
              accessor: (row: any) => (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary">{row.code}</span>
                  </div>
                  <span className="font-medium text-sm">{row.name}</span>
                </div>
              ),
            },
            { header: 'Employees', accessor: (row: any) => `${row.employeeCount} staff`, align: 'right' },
            {
              header: 'Env Score',
              accessor: (row: any) => (
                <span className="font-mono text-xs">{row.environmentalScore.toFixed(1)}</span>
              ),
              align: 'right',
            },
            {
              header: 'Social Score',
              accessor: (row: any) => (
                <span className="font-mono text-xs">{row.socialScore.toFixed(1)}</span>
              ),
              align: 'right',
            },
            {
              header: 'Gov Score',
              accessor: (row: any) => (
                <span className="font-mono text-xs">{row.governanceScore.toFixed(1)}</span>
              ),
              align: 'right',
            },
            {
              header: 'Overall',
              accessor: (row: any) => (
                <span className="font-mono text-xs font-semibold text-primary">{row.overallScore.toFixed(1)}</span>
              ),
              align: 'right',
            },
            {
              header: 'Status',
              accessor: (row: any) => (
                <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold
                  ${row.overallScore >= 70
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : row.overallScore >= 50
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                  {row.overallScore >= 70 ? 'Active' : row.overallScore >= 50 ? 'Review' : 'Critical'}
                </span>
              ),
            },
          ]}
          data={deptTableData}
        />
      </Card>

      {/* Configuration Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card className="p-5 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Notification Settings</h2>
          </div>
          <ToggleItem
            label="Enable ESG Duty Notifications"
            description="Send platform-wide alerts whenever new ESG tasks or challenges are assigned."
            value={notifyAllDuties}
            onChange={setNotifyAllDuties}
          />
          <ToggleItem
            label="Badge Earned Alerts"
            description="Notify employees when they unlock a new badge or recognition milestone."
            value={badgeAlerts}
            onChange={setBadgeAlerts}
          />
          <ToggleItem
            label="Weekly ESG Performance Digest"
            description="Send a compiled weekly summary of ESG scores, challenges, and compliance status."
            value={weeklyDigest}
            onChange={setWeeklyDigest}
          />
        </Card>

        {/* ESG Configuration */}
        <Card className="p-5 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">ESG Configuration</h2>
          </div>
          <ToggleItem
            label="Require ESG Billing Entries"
            description="Mandate that workers log at least one ESG activity per reporting cycle."
            value={requireBilling}
            onChange={setRequireBilling}
          />
          <ToggleItem
            label="Advanced Budget Tracking"
            description="Enable per-department ESG budget allocation and spend monitoring."
            value={advancedBudget}
            onChange={setAdvancedBudget}
          />
          <div className="flex items-center gap-2 pt-3 border-t border-border mt-1">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Configuration is applied organization-wide. Changes take effect on next sync cycle.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
