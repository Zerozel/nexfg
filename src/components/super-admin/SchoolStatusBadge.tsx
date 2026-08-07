import { Badge } from '@/components/ui/badge';

interface SchoolStatusBadgeProps {
  status: 'trial' | 'active' | 'inactive' | 'expired';
}

export function SchoolStatusBadge({ status }: SchoolStatusBadgeProps) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    trial: 'secondary',
    inactive: 'destructive',
    expired: 'outline',
  };

  const labels: Record<string, string> = {
    active: 'Active',
    trial: 'Trial',
    inactive: 'Inactive',
    expired: 'Expired',
  };

  return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
}
