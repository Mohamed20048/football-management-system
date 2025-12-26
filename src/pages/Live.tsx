import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { LiveMatchCard } from '@/components/dashboard/LiveMatchCard';
import { mockMatches } from '@/data/mockData';
import { Radio, Tv } from 'lucide-react';

export function Live() {
  const liveMatches = mockMatches.filter(m => m.status === 'IN_PLAY');

  return (
    <div className="p-8">
      <PageHeader
        title="Live Matches"
        description="Watch real-time updates from ongoing matches"
      />

      {liveMatches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
            <Tv className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">No Live Matches</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            There are no matches currently in play. Check back later or view upcoming fixtures.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Live indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <div className="relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-destructive animate-ping opacity-75"></span>
              <Radio className="w-5 h-5 text-destructive relative" />
            </div>
            <span className="text-destructive font-medium">
              {liveMatches.length} match{liveMatches.length > 1 ? 'es' : ''} currently in play
            </span>
          </motion.div>

          {/* Live Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveMatches.map((match, index) => (
              <LiveMatchCard key={match.id} match={match} delay={index * 0.15} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
