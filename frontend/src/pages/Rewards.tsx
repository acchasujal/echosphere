import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card, StatCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Skeleton, EmptyState } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';
import { Award, Gift, Bell, Trophy, Sparkles, Check, CheckCircle2, Trash2 } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  role: string;
  xp: number;
  points: number;
  department?: {
    name: string;
  };
}

interface Badge {
  id: number;
  name: string;
  description: string;
  xpRequired: number;
  icon: string;
  employees: Array<{
    employeeId: number;
  }>;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
}

interface Notification {
  id: number;
  employeeId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export const Rewards: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 1. Fetch Employees (for current user context and leaderboard)
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data.data || res.data || [];
    },
  });

  const currentUser = employees[0]; // Simulate active logged-in employee

  // 2. Fetch Badges
  const { data: badges = [], isLoading: isLoadingBadges } = useQuery<Badge[]>({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await api.get('/badges');
      return res.data.data || res.data || [];
    },
  });

  // 3. Fetch Rewards Catalog
  const { data: rewards = [], isLoading: isLoadingRewards } = useQuery<Reward[]>({
    queryKey: ['rewards'],
    queryFn: async () => {
      const res = await api.get('/rewards');
      return res.data.data || res.data || [];
    },
  });

  // 4. Fetch User Notifications
  const { data: notifications = [], isLoading: isLoadingNotifs } = useQuery<Notification[]>({
    queryKey: ['notifications', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const res = await api.get(`/notifications/employee/${currentUser.id}`);
      return res.data.data || res.data || [];
    },
  });

  // Mutations
  const evaluateBadgesMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/badges/award/${currentUser.id}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUser?.id] });
      const count = data.data?.awarded?.length || 0;
      if (count > 0) {
        toast(`Congratulations! You earned ${count} new badge(s)!`, 'success');
      } else {
        toast('No new badges awarded at this time. Keep earning XP!', 'info');
      }
    },
    onError: (err: any) => {
      toast(err.message || 'Evaluation failed.', 'error');
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const res = await api.post(`/rewards/${rewardId}/redeem`, {
        employeeId: currentUser.id,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Reward redeemed successfully! check your notifications.', 'success');
    },
    onError: (err: any) => {
      toast(err.message || 'Redemption failed.', 'error');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch(`/notifications/${id}`, {
        isRead: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUser?.id] });
      toast('Notification marked as read.', 'success');
    },
    onError: (err: any) => {
      toast(err.message || 'Operation failed.', 'error');
    },
  });

  const deleteNotifMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUser?.id] });
      toast('Notification removed.', 'success');
    },
    onError: (err: any) => {
      toast(err.message || 'Deletion failed.', 'error');
    },
  });

  // Ranks sorting for Leaderboard
  const sortedLeaderboard = [...employees].sort((a, b) => b.xp - a.xp);

  const columns = [
    { 
      header: 'Rank', 
      accessor: (_row: any) => null, // filled programmatically or using index
      className: 'w-12 text-center font-bold text-muted-foreground'
    },
    { header: 'Employee', accessor: 'name' },
    { 
      header: 'Department', 
      accessor: (row: Employee) => row.department?.name || 'Staff' 
    },
    { 
      header: 'Role', 
      accessor: (row: Employee) => <span className="capitalize">{row.role}</span>
    },
    { 
      header: 'XP Points', 
      accessor: (row: Employee) => <span className="font-mono font-semibold text-primary">{row.xp} XP</span>,
      align: 'right' as const
    },
  ];

  // Map indexes for columns
  const tableDataWithRank = sortedLeaderboard.map((emp, index) => ({
    ...emp,
    rank: index + 1
  }));

  const columnsMapped = [
    { 
      header: 'Rank', 
      accessor: (row: any) => (
        <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full text-xs font-semibold
          ${row.rank === 1 ? 'bg-amber-100 text-amber-800' : 
            row.rank === 2 ? 'bg-slate-100 text-slate-800' : 
            row.rank === 3 ? 'bg-orange-100 text-orange-800' : 
            'text-muted-foreground'}`}>
          {row.rank}
        </span>
      ),
      align: 'center' as const
    },
    ...columns.slice(1)
  ];

  if (isLoadingEmployees || isLoadingBadges || isLoadingRewards) {
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

  // Count active employee earned badges
  const earnedBadgesCount = badges.filter(badge => 
    badge.employees?.some(eb => eb.employeeId === currentUser?.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Gamification & Rewards</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track your points, earn system badges, and redeem sustainability coupons.</p>
        </div>
        <Button 
          onClick={() => evaluateBadgesMutation.mutate()} 
          loading={evaluateBadgesMutation.isPending}
          disabled={evaluateBadgesMutation.isPending || !currentUser}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Evaluate My Badges
        </Button>
      </div>

      {/* Stats row */}
      {currentUser && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard 
            title="Spendable Points" 
            value={`${currentUser.points} pts`} 
          />
          <StatCard 
            title="Total Experience" 
            value={`${currentUser.xp} XP`} 
          />
          <StatCard 
            title="Badges Unlocked" 
            value={`${earnedBadgesCount} / ${badges.length}`} 
            positive={earnedBadgesCount === badges.length}
          />
        </div>
      )}

      {/* Main Grid: Badges + Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Badges Display */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-muted-foreground" /> Achievements & Badges
          </h2>
          {badges.length === 0 ? (
            <EmptyState title="No badges defined" description="Achievements are currently offline." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => {
                const isEarned = badge.employees?.some(eb => eb.employeeId === currentUser?.id);
                return (
                  <Card key={badge.id} className={`p-4 flex gap-3 items-center border transition-all duration-200
                    ${isEarned 
                      ? 'border-primary/20 bg-primary/[0.01] hover:shadow-xs' 
                      : 'border-border opacity-65 bg-secondary/20 hover:opacity-85'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300
                      ${isEarned ? 'bg-primary text-primary-foreground scale-100 rotate-0' : 'bg-muted text-muted-foreground scale-95'}`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-xs text-foreground truncate">{badge.name}</h3>
                        {isEarned ? (
                          <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-0.5 shrink-0">
                            <Check className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground font-semibold bg-muted px-1.5 py-0.5 rounded shrink-0">
                            {badge.xpRequired} XP Req
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{badge.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Sidebar */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-muted-foreground" /> Logged Notifications
          </h2>
          {isLoadingNotifs ? (
            <Skeleton className="h-48 w-full" />
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications" description="You have no notifications yet." />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-3 rounded-lg border text-xs flex justify-between gap-2.5 items-start
                  ${!notif.read ? 'bg-primary/[0.02] border-primary/25' : 'bg-card border-border'}`}>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{notif.message}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!notif.read && (
                      <button 
                        onClick={() => markReadMutation.mutate(notif.id)}
                        disabled={markReadMutation.isPending}
                        className="text-primary hover:underline font-semibold"
                        title="Mark Read"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotifMutation.mutate(notif.id)}
                      disabled={deleteNotifMutation.isPending}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Rewards Catalog & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rewards Catalog */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-muted-foreground" /> Rewards Catalog
          </h2>
          {rewards.length === 0 ? (
            <EmptyState title="No rewards catalog" description="Check back soon for sustainability rewards." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const canRedeem = currentUser && currentUser.points >= reward.pointsRequired && reward.stock > 0;
                return (
                  <Card key={reward.id} className="p-4 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm text-foreground">{reward.name}</h3>
                        <span className="font-mono text-xs font-bold text-primary shrink-0 bg-primary/5 px-2 py-0.5 rounded">
                          {reward.pointsRequired} pts
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{reward.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Stock: {reward.stock > 0 ? `${reward.stock} available` : 'Out of stock'}
                      </span>
                      <Button
                        onClick={() => redeemMutation.mutate(reward.id)}
                        disabled={redeemMutation.isPending || !canRedeem}
                        className="h-8 text-xs"
                        variant={canRedeem ? 'primary' : 'ghost'}
                      >
                        {reward.stock === 0 ? 'Out of Stock' : 'Redeem Coupon'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Full Leaderboard Table */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-muted-foreground" /> Employee Standings
          </h2>
          <DataTable columns={columnsMapped} data={tableDataWithRank} />
        </div>

      </div>
    </div>
  );
};
