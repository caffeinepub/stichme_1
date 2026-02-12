import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Debug "mo:core/Debug";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";

actor {
  public type Id = Nat;

  // Booking status type (persistent actors only)
  public type BookingStatus = {
    #requested;
    #accepted;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type PaymentStatus = {
    #unpaid;
    #paid;
    #refunded;
  };

  public type Booking = {
    id : Id;
    customer : Principal;
    tailor : ?Principal;
    address : Text;
    dateTime : Int;
    status : BookingStatus;
    paymentStatus : PaymentStatus;
    estimatedPrice : ?Nat;
  };

  public type BookingHistory = {
    bookingId : Id;
    statusLog : [(BookingStatus, Int)];
  };

  public type TailorProfile = {
    id : Id;
    owner : Principal;
    name : Text;
    address : Text;
    bio : Text;
    rating : ?Nat;
    isActive : Bool;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
    role : Text; // "customer", "tailor", or "admin"
  };

  public type SavedAddress = {
    id : Id;
    owner : Principal;
    addressLabel : Text;
    address : Text;
  };

  // Persistent storage using maps
  let bookings = Map.empty<Id, Booking>();
  let bookingHistory = Map.empty<Id, BookingHistory>();
  let tailorProfiles = Map.empty<Id, TailorProfile>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let savedAddresses = Map.empty<Id, SavedAddress>();
  let tailorByPrincipal = Map.empty<Principal, Id>(); // Map principal to tailor profile ID

  // Authentication & authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Counter for generating unique IDs
  var nextId : Id = 1;

  // Helper function to generate unique ID
  func generateId() : Id {
    let id = nextId;
    nextId += 1;
    id;
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Booking Management

  public query ({ caller }) func getBookingStatus(bookingId : Id) : async BookingStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view booking status");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        // Verify caller has access to this booking
        if (caller != booking.customer and
            (switch (booking.tailor) { case (?t) { caller != t }; case (null) { true } }) and
            not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own bookings");
        };
        booking.status;
      };
    };
  };

  public query ({ caller }) func getBooking(bookingId : Id) : async ?Booking {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    switch (bookings.get(bookingId)) {
      case (null) { null };
      case (?booking) {
        // Verify caller has access to this booking
        if (caller != booking.customer and
            (switch (booking.tailor) { case (?t) { caller != t }; case (null) { true } }) and
            not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own bookings");
        };
        ?booking;
      };
    };
  };

  public shared ({ caller }) func createBooking(address : Text, dateTime : Int, tailorId : ?Id) : async Id {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    let bookingId = generateId();

    // Verify tailor exists if specified
    let tailorPrincipal = switch (tailorId) {
      case (?tid) {
        switch (tailorProfiles.get(tid)) {
          case (?profile) {
            if (not profile.isActive) {
              Runtime.trap("Selected tailor is not active");
            };
            ?profile.owner;
          };
          case (null) { Runtime.trap("Tailor not found") };
        };
      };
      case (null) { null };
    };

    let booking : Booking = {
      id = bookingId;
      customer = caller;
      tailor = tailorPrincipal;
      address;
      dateTime;
      status = #requested;
      paymentStatus = #unpaid;
      estimatedPrice = null;
    };

    bookings.add(bookingId, booking);
    bookingHistory.add(bookingId, { bookingId; statusLog = [(#requested, Time.now())] });
    bookingId;
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Id, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update booking status");
    };

    let booking = switch (bookings.get(bookingId)) {
      case (?booking) { booking };
      case (null) { Runtime.trap("Booking not found") };
    };

    // Authorization: Only tailor assigned to booking or admin can update status
    let isAssignedTailor = switch (booking.tailor) {
      case (?t) { caller == t };
      case (null) { false };
    };

    if (not isAssignedTailor and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only assigned tailor or admin can update booking status");
    };

    // Validate status transitions
    let validTransition = switch (booking.status, status) {
      case (#requested, #accepted) { true };
      case (#requested, #cancelled) { true };
      case (#accepted, #inProgress) { true };
      case (#accepted, #cancelled) { true };
      case (#inProgress, #completed) { true };
      case (#inProgress, #cancelled) { true };
      case (_, _) { false };
    };

    if (not validTransition) {
      Runtime.trap("Invalid status transition");
    };

    let updatedBooking = { booking with status };
    bookings.add(bookingId, updatedBooking);

    switch (bookingHistory.get(bookingId)) {
      case (null) { Runtime.trap("Booking history not found") };
      case (?history) {
        let updatedHistory = {
          history with
          statusLog = history.statusLog.concat([(status, Time.now())])
        };
        bookingHistory.add(bookingId, updatedHistory);
      };
    };
  };

  public shared ({ caller }) func cancelBooking(bookingId : Id) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };

    let booking = switch (bookings.get(bookingId)) {
      case (?booking) { booking };
      case (null) { Runtime.trap("Booking not found") };
    };

    // Customer can cancel their own booking, admin can cancel any
    if (caller != booking.customer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only cancel your own bookings");
    };

    let updatedBooking = { booking with status = #cancelled };
    bookings.add(bookingId, updatedBooking);

    switch (bookingHistory.get(bookingId)) {
      case (null) { Runtime.trap("Booking history not found") };
      case (?history) {
        let updatedHistory = {
          history with
          statusLog = history.statusLog.concat([(#cancelled, Time.now())])
        };
        bookingHistory.add(bookingId, updatedHistory);
      };
    };
  };

  public query ({ caller }) func getBookingHistory(bookingId : Id) : async ?BookingHistory {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view booking history");
    };

    switch (bookings.get(bookingId)) {
      case (null) { null };
      case (?booking) {
        // Verify caller has access to this booking
        if (caller != booking.customer and
            (switch (booking.tailor) { case (?t) { caller != t }; case (null) { true } }) and
            not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own booking history");
        };
        bookingHistory.get(bookingId);
      };
    };
  };

  // Tailor Profile Management

  public shared ({ caller }) func createTailorProfile(name : Text, address : Text, bio : Text) : async Id {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tailor profiles");
    };

    // Check if user already has a tailor profile
    switch (tailorByPrincipal.get(caller)) {
      case (?_) { Runtime.trap("User already has a tailor profile") };
      case (null) {};
    };

    let tailorId = generateId();
    let profile : TailorProfile = {
      id = tailorId;
      owner = caller;
      name;
      address;
      bio;
      rating = null;
      isActive = true;
    };

    tailorProfiles.add(tailorId, profile);
    tailorByPrincipal.add(caller, tailorId);
    tailorId;
  };

  public shared ({ caller }) func updateTailorProfile(name : Text, address : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tailor profiles");
    };

    let tailorId = switch (tailorByPrincipal.get(caller)) {
      case (?id) { id };
      case (null) { Runtime.trap("No tailor profile found for user") };
    };

    let profile = switch (tailorProfiles.get(tailorId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Tailor profile not found") };
    };

    let updatedProfile = {
      profile with
      name;
      address;
      bio;
    };

    tailorProfiles.add(tailorId, updatedProfile);
  };

  public query ({ caller }) func getTailorProfile(tailorId : Id) : async ?TailorProfile {
    tailorProfiles.get(tailorId);
  };

  public query ({ caller }) func getMyTailorProfile() : async ?TailorProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tailor profiles");
    };

    switch (tailorByPrincipal.get(caller)) {
      case (?tailorId) { tailorProfiles.get(tailorId) };
      case (null) { null };
    };
  };

  public query func getAllTailorProfiles() : async [TailorProfile] {
    tailorProfiles.values().toArray().filter(func(p : TailorProfile) : Bool { p.isActive });
  };

  // Tailor-specific functions

  public shared ({ caller }) func acceptBooking(bookingId : Id) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept bookings");
    };

    // Verify caller is a tailor
    switch (tailorByPrincipal.get(caller)) {
      case (null) { Runtime.trap("Only tailors can accept bookings") };
      case (?_) {};
    };

    let booking = switch (bookings.get(bookingId)) {
      case (?booking) { booking };
      case (null) { Runtime.trap("Booking not found") };
    };

    // Check if booking is in requested status
    if (booking.status != #requested) {
      Runtime.trap("Booking is not in requested status");
    };

    // Check if booking already has a tailor assigned
    switch (booking.tailor) {
      case (?t) {
        if (t != caller) {
          Runtime.trap("Booking already assigned to another tailor");
        };
      };
      case (null) {};
    };

    let updatedBooking = {
      booking with
      tailor = ?caller;
      status = #accepted;
    };
    bookings.add(bookingId, updatedBooking);

    switch (bookingHistory.get(bookingId)) {
      case (null) { Runtime.trap("Booking history not found") };
      case (?history) {
        let updatedHistory = {
          history with
          statusLog = history.statusLog.concat([(#accepted, Time.now())])
        };
        bookingHistory.add(bookingId, updatedHistory);
      };
    };
  };

  public query ({ caller }) func getMyTailorBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    // Verify caller is a tailor
    switch (tailorByPrincipal.get(caller)) {
      case (null) { Runtime.trap("Only tailors can view tailor bookings") };
      case (?_) {};
    };

    bookings.values().toArray().filter(func(b : Booking) : Bool {
      switch (b.tailor) {
        case (?t) { t == caller };
        case (null) { false };
      };
    });
  };

  public query ({ caller }) func getMyCustomerBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    bookings.values().toArray().filter(func(b : Booking) : Bool {
      b.customer == caller;
    });
  };

  // Admin functions

  public shared ({ caller }) func adminAssignTailorToBooking(bookingId : Id, tailorId : Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign tailors to bookings");
    };

    let booking = switch (bookings.get(bookingId)) {
      case (?booking) { booking };
      case (null) { Runtime.trap("Booking not found") };
    };

    let tailorProfile = switch (tailorProfiles.get(tailorId)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Tailor not found") };
    };

    if (not tailorProfile.isActive) {
      Runtime.trap("Tailor is not active");
    };

    let updatedBooking = { booking with tailor = ?tailorProfile.owner };
    bookings.add(bookingId, updatedBooking);
  };

  public shared ({ caller }) func adminDeactivateTailor(tailorId : Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can deactivate tailors");
    };

    let profile = switch (tailorProfiles.get(tailorId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Tailor not found") };
    };

    let updatedProfile = { profile with isActive = false };
    tailorProfiles.add(tailorId, updatedProfile);
  };

  public shared ({ caller }) func adminActivateTailor(tailorId : Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can activate tailors");
    };

    let profile = switch (tailorProfiles.get(tailorId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Tailor not found") };
    };

    let updatedProfile = { profile with isActive = true };
    tailorProfiles.add(tailorId, updatedProfile);
  };

  // Payment functions

  public shared ({ caller }) func updatePaymentStatus(bookingId : Id, paymentStatus : PaymentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment status");
    };

    let booking = switch (bookings.get(bookingId)) {
      case (?booking) { booking };
      case (null) { Runtime.trap("Booking not found") };
    };

    // Customer can pay for their booking, admin can update any payment
    if (caller != booking.customer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update payment for your own bookings");
    };

    let updatedBooking = { booking with paymentStatus };
    bookings.add(bookingId, updatedBooking);
  };

  public shared ({ caller }) func setEstimatedPrice(bookingId : Id, price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set estimated price");
    };

    let booking = switch (bookings.get(bookingId)) {
      case (?booking) { booking };
      case (null) { Runtime.trap("Booking not found") };
    };

    // Only assigned tailor or admin can set price
    let isAssignedTailor = switch (booking.tailor) {
      case (?t) { caller == t };
      case (null) { false };
    };

    if (not isAssignedTailor and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only assigned tailor or admin can set price");
    };

    let updatedBooking = { booking with estimatedPrice = ?price };
    bookings.add(bookingId, updatedBooking);
  };

  // Saved Addresses

  public shared ({ caller }) func saveAddress(addressLabel : Text, address : Text) : async Id {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save addresses");
    };

    let addressId = generateId();
    let savedAddress : SavedAddress = {
      id = addressId;
      owner = caller;
      addressLabel;
      address;
    };

    savedAddresses.add(addressId, savedAddress);
    addressId;
  };

  public query ({ caller }) func getMySavedAddresses() : async [SavedAddress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view saved addresses");
    };

    savedAddresses.values().toArray().filter(func(a : SavedAddress) : Bool {
      a.owner == caller;
    });
  };

  public shared ({ caller }) func deleteSavedAddress(addressId : Id) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete addresses");
    };

    let address = switch (savedAddresses.get(addressId)) {
      case (?addr) { addr };
      case (null) { Runtime.trap("Address not found") };
    };

    if (address.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own addresses");
    };

    savedAddresses.remove(addressId);
  };

  // Sorting and filtering

  public type BookingSortColumn = {
    #bookingDate;
    #tailorName;
    #customerPrincipal;
  };

  public type BookingSortDirection = {
    #asc;
    #desc;
  };

  public query ({ caller }) func getAllBookings(sortColumn : BookingSortColumn, direction : BookingSortDirection) : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };

    var bookingsArray = bookings.values().toArray();

    if (direction == #desc) {
      bookingsArray := bookingsArray.reverse();
    };

    bookingsArray;
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.entries().toArray();
  };
};
