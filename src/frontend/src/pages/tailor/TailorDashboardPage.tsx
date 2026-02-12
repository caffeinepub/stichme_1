import { useState } from 'react';
import { useGetMyTailorProfile, useCreateTailorProfile, useUpdateTailorProfile, useGetMyTailorBookings, useAcceptBooking } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import type { BookingStatus } from '../../backend';

export default function TailorDashboardPage() {
  const { data: profile, isLoading: profileLoading } = useGetMyTailorProfile();
  const { data: bookings = [], isLoading: bookingsLoading } = useGetMyTailorBookings();
  const createProfile = useCreateTailorProfile();
  const updateProfile = useUpdateTailorProfile();
  const acceptBooking = useAcceptBooking();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim() || !bio.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (profile) {
        await updateProfile.mutateAsync({
          name: name.trim(),
          address: address.trim(),
          bio: bio.trim(),
        });
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        await createProfile.mutateAsync({
          name: name.trim(),
          address: address.trim(),
          bio: bio.trim(),
        });
        toast.success('Profile created successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    }
  };

  const handleAccept = async (bookingId: bigint) => {
    try {
      await acceptBooking.mutateAsync(bookingId);
      toast.success('Booking accepted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept booking');
    }
  };

  const startEditing = () => {
    if (profile) {
      setName(profile.name);
      setAddress(profile.address);
      setBio(profile.bio);
      setIsEditing(true);
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

  const requestedBookings = bookings.filter(b => b.status === 'requested');
  const activeBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'inProgress');

  if (profileLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tailor Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and bookings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bookings">
            Bookings
            {requestedBookings.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {requestedBookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {!profile || isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>{profile ? 'Edit Profile' : 'Create Tailor Profile'}</CardTitle>
                <CardDescription>
                  {profile ? 'Update your professional information' : 'Set up your tailor profile to start receiving bookings'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your professional name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Service Area</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Areas you serve"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell customers about your experience and specialties"
                      required
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createProfile.isPending || updateProfile.isPending}>
                      {createProfile.isPending || updateProfile.isPending ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                    </Button>
                    {profile && (
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Profile</CardTitle>
                  <Button onClick={startEditing}>Edit Profile</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Area</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="font-medium">{profile.bio}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {requestedBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">New Requests</h2>
              <div className="grid gap-4">
                {requestedBookings.map((booking) => (
                  <Card key={booking.id.toString()}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(booking.status)}>
                            {formatStatus(booking.status)}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(Number(booking.dateTime) / 1_000_000).toLocaleString()}
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span>{booking.address}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAccept(booking.id)}
                            disabled={acceptBooking.isPending}
                          >
                            Accept Booking
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.location.hash = `/booking/${booking.id}`}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Bookings</h2>
            {bookingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : activeBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No active bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeBookings.map((booking) => (
                  <Card key={booking.id.toString()} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.hash = `/booking/${booking.id}`}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <Badge className={getStatusColor(booking.status)}>
                          {formatStatus(booking.status)}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(Number(booking.dateTime) / 1_000_000).toLocaleString()}
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="line-clamp-2">{booking.address}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
