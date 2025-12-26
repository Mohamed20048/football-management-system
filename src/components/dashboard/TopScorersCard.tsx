import { motion } from 'framer-motion';
import { Player } from '@/types/football';
import { Trophy } from 'lucide-react';

interface TopScorersCardProps {
  players: Player[];
}

export function TopScorersCard({ players }: TopScorersCardProps) {
  const topScorers = [...players]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-4 border-b border-border/50 flex items-center gap-3">
        <Trophy className="w-5 h-5 text-warning" />
        <h3 className="font-display text-lg font-semibold">Top Scorers</h3>
      </div>
      <div className="divide-y divide-border/30">
        {topScorers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              index === 0 ? 'bg-warning text-warning-foreground' :
              index === 1 ? 'bg-muted-foreground/50 text-foreground' :
              index === 2 ? 'bg-orange-600/50 text-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{player.full_name}</div>
              <div className="text-xs text-muted-foreground">{player.team_name}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-bold text-primary">{player.goals}</div>
              <div className="text-xs text-muted-foreground">goals</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
