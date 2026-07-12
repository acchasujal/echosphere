import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card, StatCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton, EmptyState } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';
import { ShieldCheck, Check, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
}

interface Policy {
  id: number;
  title: string;
  description: string;
  status: string;
}

interface PolicyAcknowledgement {
  id: number;
  policyId: number;
  employeeId: number;
  acknowledgedAt: string;
}

interface ComplianceIssue {
  id: number;
  description: string;
  ownerId: number;
  dueDate: string;
  status: string;
  departmentId: number;
  department?: {
    name: string;
  };
}

export const Governance: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false);
  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);

  // Policy Form State
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyDesc, setPolicyDesc] = useState('');
  const [policyError, setPolicyError] = useState('');

  // Issue Form State
  const [issueDesc, setIssueDesc] = useState('');
  const [issueOwnerId, setIssueOwnerId] = useState('');
  const [issueDeptId, setIssueDeptId] = useState('');
  const [issueDueDate, setIssueDueDate] = useState('');
  const [issueError, setIssueError] = useState('');

  // 1. Fetch Employees (to use first employee as the logged-in employee, and for owner selection)
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data.data || res.data || [];
    },
  });

  const currentUser = employees[0]; // Active User Simulation

  // 2. Fetch Policies
  const { data: policies = [], isLoading: isLoadingPolicies, error: errorPolicies } = useQuery<Policy[]>({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await api.get('/policies');
      return res.data.data || res.data || [];
    },
  });

  // 3. Fetch current user acknowledgements
  const { data: acknowledgements = [] } = useQuery<PolicyAcknowledgement[]>({
    queryKey: ['policy-acknowledgements', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const res = await api.get(`/policy-acknowledgements/employee/${currentUser.id}`);
      return res.data.data || res.data || [];
    },
  });

  // 4. Fetch Compliance Issues
  const { data: complianceIssues = [], isLoading: isLoadingIssues } = useQuery<ComplianceIssue[]>({
    queryKey: ['compliance-issues'],
    queryFn: async () => {
      const res = await api.get('/compliance-issues');
      return res.data.data || res.data || [];
    },
  });

  // Fetch departments for creating compliance issues
  const { data: dashboardData } = useQuery<any>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    },
  });

  const departments = dashboardData?.departmentScores?.map((ds: any) => ds.department) || [];

  // Mutations
  const createPolicyMutation = useMutation({
    mutationFn: async (newPolicy: { title: string; description: string; status: string }) => {
      const res = await api.post('/policies', newPolicy);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast('ESG policy published successfully.', 'success');
      setIsPolicyFormOpen(false);
      setPolicyTitle('');
      setPolicyDesc('');
      setPolicyError('');
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to publish policy.', 'error');
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (policyId: number) => {
      const res = await api.post('/policy-acknowledgements', {
        employeeId: currentUser.id,
        policyId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-acknowledgements', currentUser?.id] });
      toast('Policy acknowledged successfully.', 'success');
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to acknowledge policy.', 'error');
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: async (newIssue: { departmentId: number; description: string; ownerId: number; dueDate: string }) => {
      const res = await api.post('/compliance-issues', newIssue);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-issues'] });
      toast('Compliance issue logged successfully.', 'success');
      setIsIssueFormOpen(false);
      setIssueDesc('');
      setIssueOwnerId('');
      setIssueDeptId('');
      setIssueDueDate('');
      setIssueError('');
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to create compliance issue.', 'error');
    },
  });

  const resolveIssueMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch(`/compliance-issues/${id}`, {
        status: 'RESOLVED',
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-issues'] });
      toast('Compliance issue marked as resolved.', 'success');
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to resolve compliance issue.', 'error');
    },
  });

  const handlePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyError('');
    if (!policyTitle.trim()) return setPolicyError('Title is required.');
    if (!policyDesc.trim()) return setPolicyError('Description is required.');

    createPolicyMutation.mutate({
      title: policyTitle.trim(),
      description: policyDesc.trim(),
      status: 'ACTIVE',
    });
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError('');
    if (!issueDesc.trim()) return setIssueError('Description is required.');
    if (!issueOwnerId) return setIssueError('Owner selection is required.');
    if (!issueDeptId) return setIssueError('Department is required.');
    if (!issueDueDate) return setIssueError('Due date is required.');

    createIssueMutation.mutate({
      departmentId: parseInt(issueDeptId),
      description: issueDesc.trim(),
      ownerId: parseInt(issueOwnerId),
      dueDate: new Date(issueDueDate).toISOString(),
    });
  };

  // Calculations
  const totalIssues = complianceIssues.length;
  const resolvedIssues = complianceIssues.filter(i => i.status === 'RESOLVED').length;
  const complianceScore = totalIssues === 0 ? 100 : Math.round((resolvedIssues / totalIssues) * 100);

  const acknowledgedPolicyIds = new Set(acknowledgements.map(a => a.policyId));

  const issueColumns = [
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Department', 
      accessor: (row: ComplianceIssue) => row.department?.name || `Dept ${row.departmentId}` 
    },
    { 
      header: 'Due Date', 
      accessor: (row: ComplianceIssue) => {
        const isOverdue = new Date(row.dueDate) < new Date() && row.status !== 'RESOLVED';
        return (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
            {isOverdue && <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse" />}
            {new Date(row.dueDate).toLocaleDateString()}
          </span>
        );
      } 
    },
    { 
      header: 'Status', 
      accessor: (row: ComplianceIssue) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold
          ${row.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {row.status}
        </span>
      ) 
    },
    {
      header: 'Actions',
      accessor: (row: ComplianceIssue) => (
        row.status !== 'RESOLVED' ? (
          <Button 
            onClick={() => resolveIssueMutation.mutate(row.id)} 
            disabled={resolveIssueMutation.isPending}
            className="h-7 text-xs px-2.5"
            variant="secondary"
          >
            Mark Resolved
          </Button>
        ) : (
          <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Resolved
          </span>
        )
      ),
      align: 'center' as const
    }
  ];

  if (isLoadingPolicies || isLoadingIssues) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (errorPolicies) {
    return (
      <EmptyState
        title="Failed to load policies"
        description={errorPolicies.message || "There was an error communicating with the policy database."}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Governance</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage sustainability compliance guidelines, ESG policies, and audits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsIssueFormOpen(!isIssueFormOpen)}>
            {isIssueFormOpen ? 'Close Issue Panel' : 'Log Compliance Issue'}
          </Button>
          <Button onClick={() => setIsPolicyFormOpen(!isPolicyFormOpen)}>
            {isPolicyFormOpen ? 'Close Policy Panel' : 'Publish Policy'}
          </Button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          title="Compliance Rating" 
          value={`${complianceScore}%`} 
          delta={`${resolvedIssues}/${totalIssues} resolved`} 
          positive={complianceScore === 100}
        />
        <StatCard 
          title="Active Policies" 
          value={policies.length.toString()} 
        />
        <StatCard 
          title="Your Acknowledgements" 
          value={`${acknowledgedPolicyIds.size}/${policies.length}`} 
          positive={acknowledgedPolicyIds.size === policies.length}
        />
      </div>

      {/* Publish Policy Form */}
      {isPolicyFormOpen && (
        <Card className="p-5 animate-fade-in border-primary/20 bg-primary/[0.01]">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publish New ESG Policy</h2>
          <form onSubmit={handlePolicySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input
                type="text"
                placeholder="e.g. Corporate Carbon Neutrality Commitment"
                value={policyTitle}
                onChange={(e) => setPolicyTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description / Policy Details</label>
              <textarea
                placeholder="Full text of policy rules, expectations, and standards..."
                value={policyDesc}
                onChange={(e) => setPolicyDesc(e.target.value)}
                className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 min-h-[80px]"
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
              <span className="text-xs text-destructive">{policyError}</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsPolicyFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPolicyMutation.isPending}>
                  {createPolicyMutation.isPending ? 'Publishing...' : 'Publish Policy'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Log Compliance Issue Form */}
      {isIssueFormOpen && (
        <Card className="p-5 animate-fade-in border-destructive/20 bg-destructive/[0.01]">
          <h2 className="text-sm font-semibold text-foreground mb-4">Log Compliance Issue</h2>
          <form onSubmit={handleIssueSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Input
                type="text"
                placeholder="e.g. Carbon log values missing in sales department report"
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Assignee / Owner</label>
                <select
                  value={issueOwnerId}
                  onChange={(e) => setIssueOwnerId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Department</label>
                <select
                  value={issueDeptId}
                  onChange={(e) => setIssueDeptId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                <Input
                  type="date"
                  value={issueDueDate}
                  onChange={(e) => setIssueDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
              <span className="text-xs text-destructive">{issueError}</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsIssueFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createIssueMutation.isPending}>
                  {createIssueMutation.isPending ? 'Logging...' : 'Log Issue'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Grid for Policy list and Compliance Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policies Column */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-muted-foreground" /> Compliance Guidelines
          </h2>
          {policies.length === 0 ? (
            <EmptyState
              title="No guidelines published"
              description="Click Publish Policy to create the first sustainability rule."
            />
          ) : (
            <div className="space-y-3">
              {policies.map((policy) => {
                const isAck = acknowledgedPolicyIds.has(policy.id);
                return (
                  <Card key={policy.id} className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{policy.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-4">{policy.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {isAck ? (
                        <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Acknowledged
                        </span>
                      ) : (
                        <Button
                          onClick={() => acknowledgeMutation.mutate(policy.id)}
                          disabled={acknowledgeMutation.isPending || !currentUser}
                          className="h-7 text-xs px-2.5 flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Acknowledge
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Compliance Issues Column */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" /> Compliance Register
          </h2>
          <DataTable columns={issueColumns} data={complianceIssues} />
        </div>
      </div>
    </div>
  );
};
