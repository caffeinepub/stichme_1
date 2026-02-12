import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scissors, Clock, MapPin, Shield } from 'lucide-react';

interface LandingSectionProps {
  onGetStarted: () => void;
}

export default function LandingSection({ onGetStarted }: LandingSectionProps) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-8 items-center py-8">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Professional Tailoring at Your Doorstep
          </h1>
          <p className="text-lg text-muted-foreground">
            Book expert tailors who come to your home. Get perfect fits without leaving your comfort zone.
          </p>
          <div className="flex gap-4">
            <Button size="lg" onClick={onGetStarted}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={onGetStarted}>
              I'm a Tailor
            </Button>
          </div>
        </div>
        <div className="relative">
          <img 
            src="/assets/generated/stichme-hero.dim_1600x900.png" 
            alt="Professional tailor measuring fabric with client at home"
            className="rounded-lg shadow-lg w-full"
          />
        </div>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Expert Tailors</h3>
            <p className="text-sm text-muted-foreground">
              Verified professionals with years of experience
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Home Service</h3>
            <p className="text-sm text-muted-foreground">
              Convenient appointments at your location
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Flexible Timing</h3>
            <p className="text-sm text-muted-foreground">
              Book appointments that fit your schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Secure Platform</h3>
            <p className="text-sm text-muted-foreground">
              Safe and reliable booking system
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              1
            </div>
            <h3 className="font-semibold text-lg">Book a Service</h3>
            <p className="text-muted-foreground">
              Choose your preferred date, time, and location
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              2
            </div>
            <h3 className="font-semibold text-lg">Get Matched</h3>
            <p className="text-muted-foreground">
              We connect you with a skilled tailor in your area
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              3
            </div>
            <h3 className="font-semibold text-lg">Enjoy the Service</h3>
            <p className="text-muted-foreground">
              Relax while the tailor works their magic at your home
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
