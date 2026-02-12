import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Booking, BookingHistory, TailorProfile, SavedAddress, UserProfile, BookingStatus, PaymentStatus, BookingSortColumn, BookingSortDirection } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Booking Queries
export function useGetMyCustomerBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['myCustomerBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCustomerBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBooking(bookingId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking | null>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!actor || !bookingId) return null;
      return actor.getBooking(BigInt(bookingId));
    },
    enabled: !!actor && !isFetching && !!bookingId,
  });
}

export function useGetBookingHistory(bookingId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<BookingHistory | null>({
    queryKey: ['bookingHistory', bookingId],
    queryFn: async () => {
      if (!actor || !bookingId) return null;
      return actor.getBookingHistory(BigInt(bookingId));
    },
    enabled: !!actor && !isFetching && !!bookingId,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ address, dateTime, tailorId }: { address: string; dateTime: bigint; tailorId: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(address, dateTime, tailorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCustomerBookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['bookingHistory', variables.bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myCustomerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myTailorBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelBooking(bookingId);
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['bookingHistory', bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myCustomerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myTailorBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

// Tailor Queries
export function useGetAllTailorProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<TailorProfile[]>({
    queryKey: ['allTailorProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTailorProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyTailorProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<TailorProfile | null>({
    queryKey: ['myTailorProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyTailorProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTailorProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, address, bio }: { name: string; address: string; bio: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTailorProfile(name, address, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTailorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allTailorProfiles'] });
    },
  });
}

export function useUpdateTailorProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, address, bio }: { name: string; address: string; bio: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTailorProfile(name, address, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTailorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allTailorProfiles'] });
    },
  });
}

export function useGetMyTailorBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['myTailorBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTailorBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAcceptBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptBooking(bookingId);
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['bookingHistory', bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myTailorBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

// Saved Addresses
export function useGetMySavedAddresses() {
  const { actor, isFetching } = useActor();

  return useQuery<SavedAddress[]>({
    queryKey: ['mySavedAddresses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySavedAddresses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressLabel, address }: { addressLabel: string; address: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveAddress(addressLabel, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySavedAddresses'] });
    },
  });
}

export function useDeleteSavedAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSavedAddress(addressId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySavedAddresses'] });
    },
  });
}

// Payment
export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, paymentStatus }: { bookingId: bigint; paymentStatus: PaymentStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentStatus(bookingId, paymentStatus);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myCustomerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useSetEstimatedPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, price }: { bookingId: bigint; price: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setEstimatedPrice(bookingId, price);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myCustomerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myTailorBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

// Admin Queries
export function useGetAllBookings(sortColumn: BookingSortColumn = 'bookingDate' as BookingSortColumn, direction: BookingSortDirection = 'desc' as BookingSortDirection) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['allBookings', sortColumn, direction],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings(sortColumn, direction);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, UserProfile][]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAssignTailorToBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, tailorId }: { bookingId: bigint; tailorId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminAssignTailorToBooking(bookingId, tailorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
}

export function useAdminActivateTailor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tailorId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminActivateTailor(tailorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTailorProfiles'] });
    },
  });
}

export function useAdminDeactivateTailor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tailorId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminDeactivateTailor(tailorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTailorProfiles'] });
    },
  });
}
