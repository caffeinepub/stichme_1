import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useCurrentUser } from './hooks/useCurrentUser';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/layout/Header';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';
import TailorDashboardPage from './pages/tailor/TailorDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import BookingDetailsPage from './pages/booking/BookingDetailsPage';
import LandingSection from './pages/marketing/LandingSection';
import AccessDeniedScreen from './components/auth/AccessDeniedScreen';

type Route = 'landing' | 'customer' | 'tailor' | 'admin' | 'booking-details' | 'access-denied';

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { userProfile, isAdmin, isLoading: userLoading } = useCurrentUser();
  const [currentRoute, setCurrentRoute] = useState<Route>('landing');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const [path, query] = hash.split('?');
      
      if (path === '/customer') {
        setCurrentRoute('customer');
      } else if (path === '/tailor') {
        setCurrentRoute('tailor');
      } else if (path === '/admin') {
        setCurrentRoute('admin');
      } else if (path.startsWith('/booking/')) {
        const id = path.split('/')[2];
        setBookingId(id);
        setCurrentRoute('booking-details');
      } else if (path === '/access-denied') {
        setCurrentRoute('access-denied');
      } else {
        setCurrentRoute('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    window.location.hash = route;
  };

  // Show loading state while initializing
  if (isInitializing || (isAuthenticated && userLoading)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show profile setup if authenticated but no profile
  const showProfileSetup = isAuthenticated && !userLoading && userProfile === null;

  // Determine user role
  const userRole = userProfile?.role || null;

  // Route guards
  const canAccessCustomer = isAuthenticated && (userRole === 'customer' || isAdmin);
  const canAccessTailor = isAuthenticated && (userRole === 'tailor' || isAdmin);
  const canAccessAdmin = isAuthenticated && isAdmin;

  const renderContent = () => {
    if (!isAuthenticated) {
      return <LandingSection onGetStarted={() => navigate('/customer')} />;
    }

    if (showProfileSetup) {
      return <ProfileSetupModal />;
    }

    switch (currentRoute) {
      case 'customer':
        if (!canAccessCustomer) {
          return <AccessDeniedScreen />;
        }
        return <CustomerBookingsPage />;
      
      case 'tailor':
        if (!canAccessTailor) {
          return <AccessDeniedScreen />;
        }
        return <TailorDashboardPage />;
      
      case 'admin':
        if (!canAccessAdmin) {
          return <AccessDeniedScreen />;
        }
        return <AdminDashboardPage />;
      
      case 'booking-details':
        if (!isAuthenticated) {
          return <AccessDeniedScreen />;
        }
        return <BookingDetailsPage bookingId={bookingId} />;
      
      case 'access-denied':
        return <AccessDeniedScreen />;
      
      case 'landing':
      default:
        return <LandingSection onGetStarted={() => navigate('/customer')} />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <Header 
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          isAdmin={isAdmin}
          navigate={navigate}
        />
        <main className="container mx-auto px-4 py-6 md:py-8">
          {renderContent()}
        </main>
        <footer className="border-t mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} StichMe. Built with love using{' '}
              <a 
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
