import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import LoginButton from '../auth/LoginButton';

interface HeaderProps {
  isAuthenticated: boolean;
  userRole: string | null;
  isAdmin: boolean;
  navigate: (route: string) => void;
}

interface NavItem {
  label: string;
  route: string;
}

export default function Header({ isAuthenticated, userRole, isAdmin, navigate }: HeaderProps) {
  const navItems: NavItem[] = [];

  if (isAuthenticated) {
    if (userRole === 'customer' || isAdmin) {
      navItems.push({ label: 'My Bookings', route: '/customer' });
    }
    if (userRole === 'tailor' || isAdmin) {
      navItems.push({ label: 'Tailor Dashboard', route: '/tailor' });
    }
    if (isAdmin) {
      navItems.push({ label: 'Admin', route: '/admin' });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/assets/generated/stichme-logo.dim_512x512.png" 
              alt="StichMe" 
              className="h-10 w-10"
            />
            <span className="text-xl font-bold">StichMe</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Button
                key={item.route}
                variant="ghost"
                onClick={() => navigate(item.route)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LoginButton />

          {/* Mobile Navigation */}
          {isAuthenticated && navItems.length > 0 && (
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.route}
                      variant="ghost"
                      onClick={() => navigate(item.route)}
                      className="justify-start"
                    >
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
