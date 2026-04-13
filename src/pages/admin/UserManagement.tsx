import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, UserCheck, UserX, Shield, RefreshCw, Crown } from 'lucide-react';

interface Profile {
  id: string;
  email: string | null;
  status: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

export const UserManagementPanel = () => {
  const { isSuperAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
    ]);

    if (profilesRes.error) {
      toast.error('Failed to load users');
      console.error(profilesRes.error);
    } else {
      setProfiles(profilesRes.data || []);
    }

    if (!rolesRes.error) {
      setUserRoles(rolesRes.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || null;
  };

  const updateStatus = async (userId: string, newStatus: string) => {
    setActionLoading(userId);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) {
      toast.error('Failed to update user status');
      setActionLoading(null);
      return;
    }

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

  const promoteToSuperAdmin = async (userId: string) => {
    setActionLoading(userId);

    // Remove existing admin role and add super_admin
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin' as const);
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'super_admin' as const }, { onConflict: 'user_id,role' });

    if (error) {
      toast.error('Failed to promote to super admin');
      console.error(error);
    } else {
      toast.success('User promoted to super admin');
    }

    setActionLoading(null);
    fetchProfiles();
  };

  const demoteFromSuperAdmin = async (userId: string) => {
    setActionLoading(userId);

    await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'super_admin' as const);
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' as const }, { onConflict: 'user_id,role' });

    if (error) {
      toast.error('Failed to demote from super admin');
      console.error(error);
    } else {
      toast.success('User demoted to admin');
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

  const getRoleBadge = (userId: string) => {
    const role = getUserRole(userId);
    if (role === 'super_admin') {
      return <Badge className="bg-purple-600 hover:bg-purple-700 ml-2"><Crown className="w-3 h-3 mr-1" /> Super Admin</Badge>;
    }
    if (role === 'admin') {
      return <Badge className="bg-blue-600 hover:bg-blue-700 ml-2"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
    }
    return null;
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
                  <TableHead>Role</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherUsers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.email || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(profile.status)}</TableCell>
                    <TableCell>{getRoleBadge(profile.id)}</TableCell>
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
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(profile.id, 'denied')}
                            disabled={actionLoading === profile.id}
                          >
                            <UserX className="w-4 h-4 mr-1" /> Revoke
                          </Button>
                          {isSuperAdmin && getUserRole(profile.id) === 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                              onClick={() => promoteToSuperAdmin(profile.id)}
                              disabled={actionLoading === profile.id}
                            >
                              <Crown className="w-4 h-4 mr-1" /> Promote to Super Admin
                            </Button>
                          )}
                          {isSuperAdmin && getUserRole(profile.id) === 'super_admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                              onClick={() => demoteFromSuperAdmin(profile.id)}
                              disabled={actionLoading === profile.id}
                            >
                              <Shield className="w-4 h-4 mr-1" /> Demote to Admin
                            </Button>
                          )}
                        </>
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
