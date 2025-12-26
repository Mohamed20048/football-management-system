
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import { mockTeams } from '@/data/mockData';
import { useRole } from '@/contexts/RoleContext';
import { Player, PlayerPosition } from '@/types/football';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, Goal, CircleDot, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PlayerFormDialog } from '@/components/players/PlayerFormDialog';
import { useToast } from '@/hooks/use-toast';
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

const positionColors: Record<PlayerPosition, string> = {
  GK: 'bg-warning/20 text-warning border-warning/30',
  DF: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MF: 'bg-primary/20 text-primary border-primary/30',
  FW: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function Players() {
  const { canManagePlayers } = useRole();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [teams, setTeams] = useState<{ id: number; name: string }[]>([]);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          *,
          teams (
            name
          )
        `);

      if (playersError) throw playersError;

      // Type definition for the join result
      type PlayerWithTeam = Player & {
        teams: {
          name: string;
        } | null;
      };

      const formattedPlayers: Player[] = (playersData as unknown as PlayerWithTeam[]).map(p => ({
        ...p,
        team_name: p.teams?.name
      }));

      setPlayers(formattedPlayers);
    } catch (error) {
      toast({
        title: 'Error fetching players',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('id, name');
    if (data) setTeams(data);
  };

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddClick = () => {
    setEditingPlayer(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!playerToDelete) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerToDelete.id);

      if (error) throw error;

      toast({ title: 'Player deleted successfully' });
      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: 'Error deleting player',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPlayerToDelete(null);
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === 'all' || player.position === positionFilter;
    const matchesTeam = teamFilter === 'all' || player.team_id === parseInt(teamFilter);
    return matchesSearch && matchesPosition && matchesTeam;
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Players"
        description="View and manage all registered players"
        action={
          canManagePlayers && (
            <Button className="gap-2" onClick={handleAddClick}>
              <Plus className="w-4 h-4" />
              Add Player
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            <SelectItem value="GK">Goalkeeper</SelectItem>
            <SelectItem value="DF">Defender</SelectItem>
            <SelectItem value="MF">Midfielder</SelectItem>
            <SelectItem value="FW">Forward</SelectItem>
          </SelectContent>
        </Select>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map(team => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Players Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="table-header border-border/50">
              <TableHead className="font-semibold">Player</TableHead>
              <TableHead className="font-semibold">Position</TableHead>
              <TableHead className="font-semibold">Team</TableHead>
              <TableHead className="text-center font-semibold">Age</TableHead>
              <TableHead className="text-center font-semibold">
                <Goal className="w-4 h-4 inline" />
              </TableHead>
              <TableHead className="text-center font-semibold">
                <CircleDot className="w-4 h-4 inline" />
              </TableHead>
              <TableHead className="text-center font-semibold">
                <AlertTriangle className="w-4 h-4 inline text-warning" />
              </TableHead>
              {canManagePlayers && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading players...
                </TableCell>
              </TableRow>
            ) : filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No players found
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player, index) => (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium">
                        {player.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{player.full_name}</div>
                        <div className="text-xs text-muted-foreground">{player.nationality}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={positionColors[player.position]}>
                      {player.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{player.team_name}</TableCell>
                  <TableCell className="text-center">{player.age}</TableCell>
                  <TableCell className="text-center font-bold text-primary">{player.goals}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{player.assists}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-warning">{player.yellow_cards}</span>
                    {player.red_cards > 0 && (
                      <span className="text-destructive ml-1">/ {player.red_cards}</span>
                    )}
                  </TableCell>
                  {canManagePlayers && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditClick(player)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteClick(player)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <PlayerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        playerToEdit={editingPlayer}
        onSuccess={fetchPlayers}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the player
              "{playerToDelete?.full_name}" from the database.
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
