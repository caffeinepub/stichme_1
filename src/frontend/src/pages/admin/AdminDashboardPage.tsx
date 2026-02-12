import { useState } from 'react';
import { useGetAllUsers, useGetAllTailorProfiles, useGetAllBookings } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminUsersPanel from '../../components/admin/AdminUsersPanel';
import AdminTailorsPanel from '../../components/admin/AdminTailorsPanel';
import AdminBookingsPanel from '../../components/admin/AdminBookingsPanel';

export default function AdminDashboardPage() {
  const { data: users = [], isLoading: usersLoading } = useGetAllUsers();
  const { data: tailors = [], isLoading: tailorsLoading } = useGetAllTailorProfiles();
  const { data: bookings = [], isLoading: bookingsLoading } = useGetAllBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, tailors, and bookings</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tailors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tailors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="tailors">Tailors</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <AdminBookingsPanel bookings={bookings} tailors={tailors} isLoading={bookingsLoading} />
        </TabsContent>

        <TabsContent value="tailors">
          <AdminTailorsPanel tailors={tailors} isLoading={tailorsLoading} />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsersPanel users={users} isLoading={usersLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
