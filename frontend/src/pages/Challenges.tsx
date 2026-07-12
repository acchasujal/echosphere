import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton, EmptyState } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';
import {
  Zap, Clock, Star, CheckCircle2, Trophy, Target, Plus, Flame, Users
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  xp: number;
  points: number;
  department?: { name: string };
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

interface Participation {
  id: number;
  employeeId: number;
  challengeId: number;
  status: string;
  xpAwarded: number;
  proof?: string;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; badge: string }> = {
  easy:   { label: 'Easy',   color: 'text-emerald-700', badge: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  medium: { label: 'Medium', color: 'text-amber-700',   badge: 'bg-amber-50 border-amber-200 text-amber-800' },
  hard:   { label: 'Hard',   color: 'text-red-700',     badge: 'bg-red-50 border-red-200 text-red-800' },
};

const STATUS_CONFIG: Record<string, { badge: string }> = {
  active:    { badge: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  ongoing:   { badge: 'bg-blue-50 border-blue-200 text-blue-800' },
  completed: { badge: 'bg-muted border-border text-muted-foreground' },
};

function getDaysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export const Challenges: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'active' | 'ongoing' | 'completed'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New challenge form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newXp, setNewXp] = useState('100');
  const [newDifficulty, setNewDifficulty] = useState('easy');
  const [newDeadline, setNewDeadline] = useState('');
  const [formError, setFormError] = useState('');

  // 1. Current user (first employee as simulation)
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data.data || res.data || [];
    },
  });
  const currentUser = employees[0];

  // 2. Challenges list
  const { data: challenges = [], isLoading: isLoadingChallenges, error } = useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await api.get('/challenges');
      return res.data.data || res.data || [];
    },
  });

  // 3. All participations (to derive current user's status per challenge)
  const { data: participations = [] } = useQuery<Participation[]>({
    queryKey: ['participations'],
    queryFn: async () => {
      const res = await api.get('/participations');
      return res.data.data || res.data || [];
    },
  });

  // Derive a map of challengeId → participation for current user
  const myParticipationMap = React.useMemo(() => {
    const map = new Map<number, Participation>();
    if (!currentUser) return map;
    for (const p of participations) {
      if (p.employeeId === currentUser.id) {
        map.set(p.challengeId, p);
      }
    }
    return map;
  }, [participations, currentUser]);

  // 4. Join challenge mutation
  const joinMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      if (!currentUser) throw new Error('No user found. Cannot join challenge.');
      const res = await api.post('/participations', {
        employeeId: currentUser.id,
        challengeId,
        status: 'in_progress',
      });
      return res.data;
    },
    onSuccess: (_, challengeId) => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      const ch = challenges.find(c => c.id === challengeId);
      toast(`Joined "${ch?.title || 'Challenge'}" — Good luck!`, 'success');
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to join challenge.', 'error');
    },
  });

  // 5. Create challenge mutation
  const createMutation = useMutation({
    mutationFn: async (payload: {
      title: string; description: string; xpReward: number;
      difficulty: string; deadline: string; status: string;
    }) => {
      const res = await api.post('/challenges', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast('Challenge created successfully.', 'success');
      setIsFormOpen(false);
      setNewTitle(''); setNewDesc(''); setNewXp('100');
      setNewDifficulty('easy'); setNewDeadline(''); setFormError('');
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to create challenge.', 'error');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newTitle.trim()) return setFormError('Title is required.');
    if (!newDesc.trim()) return setFormError('Description is required.');
    if (!newDeadline) return setFormError('Deadline is required.');
    const xpNum = parseInt(newXp, 10);
    if (isNaN(xpNum) || xpNum <= 0) return setFormError('XP Reward must be a positive number.');
    createMutation.mutate({
      title: newTitle.trim(),
      description: newDesc.trim(),
      xpReward: xpNum,
      difficulty: newDifficulty,
      deadline: new Date(newDeadline).toISOString(),
      status: 'active',
    });
  };

  const filtered = filter === 'all'
    ? challenges
    : challenges.filter(c => c.status.toLowerCase() === filter);

  // Stats
  const totalJoined = myParticipationMap.size;
  const totalCompleted = [...myParticipationMap.values()].filter(p => p.status === 'completed').length;
  const totalXpEarned = [...myParticipationMap.values()].reduce((s, p) => s + (p.xpAwarded || 0), 0);

  if (isLoadingChallenges) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-52" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load challenges"
        description={(error as any).message || 'Could not connect to the challenges service.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Challenges</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse active sustainability challenges and track your progress.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" />
          {isFormOpen ? 'Close' : 'New Challenge'}
        </Button>
      </div>

      {/* My Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Challenges Joined" value={totalJoined.toString()} />
        <StatCard title="Challenges Completed" value={totalCompleted.toString()} positive={totalCompleted > 0} />
        <StatCard title="XP Earned from Challenges" value={`${totalXpEarned} XP`} />
      </div>

      {/* Create Challenge Form */}
      {isFormOpen && (
        <Card className="p-5 border-primary/20 bg-primary/[0.01] space-y-4 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground">Create New Sustainability Challenge</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Challenge Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Zero Waste Week"
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Describe the challenge objectives, rules, and sustainability impact..."
                className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[72px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={e => setNewDifficulty(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">XP Reward</label>
                <input
                  type="number"
                  value={newXp}
                  onChange={e => setNewXp(e.target.value)}
                  min={10}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-destructive">{formError}</span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" loading={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Challenge'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {(['all', 'active', 'ongoing', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-2 text-xs font-semibold capitalize transition-all border-b-2 -mb-px ${
              filter === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground font-medium">
          {filtered.length} challenge{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Challenge Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No challenges found"
          description={filter === 'all' ? 'No challenges have been created yet.' : `No ${filter} challenges right now.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(challenge => {
            const myPart = myParticipationMap.get(challenge.id);
            const daysLeft = getDaysLeft(challenge.deadline);
            const isExpired = daysLeft < 0;
            const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty?.toLowerCase()] || DIFFICULTY_CONFIG.easy;
            const statusConfig = STATUS_CONFIG[challenge.status?.toLowerCase()] || STATUS_CONFIG.active;

            return (
              <Card key={challenge.id} className="flex flex-col gap-4 hover:shadow-md transition-all duration-200">
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold ${diffConfig.badge}`}>
                      {diffConfig.label}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold capitalize ${statusConfig.badge}`}>
                      {challenge.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{challenge.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{challenge.description}</p>
                </div>

                {/* Meta Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="font-semibold text-foreground">{challenge.xpReward} XP</span> reward
                    </span>
                    <span className={`flex items-center gap-1 ${isExpired ? 'text-destructive' : daysLeft <= 3 ? 'text-amber-600' : ''}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {isExpired ? 'Expired' : `${daysLeft}d left`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Target className="w-3 h-3" />
                    Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                  </div>
                </div>

                {/* Progress indicator (if joined) */}
                {myPart && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground capitalize font-medium">
                        Status: {myPart.status.replace('_', ' ')}
                      </span>
                      {myPart.xpAwarded > 0 && (
                        <span className="text-primary font-semibold">+{myPart.xpAwarded} XP earned</span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          myPart.status === 'completed' ? 'bg-emerald-500 w-full' : 'bg-primary w-1/2'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  {myPart ? (
                    <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                      myPart.status === 'completed' ? 'text-emerald-600' : 'text-primary'
                    }`}>
                      {myPart.status === 'completed'
                        ? <><CheckCircle2 className="w-4 h-4" /> Completed</>
                        : <><Flame className="w-4 h-4 animate-pulse" /> In Progress</>
                      }
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Open for participation
                    </span>
                  )}

                  {!myPart && !isExpired && (
                    <Button
                      onClick={() => joinMutation.mutate(challenge.id)}
                      loading={joinMutation.isPending && joinMutation.variables === challenge.id}
                      disabled={joinMutation.isPending || !currentUser}
                      className="h-7 text-xs px-3 flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" /> Join Challenge
                    </Button>
                  )}
                  {isExpired && !myPart && (
                    <span className="text-[10px] text-muted-foreground italic">Challenge closed</span>
                  )}
                  {myPart?.status === 'completed' && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                      <Trophy className="w-3.5 h-3.5" /> {myPart.xpAwarded} XP
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
