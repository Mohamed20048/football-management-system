import { motion } from 'framer-motion';
import { StandingRow } from '@/types/football';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StandingsPreviewProps {
  standings: StandingRow[];
}

export function StandingsPreview({ standings }: StandingsPreviewProps) {
  const topTeams = standings.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">League Table</h3>
        <Link to="/standings" className="text-primary text-sm flex items-center gap-1 hover:underline">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left p-3 w-10">#</th>
              <th className="text-left p-3">Team</th>
              <th className="text-center p-3 w-12">P</th>
              <th className="text-center p-3 w-12">GD</th>
              <th className="text-center p-3 w-12">PTS</th>
            </tr>
          </thead>
          <tbody>
            {topTeams.map((row, index) => (
              <motion.tr
                key={row.team_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
              >
                <td className="p-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="p-3 font-medium">{row.team}</td>
                <td className="p-3 text-center text-muted-foreground">{row.P}</td>
                <td className={`p-3 text-center ${
                  row.GD > 0 ? 'text-primary' : row.GD < 0 ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {row.GD > 0 ? '+' : ''}{row.GD}
                </td>
                <td className="p-3 text-center font-bold">{row.PTS}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
