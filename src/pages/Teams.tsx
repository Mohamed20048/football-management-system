
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { useRole } from '@/contexts/RoleContext';
import { Team } from '@/types/football';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, User, Calendar, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TeamDialog } from '@/components/teams/TeamDialog';
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

export function Teams() {
  const { canManageTeams } = useRole();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;

      setTeams(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching teams',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = (team: Team) => {
    setEditingTeam(team);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!teamToDelete) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamToDelete.id);

      if (error) throw error;

      toast({ title: 'Team deleted successfully' });
      fetchTeams();
    } catch (error) {
      toast({
        title: 'Error deleting team',
        description: 'Please ensure team has no related players or matches before deleting.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Teams"
        description="Manage all football teams in the system"
        action={
          canManageTeams && (
            <Button className="gap-2" onClick={() => {
              setEditingTeam(null);
              setIsFormOpen(true);
            }}>
              <Plus className="w-4 h-4" />
              Add Team
            </Button>
          )
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading teams...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass-card-hover p-6 group relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-2xl font-display font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  {team.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-semibold truncate">{team.name}</h3>
                  {team.coach_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <User className="w-4 h-4" />
                      <span>{team.coach_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                {team.stadium && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate">{team.stadium}</span>
                  </div>
                )}
                {team.founded_year && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>Est. {team.founded_year}</span>
                  </div>
                )}
              </div>

              {canManageTeams && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-1 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(team)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(team)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <TeamDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        teamToEdit={editingTeam}
        onSuccess={fetchTeams}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this team.
              Note: You cannot delete a team that has players or matches associated with it.
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
