import { useAdminActivateTailor, useAdminDeactivateTailor } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { TailorProfile } from '../../backend';

interface AdminTailorsPanelProps {
  tailors: TailorProfile[];
  isLoading: boolean;
}

export default function AdminTailorsPanel({ tailors, isLoading }: AdminTailorsPanelProps) {
  const activateTailor = useAdminActivateTailor();
  const deactivateTailor = useAdminDeactivateTailor();

  const handleToggleActive = async (tailorId: bigint, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateTailor.mutateAsync(tailorId);
        toast.success('Tailor deactivated');
      } else {
        await activateTailor.mutateAsync(tailorId);
        toast.success('Tailor activated');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tailor status');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tailors</CardTitle>
        <CardDescription>Manage tailor profiles and availability</CardDescription>
      </CardHeader>
      <CardContent>
        {tailors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No tailors found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Service Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tailors.map((tailor) => (
                  <TableRow key={tailor.id.toString()}>
                    <TableCell className="font-medium">{tailor.name}</TableCell>
                    <TableCell className="text-sm">{tailor.address}</TableCell>
                    <TableCell>
                      <Badge variant={tailor.isActive ? 'default' : 'secondary'}>
                        {tailor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                      {tailor.bio}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={tailor.isActive ? 'outline' : 'default'}
                        onClick={() => handleToggleActive(tailor.id, tailor.isActive)}
                        disabled={activateTailor.isPending || deactivateTailor.isPending}
                      >
                        {tailor.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
