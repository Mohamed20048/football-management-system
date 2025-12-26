import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/dashboard/StatCard';
import { LiveMatchCard } from '@/components/dashboard/LiveMatchCard';
import { TopScorersCard } from '@/components/dashboard/TopScorersCard';
import { StandingsPreview } from '@/components/dashboard/StandingsPreview';
import { mockTeams, mockPlayers, mockMatches, mockStandings } from '@/data/mockData';
import { useRole } from '@/contexts/RoleContext';
import { Users, Shield, Calendar, Goal, Radio } from 'lucide-react';
import heroStadium from '@/assets/hero-stadium.jpg';

export function Dashboard() {
  const { role } = useRole();
  
  const liveMatches = mockMatches.filter(m => m.status === 'IN_PLAY');
  const upcomingMatches = mockMatches
    .filter(m => m.status === 'SCHEDULED')
    .slice(0, 3);
  const recentMatches = mockMatches
    .filter(m => m.status === 'FINISHED')
    .slice(0, 2);

  const totalGoals = mockPlayers.reduce((sum, p) => sum + p.goals, 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroStadium} 
          alt="Football stadium" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="absolute inset-0 flex items-center px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl font-bold mb-2">
              Welcome back, <span className="gradient-text capitalize">{role}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your football world from one place
            </p>
          </motion.div>
        </div>
      </div>

      <div className="p-8 -mt-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Teams"
            value={mockTeams.length}
            icon={Shield}
            trend="up"
            delay={0}
          />
          <StatCard
            title="Total Players"
            value={mockPlayers.length}
            subtitle="Across all teams"
            icon={Users}
            delay={0.1}
          />
          <StatCard
            title="Matches Played"
            value={mockMatches.filter(m => m.status === 'FINISHED').length}
            icon={Calendar}
            delay={0.2}
          />
          <StatCard
            title="Goals Scored"
            value={totalGoals}
            subtitle="This season"
            icon={Goal}
            trend="up"
            delay={0.3}
          />
        </div>

        {/* Live Matches Section */}
        {liveMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <span className="absolute inline-flex h-full w-full rounded-full bg-destructive animate-ping opacity-75"></span>
                <Radio className="w-5 h-5 text-destructive relative" />
              </div>
              <h2 className="font-display text-xl font-semibold">Live Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMatches.map((match, index) => (
                <LiveMatchCard key={match.id} match={match} delay={index * 0.1} />
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Upcoming Fixtures</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMatches.map((match, index) => (
                <LiveMatchCard key={match.id} match={match} delay={0.2 + index * 0.1} />
              ))}
              {recentMatches.map((match, index) => (
                <LiveMatchCard key={match.id} match={match} delay={0.4 + index * 0.1} />
              ))}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            <TopScorersCard players={mockPlayers} />
            <StandingsPreview standings={mockStandings} />
          </div>
        </div>
      </div>
    </div>
  );
}
