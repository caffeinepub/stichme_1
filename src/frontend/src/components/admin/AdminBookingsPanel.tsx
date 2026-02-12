import { useState } from 'react';
import { useAdminAssignTailorToBooking, useSetEstimatedPrice } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Booking, TailorProfile, BookingStatus } from '../../backend';

interface AdminBookingsPanelProps {
  bookings: Booking[];
  tailors: TailorProfile[];
  isLoading: boolean;
}

export default function AdminBookingsPanel({ bookings, tailors, isLoading }: AdminBookingsPanelProps) {
  const assignTailor = useAdminAssignTailorToBooking();
  const setPrice = useSetEstimatedPrice();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedTailorId, setSelectedTailorId] = useState<string>('');
  const [priceBooking, setPriceBooking] = useState<Booking | null>(null);
  const [newPrice, setNewPrice] = useState('');

  const handleAssignTailor = async () => {
    if (!selectedBooking || !selectedTailorId) return;

    try {
      await assignTailor.mutateAsync({
        bookingId: selectedBooking.id,
        tailorId: BigInt(selectedTailorId),
      });
      toast.success('Tailor assigned successfully');
      setSelectedBooking(null);
      setSelectedTailorId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign tailor');
    }
  };

  const handleSetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceBooking) return;

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await setPrice.mutateAsync({
        bookingId: priceBooking.id,
        price: BigInt(Math.round(price)),
      });
      toast.success('Price set successfully');
      setPriceBooking(null);
      setNewPrice('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to set price');
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'requested': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'accepted': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'inProgress': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'completed': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      case 'cancelled': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const formatStatus = (status: BookingStatus) => {
    switch (status) {
      case 'requested': return 'Requested';
      case 'accepted': return 'Accepted';
      case 'inProgress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>Manage all bookings in the system</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="inProgress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bookings found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tailor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const tailor = booking.tailor 
                      ? tailors.find(t => t.owner.toString() === booking.tailor?.toString())
                      : null;

                    return (
                      <TableRow key={booking.id.toString()}>
                        <TableCell className="font-mono text-sm">#{booking.id.toString()}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(Number(booking.dateTime) / 1_000_000).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {formatStatus(booking.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {tailor ? tailor.name : 'Unassigned'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {booking.estimatedPrice ? `$${Number(booking.estimatedPrice)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.hash = `/booking/${booking.id}`}
                            >
                              View
                            </Button>
                            {!booking.tailor && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                Assign
                              </Button>
                            )}
                            {!booking.estimatedPrice && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPriceBooking(booking)}
                              >
                                Set Price
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Tailor Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tailor to Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Tailor</Label>
              <Select value={selectedTailorId} onValueChange={setSelectedTailorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tailor" />
                </SelectTrigger>
                <SelectContent>
                  {tailors.filter(t => t.isActive).map((tailor) => (
                    <SelectItem key={tailor.id.toString()} value={tailor.id.toString()}>
                      {tailor.name} - {tailor.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAssignTailor} disabled={!selectedTailorId || assignTailor.isPending}>
                {assignTailor.isPending ? 'Assigning...' : 'Assign Tailor'}
              </Button>
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Price Dialog */}
      <Dialog open={!!priceBooking} onOpenChange={(open) => !open && setPriceBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Estimated Price</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetPrice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={setPrice.isPending}>
                {setPrice.isPending ? 'Setting...' : 'Set Price'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setPriceBooking(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
