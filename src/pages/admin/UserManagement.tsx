import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, UserCheck, UserX, Shield, RefreshCw } from 'lucide-react';

interface Profile {
  id: string;
  email: string | null;
  status: string;
  created_at: string;
}

export const UserManagementPanel = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load users');
      console.error(error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const updateStatus = async (userId: string, newStatus: string) => {
    setActionLoading(userId);

    // Update profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) {
      toast.error('Failed to update user status');
      setActionLoading(null);
      return;
    }

    // If approving, also grant the admin role
    if (newStatus === 'approved') {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' as const }, { onConflict: 'user_id,role' });

      if (roleError) {
        toast.error('Status updated but failed to grant admin role');
        console.error(roleError);
      } else {
        toast.success('User approved and granted admin access');
      }
    } else if (newStatus === 'denied') {
      // Remove admin role if denying
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin' as const);

      if (roleError) {
        console.error('Failed to remove role:', roleError);
      }
      toast.success('User access denied');
    }

    setActionLoading(null);
    fetchProfiles();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const pendingUsers = profiles.filter(p => p.status === 'pending');
  const otherUsers = profiles.filter(p => p.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">User Management</h2>
        <Button variant="outline" size="sm" onClick={fetchProfiles}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {pendingUsers.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              Pending Approval ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.email || 'N/A'}</TableCell>
                    <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(profile.id, 'approved')}
                        disabled={actionLoading === profile.id}
                      >
                        {actionLoading === profile.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserCheck className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(profile.id, 'denied')}
                        disabled={actionLoading === profile.id}
                      >
                        <UserX className="w-4 h-4 mr-1" /> Deny
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {otherUsers.length === 0 && pendingUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherUsers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.email || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(profile.status)}</TableCell>
                    <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      {profile.status === 'denied' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(profile.id, 'approved')}
                          disabled={actionLoading === profile.id}
                        >
                          <UserCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      )}
                      {profile.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(profile.id, 'denied')}
                          disabled={actionLoading === profile.id}
                        >
                          <UserX className="w-4 h-4 mr-1" /> Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
