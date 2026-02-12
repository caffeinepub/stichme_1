import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SavedAddress {
    id: Id;
    owner: Principal;
    addressLabel: string;
    address: string;
}
export interface BookingHistory {
    bookingId: Id;
    statusLog: Array<[BookingStatus, bigint]>;
}
export type Id = bigint;
export interface Booking {
    id: Id;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    customer: Principal;
    estimatedPrice?: bigint;
    tailor?: Principal;
    address: string;
    dateTime: bigint;
}
export interface TailorProfile {
    id: Id;
    bio: string;
    owner: Principal;
    name: string;
    isActive: boolean;
    address: string;
    rating?: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
    email?: string;
    phone?: string;
}
export enum BookingSortColumn {
    customerPrincipal = "customerPrincipal",
    tailorName = "tailorName",
    bookingDate = "bookingDate"
}
export enum BookingSortDirection {
    asc = "asc",
    desc = "desc"
}
export enum BookingStatus {
    requested = "requested",
    cancelled = "cancelled",
    completed = "completed",
    accepted = "accepted",
    inProgress = "inProgress"
}
export enum PaymentStatus {
    paid = "paid",
    refunded = "refunded",
    unpaid = "unpaid"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptBooking(bookingId: Id): Promise<void>;
    adminActivateTailor(tailorId: Id): Promise<void>;
    adminAssignTailorToBooking(bookingId: Id, tailorId: Id): Promise<void>;
    adminDeactivateTailor(tailorId: Id): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: Id): Promise<void>;
    createBooking(address: string, dateTime: bigint, tailorId: Id | null): Promise<Id>;
    createTailorProfile(name: string, address: string, bio: string): Promise<Id>;
    deleteSavedAddress(addressId: Id): Promise<void>;
    getAllBookings(sortColumn: BookingSortColumn, direction: BookingSortDirection): Promise<Array<Booking>>;
    getAllTailorProfiles(): Promise<Array<TailorProfile>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getBooking(bookingId: Id): Promise<Booking | null>;
    getBookingHistory(bookingId: Id): Promise<BookingHistory | null>;
    getBookingStatus(bookingId: Id): Promise<BookingStatus>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyCustomerBookings(): Promise<Array<Booking>>;
    getMySavedAddresses(): Promise<Array<SavedAddress>>;
    getMyTailorBookings(): Promise<Array<Booking>>;
    getMyTailorProfile(): Promise<TailorProfile | null>;
    getTailorProfile(tailorId: Id): Promise<TailorProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveAddress(addressLabel: string, address: string): Promise<Id>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setEstimatedPrice(bookingId: Id, price: bigint): Promise<void>;
    updateBookingStatus(bookingId: Id, status: BookingStatus): Promise<void>;
    updatePaymentStatus(bookingId: Id, paymentStatus: PaymentStatus): Promise<void>;
    updateTailorProfile(name: string, address: string, bio: string): Promise<void>;
}
