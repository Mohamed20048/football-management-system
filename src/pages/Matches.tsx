
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { LiveMatchCard } from '@/components/dashboard/LiveMatchCard';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Match, Team } from '@/types/football';
import { useToast } from '@/hooks/use-toast';
import { MatchDialog } from '@/components/matches/MatchDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Database } from '@/integrations/supabase/types';

type MatchStatus = Database["public"]["Enums"]["app_role"] | "SCHEDULED" | "IN_PLAY" | "FINISHED";

export function Matches() {
  const { canManageMatches } = useRole();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      console.log("Fetching matches...");
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .order('date_time', { ascending: true });

      if (error) throw error;

      // Transform data to match Match interface
      const formattedMatches: Match[] = (data || []).map(m => ({
        id: m.id,
        home_team_id: m.home_team_id,
        away_team_id: m.away_team_id,
        home_score: m.home_score,
        away_score: m.away_score,
        date_time: m.date_time,
        venue: m.venue || undefined,
        status: m.status as Match['status'],
        // Flattened structure for UI:
        home_team: (m.home_team as unknown as { name: string } | null)?.name || 'Unknown Team',
        away_team: (m.away_team as unknown as { name: string } | null)?.name || 'Unknown Team',
      }));

      console.log("Formatted Matches:", formattedMatches); // Debug log
      setMatches(formattedMatches);
    } catch (error) {
      toast({
        title: 'Error fetching matches',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = (match: Match) => {
    setEditingMatch(match);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (match: Match) => {
    setMatchToDelete(match);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!matchToDelete) return;

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchToDelete.id);

      if (error) throw error;

      toast({ title: 'Match deleted successfully' });
      fetchMatches();
    } catch (error) {
      toast({
        title: 'Error deleting match',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setMatchToDelete(null);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const groupedMatches = {
    live: filteredMatches.filter(m => m.status === 'IN_PLAY'),
    upcoming: filteredMatches.filter(m => m.status === 'SCHEDULED'),
    finished: filteredMatches.filter(m => m.status === 'FINISHED'),
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Matches"
        description="View all matches and fixtures"
        action={
          canManageMatches && (
            <Button className="gap-2" onClick={() => {
              setEditingMatch(null);
              setIsFormOpen(true);
            }}>
              <Plus className="w-4 h-4" />
              Schedule Match
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {['all', 'SCHEDULED', 'IN_PLAY', 'FINISHED'].map((status) => (
          <Badge
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${filter === status
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary'
              }`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' :
              status === 'IN_PLAY' ? 'Live' :
                status === 'SCHEDULED' ? 'Upcoming' : 'Finished'}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading matches...</div>
      ) : (
        <>
          {/* Live Matches */}
          {groupedMatches.live.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </span>
                <h2 className="font-display text-xl font-semibold">Live Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedMatches.live.map((match, index) => (
                  <div key={match.id} className="relative group">
                    <LiveMatchCard match={match} delay={index * 0.1} />
                    {canManageMatches && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-1 flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditClick(match)}>✏️</Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteClick(match)}>🗑️</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Matches */}
          {groupedMatches.upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-xl font-semibold mb-4">Upcoming Fixtures</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedMatches.upcoming.map((match, index) => (
                  <div key={match.id} className="relative group">
                    <LiveMatchCard match={match} delay={0.2 + index * 0.1} />
                    {canManageMatches && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-1 flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditClick(match)}>✏️</Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteClick(match)}>🗑️</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finished Matches */}
          {groupedMatches.finished.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Recent Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedMatches.finished.map((match, index) => (
                  <div key={match.id} className="relative group">
                    <LiveMatchCard match={match} delay={0.3 + index * 0.1} />
                    {canManageMatches && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-1 flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditClick(match)}>✏️</Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteClick(match)}>🗑️</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <MatchDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        matchToEdit={editingMatch}
        onSuccess={fetchMatches}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this match record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
