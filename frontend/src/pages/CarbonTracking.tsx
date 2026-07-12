import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card, StatCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton, EmptyState } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';
import { Trash2, Plus, Filter, X } from 'lucide-react';

interface Department {
  id: number;
  name: string;
}

interface CarbonTransaction {
  id: number;
  departmentId: number;
  source: string;
  quantity: number;
  co2Amount: number;
  createdAt: string;
  department?: Department;
}

interface DashboardData {
  departmentScores: Array<{
    departmentId: number;
    department: Department;
  }>;
}

export const CarbonTracking: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [departmentId, setDepartmentId] = useState('');
  const [source, setSource] = useState('');
  const [quantity, setQuantity] = useState('');
  const [co2Amount, setCo2Amount] = useState('');
  const [formError, setFormError] = useState('');

  // Filters State
  const [deptFilter, setDeptFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // 1. Fetch transactions
  const { data: transactions = [], isLoading, error } = useQuery<CarbonTransaction[]>({
    queryKey: ['carbon-transactions'],
    queryFn: async () => {
      const res = await api.get('/carbon-transactions');
      return res.data.data || res.data || [];
    },
  });

  // 2. Fetch departments from dashboard query data or API
  const { data: dashboardData } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    },
  });

  const departments = dashboardData?.departmentScores?.map(ds => ds.department) || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newTx: { departmentId: number; source: string; quantity: number; co2Amount: number }) => {
      const res = await api.post('/carbon-transactions', newTx);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbon-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Carbon emission logged successfully.', 'success');
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to submit carbon transaction.';
      toast(msg, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/carbon-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbon-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Transaction deleted successfully.', 'success');
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to delete transaction.', 'error');
    },
  });

  const resetForm = () => {
    setDepartmentId('');
    setSource('');
    setQuantity('');
    setCo2Amount('');
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!departmentId) {
      setFormError('Please select a department.');
      return;
    }
    if (!source.trim()) {
      setFormError('Please provide an emission source.');
      return;
    }
    const qVal = parseFloat(quantity);
    if (isNaN(qVal) || qVal <= 0) {
      setFormError('Quantity must be a positive number.');
      return;
    }
    const cVal = parseFloat(co2Amount);
    if (isNaN(cVal) || cVal < 0) {
      setFormError('CO2 Amount must be a non-negative number.');
      return;
    }

    createMutation.mutate({
      departmentId: parseInt(departmentId),
      source: source.trim(),
      quantity: qVal,
      co2Amount: cVal,
    });
  };

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    const matchDept = !deptFilter || tx.departmentId === parseInt(deptFilter);
    const matchSrc = !sourceFilter || tx.source.toLowerCase().includes(sourceFilter.toLowerCase());
    return matchDept && matchSrc;
  });

  // Calculate statistics
  const totalCo2 = filteredTransactions.reduce((acc, tx) => acc + tx.co2Amount, 0);
  const totalQuantity = filteredTransactions.reduce((acc, tx) => acc + tx.quantity, 0);

  const columns = [
    { 
      header: 'Date', 
      accessor: (row: CarbonTransaction) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      )
    },
    { 
      header: 'Department', 
      accessor: (row: CarbonTransaction) => row.department?.name || `Dept ${row.departmentId}` 
    },
    { header: 'Source', accessor: 'source' },
    { 
      header: 'Quantity', 
      accessor: (row: CarbonTransaction) => <span className="font-mono">{row.quantity}</span>,
      align: 'right' as const
    },
    { 
      header: 'CO2 Emitted (kg)', 
      accessor: (row: CarbonTransaction) => (
        <span className="font-mono font-semibold text-destructive">{row.co2Amount.toFixed(1)}</span>
      ),
      align: 'right' as const
    },
    {
      header: 'Actions',
      accessor: (row: CarbonTransaction) => (
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this log?')) {
              deleteMutation.mutate(row.id);
            }
          }}
          disabled={deleteMutation.isPending}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
          title="Delete record"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
      align: 'center' as const
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load carbon records"
        description={error.message || "There was an error communicating with the transaction database."}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Carbon Tracking</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Log and track corporate green-house gas emissions and offsets.</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2">
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Close Panel' : 'Log Emission'}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard 
          title="Total CO2 Emitted (Filtered)" 
          value={`${totalCo2.toFixed(1)} kg`} 
          delta={filteredTransactions.length.toString() + " logs"}
          positive={false}
        />
        <StatCard 
          title="Total Activity Volume" 
          value={totalQuantity.toFixed(0)} 
        />
      </div>

      {/* Log Form Panel */}
      {isFormOpen && (
        <Card className="p-5 animate-fade-in border-primary/20 bg-primary/[0.01]">
          <h2 className="text-sm font-semibold text-foreground mb-4">New Carbon Transaction</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Source</label>
              <Input
                type="text"
                placeholder="e.g. Travel, Electricity, Gas"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Quantity (kWh / L / miles)</label>
              <Input
                type="number"
                step="any"
                placeholder="0.0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">CO2 Emitted (kg)</label>
              <Input
                type="number"
                step="any"
                placeholder="0.0"
                value={co2Amount}
                onChange={(e) => setCo2Amount(e.target.value)}
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-between border-t border-border pt-4 mt-2">
              <span className="text-xs text-destructive">{formError}</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Reset
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Submit Transaction'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Filter and Ledger Table Section */}
      <div className="space-y-4">
        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 border border-border rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground shrink-0">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-xs w-full sm:w-44 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <Input
              type="text"
              placeholder="Search by source..."
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 text-xs w-full sm:w-60"
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable columns={columns} data={filteredTransactions} />
      </div>
    </div>
  );
};
