import { useState } from 'react';
import { useGetMyCustomerBookings, useCreateBooking, useGetAllTailorProfiles } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';
import SavedAddressPicker from '../../components/addresses/SavedAddressPicker';
import type { BookingStatus } from '../../backend';

export default function CustomerBookingsPage() {
  const { data: bookings = [], isLoading: bookingsLoading } = useGetMyCustomerBookings();
  const { data: tailors = [] } = useGetAllTailorProfiles();
  const createBooking = useCreateBooking();

  const [showForm, setShowForm] = useState(false);
  const [address, setAddress] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [selectedTailor, setSelectedTailor] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }

    if (!dateTime) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      const dateTimeNanos = BigInt(new Date(dateTime).getTime()) * BigInt(1_000_000);
      const tailorId = selectedTailor ? BigInt(selectedTailor) : null;

      await createBooking.mutateAsync({
        address: address.trim(),
        dateTime: dateTimeNanos,
        tailorId,
      });

      toast.success('Booking created successfully!');
      setShowForm(false);
      setAddress('');
      setDateTime('');
      setSelectedTailor('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage your tailoring appointments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Booking</CardTitle>
            <CardDescription>Schedule a tailoring appointment at your location</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dateTime">Date & Time</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full address"
                    required
                    rows={3}
                    className="flex-1"
                  />
                  <SavedAddressPicker onSelectAddress={setAddress} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tailor">Preferred Tailor (Optional)</Label>
                <Select value={selectedTailor} onValueChange={setSelectedTailor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-assign or select a tailor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-assign</SelectItem>
                    {tailors.map((tailor) => (
                      <SelectItem key={tailor.id.toString()} value={tailor.id.toString()}>
                        {tailor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createBooking.isPending}>
                  {createBooking.isPending ? 'Creating...' : 'Create Booking'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {bookingsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No bookings yet. Create your first booking to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id.toString()} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.hash = `/booking/${booking.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {formatStatus(booking.status)}
                      </Badge>
                      {booking.paymentStatus === 'paid' && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          Paid
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(Number(booking.dateTime) / 1_000_000).toLocaleString()}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{booking.address}</span>
                    </div>
                    {booking.estimatedPrice && (
                      <p className="text-sm font-medium">
                        Estimated Price: ${Number(booking.estimatedPrice)}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
