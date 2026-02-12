import { useState } from 'react';
import { useUpdateBookingStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { BookingStatus } from '../../backend';

interface BookingStatusActionsProps {
  bookingId: bigint;
  currentStatus: BookingStatus;
}

export default function BookingStatusActions({ bookingId, currentStatus }: BookingStatusActionsProps) {
  const updateStatus = useUpdateBookingStatus();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | ''>('');
  const [showConfirm, setShowConfirm] = useState(false);

  const getAvailableTransitions = (current: BookingStatus): BookingStatus[] => {
    switch (current) {
      case BookingStatus.requested:
        return [BookingStatus.accepted, BookingStatus.cancelled];
      case BookingStatus.accepted:
        return [BookingStatus.inProgress, BookingStatus.cancelled];
      case BookingStatus.inProgress:
        return [BookingStatus.completed, BookingStatus.cancelled];
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableTransitions(currentStatus);

  const handleUpdate = async () => {
    if (!selectedStatus) return;

    try {
      await updateStatus.mutateAsync({
        bookingId,
        status: selectedStatus,
      });
      toast.success('Status updated successfully');
      setShowConfirm(false);
      setSelectedStatus('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const formatStatus = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.requested: return 'Requested';
      case BookingStatus.accepted: return 'Accepted';
      case BookingStatus.inProgress: return 'In Progress';
      case BookingStatus.completed: return 'Completed';
      case BookingStatus.cancelled: return 'Cancelled';
      default: return status;
    }
  };

  if (availableStatuses.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          <CardDescription>Change the booking status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as BookingStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowConfirm(true)}
            disabled={!selectedStatus || updateStatus.isPending}
            className="w-full"
          >
            {updateStatus.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status to "{selectedStatus ? formatStatus(selectedStatus) : ''}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
