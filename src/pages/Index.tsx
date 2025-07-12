
import { useState } from 'react';
import { Search, Filter, MapPin, Calendar, Eye, Phone, MessageSquare, Bell, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAds } from '@/hooks/useAds';
import { useSearch } from '@/hooks/useSearch';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import PremiumCard from '@/components/PremiumCard';

const Index = () => {
  const { data: ads, isLoading } = useAds();
  const { user } = useAuth();
  const { searchAds, clearSearch, isSearching, searchResults, hasSearched, searchError } = useSearch();
  
  // Local state for search form
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    condition: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SD');
  };

  const brands = [...new Set(ads?.map(ad => ad.brand) || [])];
  
  // Determine which ads to display
  const displayAds = hasSearched ? searchResults : (ads || []);

  const handleSearch = () => {
    console.log('Performing search with filters:', searchFilters);
    searchAds(searchFilters);
  };

  const handleClearSearch = () => {
    console.log('Clearing search');
    clearSearch();
    setSearchFilters({
      city: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section with Search */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl p-8 mb-8 text-white text-center">
          <h1 className="text-4xl font-bold mb-4">اعثر على سيارة أحلامك</h1>
          <p className="text-xl mb-8 text-blue-100">
            أكثر من 3 سيارة متاحة للبيع في جميع أنحاء السودان
          </p>
          
          {/* Search Filters */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="المدينة..."
                  value={searchFilters.city}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="pr-10 bg-white text-gray-900"
                />
              </div>
              
              <Input
                placeholder="اكتب اسم الماركة..."
                value={searchFilters.brand}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="bg-white text-gray-900"
              />

              <div className="flex gap-2">
                <Input
                  placeholder="من"
                  type="number"
                  value={searchFilters.minPrice}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="bg-white text-gray-900"
                />
                <Input
                  placeholder="إلى"
                  type="number"
                  value={searchFilters.maxPrice}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="text-right mb-4">
              <span className="text-white/80 text-sm">نطاق السعر</span>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8"
              >
                <Search className="w-4 h-4 ml-2" />
                {isSearching ? 'البحث...' : 'بحث'}
              </Button>
              {hasSearched && (
                <Button 
                  onClick={handleClearSearch}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  مسح البحث
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* البطاقة الترويجية للخطة المميزة */}
        <div className="mb-8">
          <PremiumCard variant="home" />
        </div>

        {/* أزرار سريعة للمستخدمين */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة إعلان
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <MessageSquare className="w-4 h-4 ml-2" />
                  الرسائل
                </Button>
                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                  <Bell className="w-4 h-4 ml-2" />
                  الإشعارات
                </Button>
                <Link to="/dashboard">
                  <Button variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-50">
                    <User className="w-4 h-4 ml-2" />
                    حسابي
                  </Button>
                </Link>
              </>) : (
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* عنوان القسم */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">السيارات المتاحة</h2>
          <p className="text-gray-600">اكتشف أفضل العروض المتاحة من البائعين الموثوقين</p>
        </div>

        {/* عرض حالة البحث */}
        {hasSearched && (
          <div className="mb-6">
            <p className="text-gray-600">
              {searchResults.length > 0 
                ? `تم العثور على ${searchResults.length} إعلان`
                : 'لم يتم العثور على إعلانات مطابقة'
              }
            </p>
          </div>
        )}

        {/* عرض النتائج */}
        {(isLoading || isSearching) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayAds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayAds.map((ad) => (
              <Card key={ad.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img 
                    src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop"}
                    alt={ad.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {ad.is_featured && (
                      <Badge className="bg-yellow-500 text-white">مميز</Badge>
                    )}
                    {ad.is_premium && (
                      <Badge className="bg-purple-500 text-white">بريميوم</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-white/90">
                      <Eye className="w-3 h-3 ml-1" />
                      {ad.views_count}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {ad.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {ad.brand} {ad.model} - {ad.year}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{ad.city}</span>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(ad.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(ad.price)} جنيه
                    </p>
                    <Link to={`/ad/${ad.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Phone className="w-4 h-4 ml-2" />
                        تفاصيل
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {hasSearched ? 'لا توجد نتائج' : 'لا توجد إعلانات'}
            </h3>
            <p className="text-gray-500">
              {hasSearched ? 'جرب تغيير معايير البحث' : 'لم يتم إنشاء أي إعلانات بعد'}
            </p>
          </div>
        )}

        {/* عرض أخطاء البحث */}
        {searchError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.</p>
          </div>
        )}

        {/* البطاقة الترويجية في الفوتر */}
        <div className="mt-16">
          <PremiumCard variant="footer" />
        </div>
      </main>
    </div>
  );
};

export default Index;
