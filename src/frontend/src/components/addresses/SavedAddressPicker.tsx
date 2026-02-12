import { useState } from 'react';
import { useGetMySavedAddresses, useSaveAddress, useDeleteSavedAddress } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SavedAddressPickerProps {
  onSelectAddress: (address: string) => void;
}

export default function SavedAddressPicker({ onSelectAddress }: SavedAddressPickerProps) {
  const { data: addresses = [] } = useGetMySavedAddresses();
  const saveAddress = useSaveAddress();
  const deleteAddress = useDeleteSavedAddress();

  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLabel.trim() || !newAddress.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await saveAddress.mutateAsync({
        addressLabel: newLabel.trim(),
        address: newAddress.trim(),
      });
      toast.success('Address saved!');
      setShowAddForm(false);
      setNewLabel('');
      setNewAddress('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save address');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteAddress.mutateAsync(deleteId);
      toast.success('Address deleted');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="icon">
            <MapPin className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Saved Addresses</DialogTitle>
          </DialogHeader>

          {!showAddForm ? (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No saved addresses yet
                </p>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <div key={addr.id.toString()} className="flex items-start gap-2 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{addr.addressLabel}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{addr.address}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onSelectAddress(addr.address);
                            setOpen(false);
                            toast.success('Address selected');
                          }}
                        >
                          Use
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(addr.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Home, Office"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newAddress">Address</Label>
                <Textarea
                  id="newAddress"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Enter full address"
                  required
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saveAddress.isPending}>
                  {saveAddress.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
