import { useState } from 'react';
import { useUpdatePaymentStatus, useSetEstimatedPrice } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Booking, PaymentStatus } from '../../backend';

interface PaymentSectionProps {
  booking: Booking;
  isCustomer: boolean;
  isAdmin: boolean;
}

export default function PaymentSection({ booking, isCustomer, isAdmin }: PaymentSectionProps) {
  const updatePayment = useUpdatePaymentStatus();
  const setPrice = useSetEstimatedPrice();
  const [newPrice, setNewPrice] = useState('');
  const [showPriceForm, setShowPriceForm] = useState(false);

  const handleMarkAsPaid = async () => {
    try {
      await updatePayment.mutateAsync({
        bookingId: booking.id,
        paymentStatus: 'paid' as PaymentStatus,
      });
      toast.success('Payment marked as paid');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment');
    }
  };

  const handleSetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newPrice);

    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await setPrice.mutateAsync({
        bookingId: booking.id,
        price: BigInt(Math.round(price)),
      });
      toast.success('Price set successfully');
      setShowPriceForm(false);
      setNewPrice('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to set price');
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'unpaid': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'refunded': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const formatPaymentStatus = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'unpaid': return 'Unpaid';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment</CardTitle>
          <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
            {formatPaymentStatus(booking.paymentStatus)}
          </Badge>
        </div>
        <CardDescription>Payment information and actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a payment placeholder. No real payment processing is performed.
          </AlertDescription>
        </Alert>

        {booking.estimatedPrice ? (
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Estimated Price</p>
              <p className="text-2xl font-bold">${Number(booking.estimatedPrice)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No price estimate yet</p>
        )}

        {!booking.estimatedPrice && isAdmin && !showPriceForm && (
          <Button onClick={() => setShowPriceForm(true)} variant="outline" className="w-full">
            Set Estimated Price
          </Button>
        )}

        {showPriceForm && (
          <form onSubmit={handleSetPrice} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="price">Estimated Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={setPrice.isPending}>
                {setPrice.isPending ? 'Setting...' : 'Set Price'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPriceForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {booking.paymentStatus === 'unpaid' && booking.estimatedPrice && (isCustomer || isAdmin) && (
          <Button
            onClick={handleMarkAsPaid}
            disabled={updatePayment.isPending}
            className="w-full"
          >
            {updatePayment.isPending ? 'Processing...' : 'Mark as Paid (Simulated)'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
