
import { useState } from 'react';
import { Search, Filter, MapPin, Calendar, Eye, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAds } from '@/hooks/useAds';
import { useSearch } from '@/hooks/useSearch';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Index = () => {
  const { data: ads, isLoading } = useAds();
  const { searchTerm, setSearchTerm, brandFilter, setBrandFilter, filteredAds } = useSearch(ads || []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SD');
  };

  const brands = [...new Set(ads?.map(ad => ad.brand) || [])];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* شريط البحث والفلاتر */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="ابحث عن سيارة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="اختر الماركة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الماركات</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Filter className="w-4 h-4 ml-2" />
              بحث
            </Button>
          </div>
        </div>

        {/* عرض النتائج */}
        {isLoading ? (
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
        ) : filteredAds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAds.map((ad) => (
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد إعلانات</h3>
            <p className="text-gray-500">جرب تغيير معايير البحث</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
