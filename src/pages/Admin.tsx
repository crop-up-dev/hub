import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getCurrentUser, updateUserRole, toggleUserActive, deleteUser, type AuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, UserCheck, UserPlus, Shield, ShieldOff, Power, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const currentUser = getCurrentUser();

  const refresh = () => setUsers(getAllUsers());
  useEffect(() => { refresh(); }, []);

  const activeCount = users.filter(u => u.isActive).length;
  const recentCount = users.filter(u => u.createdAt > Date.now() - 7 * 86400000).length;

  const handleToggleRole = (user: AuthUser) => {
    if (user.id === currentUser?.id) return;
    updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin');
    refresh();
    toast({ title: 'Role Updated' });
  };

  const handleToggleActive = (user: AuthUser) => {
    if (user.id === currentUser?.id) return;
    toggleUserActive(user.id);
    refresh();
    toast({ title: user.isActive ? 'User Deactivated' : 'User Activated' });
  };

  const handleDelete = (user: AuthUser) => {
    if (user.id === currentUser?.id) return;
    deleteUser(user.id);
    refresh();
    toast({ title: 'User Deleted', variant: 'destructive' });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4" />Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{users.length}</div></CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><UserCheck className="w-4 h-4" />Active Users</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-trading-green">{activeCount}</div></CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><UserPlus className="w-4 h-4" />New (7 days)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-primary">{recentCount}</div></CardContent>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.displayName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id !== currentUser?.id && (
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleRole(user)} title="Toggle role">
                          {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(user)} title="Toggle active">
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user)} title="Delete user" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
