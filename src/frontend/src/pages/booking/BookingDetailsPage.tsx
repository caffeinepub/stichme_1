import { useGetBooking, useGetBookingHistory, useGetAllTailorProfiles } from '../../hooks/useQueries';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, ArrowLeft } from 'lucide-react';
import BookingStatusTimeline from '../../components/bookings/BookingStatusTimeline';
import BookingStatusActions from '../../components/bookings/BookingStatusActions';
import PaymentSection from '../../components/payments/PaymentSection';
import type { BookingStatus } from '../../backend';

interface BookingDetailsPageProps {
  bookingId: string | null;
}

export default function BookingDetailsPage({ bookingId }: BookingDetailsPageProps) {
  const { data: booking, isLoading } = useGetBooking(bookingId);
  const { data: history } = useGetBookingHistory(bookingId);
  const { data: tailors = [] } = useGetAllTailorProfiles();
  const { userProfile, isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Booking not found</p>
          <Button className="mt-4" onClick={() => window.location.hash = '/'}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tailor = booking.tailor ? tailors.find(t => t.owner.toString() === booking.tailor?.toString()) : null;
  const isCustomer = identity?.getPrincipal().toString() === booking.customer.toString();
  const isTailor = booking.tailor && identity?.getPrincipal().toString() === booking.tailor.toString();
  const canUpdateStatus = isTailor || isAdmin;

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground">Booking #{booking.id.toString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointment Information</CardTitle>
                <Badge className={getStatusColor(booking.status)}>
                  {formatStatus(booking.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {new Date(Number(booking.dateTime) / 1_000_000).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{booking.address}</p>
                </div>
              </div>

              {tailor && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tailor</p>
                    <p className="font-medium">{tailor.name}</p>
                  </div>
                </div>
              )}

              {!tailor && booking.status === 'requested' && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tailor</p>
                    <p className="font-medium text-amber-600">Awaiting assignment</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {canUpdateStatus && (
            <BookingStatusActions bookingId={booking.id} currentStatus={booking.status} />
          )}

          <PaymentSection booking={booking} isCustomer={isCustomer} isAdmin={isAdmin} />
        </div>

        <div>
          <BookingStatusTimeline history={history} />
        </div>
      </div>
    </div>
  );
}
