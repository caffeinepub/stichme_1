import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';
import type { BookingHistory, BookingStatus } from '../../backend';

interface BookingStatusTimelineProps {
  history: BookingHistory | null | undefined;
}

export default function BookingStatusTimeline({ history }: BookingStatusTimelineProps) {
  if (!history || !history.statusLog || history.statusLog.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No status history available</p>
        </CardContent>
      </Card>
    );
  }

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

  const sortedLog = [...history.statusLog].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedLog.map(([status, timestamp], index) => (
            <div key={index}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <Badge className={getStatusColor(status)}>
                    {formatStatus(status)}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Number(timestamp) / 1_000_000).toLocaleString()}
                  </p>
                </div>
              </div>
              {index < sortedLog.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
