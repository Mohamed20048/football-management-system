import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { mockStandings, mockCompetitions } from '@/data/mockData';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function Standings() {
  const [competition, setCompetition] = useState('1');

  return (
    <div className="p-8">
      <PageHeader
        title="League Standings"
        description="View current league table and team positions"
        action={
          <Select value={competition} onValueChange={setCompetition}>
            <SelectTrigger className="w-[200px] bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockCompetitions.map(comp => (
                <SelectItem key={comp.id} value={comp.id.toString()}>
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="table-header border-border/50">
              <TableHead className="w-12 font-semibold">#</TableHead>
              <TableHead className="font-semibold">Team</TableHead>
              <TableHead className="text-center font-semibold w-16">P</TableHead>
              <TableHead className="text-center font-semibold w-16">W</TableHead>
              <TableHead className="text-center font-semibold w-16">D</TableHead>
              <TableHead className="text-center font-semibold w-16">L</TableHead>
              <TableHead className="text-center font-semibold w-16">GF</TableHead>
              <TableHead className="text-center font-semibold w-16">GA</TableHead>
              <TableHead className="text-center font-semibold w-16">GD</TableHead>
              <TableHead className="text-center font-semibold w-16">PTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStandings.map((row, index) => (
              <motion.tr
                key={row.team_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border-border/30 hover:bg-secondary/30 transition-colors ${
                  index < 3 ? 'bg-primary/5' : 
                  index >= mockStandings.length - 2 ? 'bg-destructive/5' : ''
                }`}
              >
                <TableCell>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-warning text-warning-foreground' :
                    index === 1 ? 'bg-muted-foreground/60 text-foreground' :
                    index === 2 ? 'bg-orange-600/60 text-foreground' :
                    index < 4 ? 'bg-primary/20 text-primary' :
                    index >= mockStandings.length - 2 ? 'bg-destructive/20 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-display font-bold text-lg">
                      {row.team.charAt(0)}
                    </div>
                    <span className="font-medium">{row.team}</span>
                    {index === 0 && <Trophy className="w-4 h-4 text-warning" />}
                  </div>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">{row.P}</TableCell>
                <TableCell className="text-center font-medium text-primary">{row.W}</TableCell>
                <TableCell className="text-center text-muted-foreground">{row.D}</TableCell>
                <TableCell className="text-center text-destructive">{row.L}</TableCell>
                <TableCell className="text-center">{row.GF}</TableCell>
                <TableCell className="text-center text-muted-foreground">{row.GA}</TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center gap-1 ${
                    row.GD > 0 ? 'text-primary' : row.GD < 0 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {row.GD > 0 ? <TrendingUp className="w-3 h-3" /> : 
                     row.GD < 0 ? <TrendingDown className="w-3 h-3" /> : 
                     <Minus className="w-3 h-3" />}
                    {row.GD > 0 ? '+' : ''}{row.GD}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-display text-xl font-bold">{row.PTS}</span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20" />
          <span>Champions League</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20" />
          <span>Relegation Zone</span>
        </div>
      </motion.div>
    </div>
  );
}
