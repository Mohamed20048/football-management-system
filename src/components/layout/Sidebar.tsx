import { NavLink } from '@/components/NavLink';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Calendar,
  Radio,
  Trophy,
  Shield,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teams', icon: Shield, label: 'Teams' },
  { to: '/players', icon: Users, label: 'Players' },
  { to: '/matches', icon: Calendar, label: 'Matches' },
  { to: '/live', icon: Radio, label: 'Live' },
  { to: '/standings', icon: Trophy, label: 'Standings' },
];

const roleIcons: Record<string, string> = {
  spectator: '👁️',
  coach: '📋',
  referee: '🎯',
  admin: '⚡',
};

export function Sidebar() {
  const { role } = useRole();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-xl">⚽</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">FootballPro</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>

      {/* Role Display */}
      <div className="p-4 border-b border-sidebar-border">
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          Your Role
        </label>
        <div className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent rounded-lg">
          <span className="text-lg">{roleIcons[role] || '👁️'}</span>
          <span className="font-medium capitalize">{role}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="nav-link"
            activeClassName="active"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Sign Out */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 px-4 py-2 text-muted-foreground">
          <UserCircle className="w-5 h-5" />
          <span className="text-sm truncate flex-1">{user?.email}</span>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
