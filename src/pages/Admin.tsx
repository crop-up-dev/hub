import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getCurrentUser, updateUserRole, toggleUserActive, deleteUser, type AuthUser } from '@/lib/auth';
import { getAllTransactions, getPendingTransactions, approveTransaction, rejectTransaction, type TransactionRequest } from '@/lib/transactions';
import { formatNumber } from '@/lib/trading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, UserCheck, UserPlus, Shield, ShieldOff, Power, Trash2, CheckCircle2, XCircle, Clock, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'history'>('pending');
  const currentUser = getCurrentUser();

  const refresh = () => {
    setUsers(getAllUsers());
    setTransactions(getAllTransactions());
  };
  useEffect(() => { refresh(); }, []);

  const activeCount = users.filter(u => u.isActive).length;
  const recentCount = users.filter(u => u.createdAt > Date.now() - 7 * 86400000).length;
  const pendingTxns = transactions.filter(t => t.status === 'pending');
  const completedTxns = transactions.filter(t => t.status !== 'pending');

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

  const handleApprove = (txnId: string) => {
    approveTransaction(txnId, currentUser?.displayName || 'Admin');
    refresh();
    toast({ title: 'Transaction Approved' });
  };

  const handleReject = (txnId: string) => {
    rejectTransaction(txnId, currentUser?.displayName || 'Admin', 'Rejected by admin');
    refresh();
    toast({ title: 'Transaction Rejected', variant: 'destructive' });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4" />Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{users.length}</div></CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><UserCheck className="w-4 h-4" />Active</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-trading-green">{activeCount}</div></CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" />Pending Txns</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-primary">{pendingTxns.length}</div></CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><UserPlus className="w-4 h-4" />New (7d)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{recentCount}</div></CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {([
          { key: 'pending' as const, label: `Pending (${pendingTxns.length})`, icon: Clock },
          { key: 'history' as const, label: 'Txn History', icon: History },
          { key: 'users' as const, label: 'Users', icon: Users },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground glow-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pending Transactions */}
      {activeTab === 'pending' && (
        <Card className="glass-panel">
          <CardContent className="p-4">
            {pendingTxns.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-trading-green mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No pending transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTxns.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${txn.type === 'send' ? 'bg-trading-red/10' : 'bg-trading-green/10'}`}>
                        {txn.type === 'send' ? <ArrowUpRight className="w-5 h-5 text-trading-red" /> : <ArrowDownLeft className="w-5 h-5 text-trading-green" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {txn.type === 'send' ? 'Send' : 'Receive'} {txn.asset}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By: {txn.userName} ({txn.userEmail})
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(txn.createdAt).toLocaleString()} • To: {txn.address.slice(0, 16)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <p className="text-sm font-mono font-bold text-foreground">
                          {formatNumber(txn.amount, 6)} {txn.asset}
                        </p>
                        {txn.fee > 0 && (
                          <p className="text-[10px] text-muted-foreground">
                            Fee: {txn.fee} {txn.asset} • Net: {formatNumber(txn.netAmount, 6)}
                          </p>
                        )}
                      </div>
                      <Button size="sm" onClick={() => handleApprove(txn.id)} className="bg-trading-green hover:bg-trading-green/90 text-primary-foreground gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(txn.id)} className="gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {activeTab === 'history' && (
        <Card className="glass-panel">
          <CardContent className="p-0">
            {completedTxns.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No transaction history</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reviewed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTxns.map(txn => (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <Badge variant={txn.type === 'send' ? 'destructive' : 'default'} className="text-[10px]">
                          {txn.type === 'send' ? '↑ Send' : '↓ Receive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{txn.userName}</TableCell>
                      <TableCell className="font-mono text-sm">{txn.asset}</TableCell>
                      <TableCell className="font-mono text-sm">{formatNumber(txn.amount, 6)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{txn.fee} {txn.asset}</TableCell>
                      <TableCell>
                        <Badge variant={txn.status === 'approved' ? 'default' : 'destructive'}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{txn.reviewedBy || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
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
      )}
    </div>
  );
};

export default Admin;
