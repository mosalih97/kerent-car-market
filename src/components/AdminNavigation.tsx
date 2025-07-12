
import { Link, useLocation } from 'react-router-dom';
import { Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useAdmin';

const AdminNavigation = () => {
  const { data: isAdmin } = useIsAdmin();
  const location = useLocation();

  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-2">
      <Link to="/admin">
        <Button 
          variant={location.pathname === '/admin' ? 'default' : 'outline'}
          size="sm"
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          لوحة الإدارة
        </Button>
      </Link>
    </div>
  );
};

export default AdminNavigation;
