import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton, EmptyState } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';
import { Plus, X, Calendar, MapPin, Award, Tag } from 'lucide-react';

interface CSRActivity {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string | null;
  startDate: string;
  endDate: string;
  status: string;
  pointsReward: number;
  participations?: any[];
}

export const CSR: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pointsReward, setPointsReward] = useState('10');
  const [formError, setFormError] = useState('');

  // 1. Fetch CSR activities
  const { data: activities = [], isLoading, error } = useQuery<CSRActivity[]>({
    queryKey: ['csr-activities'],
    queryFn: async () => {
      const res = await api.get('/csr');
      return res.data.data || res.data || [];
    },
  });

  // Mutation to create CSR Activity
  const createMutation = useMutation({
    mutationFn: async (newActivity: any) => {
      const res = await api.post('/csr', newActivity);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csr-activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('CSR activity created successfully.', 'success');
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to create CSR activity.', 'error');
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setPointsReward('10');
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) return setFormError('Title is required.');
    if (!description.trim()) return setFormError('Description is required.');
    if (!category.trim()) return setFormError('Category is required.');
    if (!startDate) return setFormError('Start date is required.');
    if (!endDate) return setFormError('End date is required.');
    
    const pts = parseInt(pointsReward);
    if (isNaN(pts) || pts < 0) return setFormError('Points reward must be a positive number.');

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim() || null,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: 'ACTIVE',
      pointsReward: pts,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load CSR activities"
        description={error.message || "There was an error communicating with the CSR database."}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">CSR & Social</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Participate in corporate social responsibility initiatives and earn reward points.</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2">
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Close Panel' : 'Create Activity'}
        </Button>
      </div>

      {/* Create Activity Panel */}
      {isFormOpen && (
        <Card className="p-5 animate-fade-in border-primary/20 bg-primary/[0.01]">
          <h2 className="text-sm font-semibold text-foreground mb-4">Create CSR Activity</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Tree Planting Drive"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Input
                  type="text"
                  placeholder="e.g. Environment, Community, Education"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                placeholder="Details about the activity, impact, and schedule..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Location</label>
                <Input
                  type="text"
                  placeholder="e.g. Central Park"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Points Reward</label>
                <Input
                  type="number"
                  value={pointsReward}
                  onChange={(e) => setPointsReward(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
              <span className="text-xs text-destructive">{formError}</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Reset
                </Button>
                <Button type="submit" loading={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Activity'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Activities Grid */}
      {activities.length === 0 ? (
        <EmptyState
          title="No CSR activities found"
          description="Create a new activity to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <Card key={act.id} className="flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-secondary-foreground">
                    <Tag className="w-3 h-3" /> {act.category}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold
                    ${act.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-muted text-muted-foreground'}`}>
                    {act.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{act.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3">{act.description}</p>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {new Date(act.startDate).toLocaleDateString()} - {new Date(act.endDate).toLocaleDateString()}
                  </span>
                </div>
                {act.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{act.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Award className="w-4 h-4" />
                    <span>{act.pointsReward} Points</span>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="h-7 text-xs px-2.5"
                    disabled
                    title="Registration is handled directly by CSR Managers."
                  >
                    Managers Assigned Only
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
