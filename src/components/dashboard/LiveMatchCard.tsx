import { motion } from 'framer-motion';
import { Match } from '@/types/football';
import { Radio } from 'lucide-react';

interface LiveMatchCardProps {
  match: Match;
  delay?: number;
}

export function LiveMatchCard({ match, delay = 0 }: LiveMatchCardProps) {
  const isLive = match.status === 'IN_PLAY';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card-hover p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive && (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <span className="text-destructive text-sm font-semibold">LIVE</span>
            </>
          )}
          {match.status === 'SCHEDULED' && (
            <span className="text-muted-foreground text-sm">Upcoming</span>
          )}
          {match.status === 'FINISHED' && (
            <span className="text-muted-foreground text-sm">Full Time</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(match.date_time).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Match Content */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <div className="team-badge mx-auto mb-2 bg-primary/20 text-primary">
            {match.home_team.charAt(0)}
          </div>
          <div className="text-sm font-medium truncate">{match.home_team}</div>
        </div>

        {/* Score */}
        <div className="px-4">
          <div className={`score-display ${isLive ? 'text-primary animate-pulse-glow rounded-lg px-4 py-2' : ''}`}>
            {match.home_score} - {match.away_score}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <div className="team-badge mx-auto mb-2 bg-accent/20 text-accent">
            {match.away_team.charAt(0)}
          </div>
          <div className="text-sm font-medium truncate">{match.away_team}</div>
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <div className="mt-4 pt-3 border-t border-border/50 text-center">
          <span className="text-xs text-muted-foreground">{match.venue}</span>
        </div>
      )}
    </motion.div>
  );
}
