import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole, userRoles } from '@/types/repas-cdl';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

export const SettingsTab = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, role');
            
            if (error) throw error;
            setProfiles(data as Profile[]);
        } catch (error) {
            showError("Impossible de charger la liste des utilisateurs.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);
            
            if (error) throw error;

            showSuccess("Le rôle de l'utilisateur a été mis à jour.");
            setProfiles(prevProfiles => 
                prevProfiles.map(p => p.id === userId ? { ...p, role: newRole } : p)
            );
        } catch (error) {
            showError("Erreur lors de la mise à jour du rôle.");
            console.error(error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Rôles Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Rôle</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profiles.map(profile => (
                                <TableRow key={profile.id}>
                                    <TableCell>{profile.first_name || 'N/A'} {profile.last_name || ''}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={profile.role}
                                            onValueChange={(value: UserRole) => handleRoleChange(profile.id, value)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Changer de rôle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userRoles.map(role => (
                                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};