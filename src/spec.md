# Specification

## Summary
**Goal:** Build StichMe, a mobile-first web app for booking at-home tailoring services with authenticated customer, tailor, and admin experiences, backed by a Motoko canister with persistent data.

**Planned changes:**
- Implement Motoko backend data model + stable persistence for accounts (customer/tailor/admin), tailor profiles, bookings, booking status history, saved customer addresses, and booking payment status.
- Expose typed backend APIs to create/read/update users, tailors, bookings, booking status changes, and admin actions (role management, deactivation, reassignment).
- Add Internet Identity authentication in the UI and enforce role-based access control in the backend (admin allowlist; customers/tailors limited to their data/actions).
- Build customer booking flow UI: select date/time, enter address, choose tailor or request assignment, submit booking, and view booking list + booking details.
- Build booking lifecycle UI + APIs: show current status and timestamped history; allow status updates by assigned tailor or admin.
- Build tailor dashboard UI: onboarding/profile creation, view relevant booking requests, accept/decline, and view upcoming scheduled jobs.
- Build admin dashboard UI: admin-only route, view users/tailors/bookings with basic filtering (at least by status), and perform administrative actions.
- Add payment placeholder: show estimated price and a simulated “Mark as Paid” action; store and display booking payment status (Unpaid/Paid/Refunded placeholder).
- Implement a modern, cohesive, mobile-responsive UI theme (not primarily blue/purple) across auth, customer, tailor, and admin screens.
- Add generated static brand assets under `frontend/public/assets/generated` and display logo in header/login plus a hero illustration on landing.

**User-visible outcome:** Users can sign in with Internet Identity and (as a customer) create and track tailoring bookings; (as a tailor) manage a profile, accept/decline jobs, and update booking status; (as an admin) manage users/tailors/bookings with restricted access—along with a consistent mobile-first UI, basic brand visuals, and a simulated payment status flow.
