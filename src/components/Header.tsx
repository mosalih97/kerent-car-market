
import { Link } from 'react-router-dom';
import { Car, User, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import AdminNavigation from './AdminNavigation';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b" dir="rtl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Car className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">سوق السيارات</h1>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <AdminNavigation />
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    لوحة التحكم
                  </Button>
                </Link>
                <Button 
                  onClick={signOut}
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
