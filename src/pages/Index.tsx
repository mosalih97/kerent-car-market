import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Car, DollarSign, Filter, Star, Eye, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAds } from "@/hooks/useAds";
import { useSearch } from "@/hooks/useSearch";
import CreateAdModal from "@/components/CreateAdModal";
import PremiumCard from "@/components/PremiumCard";
import { useProfile } from "@/hooks/useProfile";
import AdComponent from "@/components/AdComponent";
import SuggestedAds from "@/components/SuggestedAds";
import { useUserBehavior } from "@/hooks/useUserBehavior";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ads, isLoading } = useAds();
  const { searchAds, clearSearch, isSearching, searchResults, hasSearched } = useSearch();
  const { isPremium } = useProfile();
  const { trackSearch, trackAdView } = useUserBehavior();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    condition: ''
  });

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleAdClick = (ad: any) => {
    trackAdView(ad);
    navigate(`/ad/${ad.id}`);
  };

  const handleSearch = () => {
    trackSearch(searchFilters);
    searchAds(searchFilters);
  };

  const handleClearSearch = () => {
    clearSearch();
    setSearchFilters({
      city: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price / 1000000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'منذ يوم واحد';
    if (diffDays <= 7) return `منذ ${diffDays} أيام`;
    if (diffDays <= 30) return `منذ ${Math.ceil(diffDays / 7)} أسابيع`;
    return `منذ ${Math.ceil(diffDays / 30)} شهر`;
  };

  // Determine which ads to display
  const displayAds = hasSearched ? searchResults : (ads || []);
  const isLoadingAds = hasSearched ? isSearching : isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-24 h-24 border-2 border-amber-500 bg-transparent rounded-lg p-2 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/6e1da3af-20f1-469a-8fb3-547fa3c534ac.png" 
                    alt="الكرين" 
                    className="w-28 h-28 object-contain transform scale-110"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-800">الكرين</h1>
                  <p className="text-xs text-blue-600">موقع السيارات الأول في السودان</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">الرئيسية</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">البحث</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">عنا</a>
              </nav>
            </div>
            
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">مرحباً، {user.user_metadata?.full_name || user.email}</span>
                  
                  {/* Add Ad Button */}
                  <Button 
                    onClick={() => user ? setShowCreateModal(true) : navigate('/auth')}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 hidden sm:flex"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة إعلان
                  </Button>
                  
                  {/* Mobile Add Ad Button */}
                  <Button 
                    onClick={() => user ? setShowCreateModal(true) : navigate('/auth')}
                    size="sm"
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 sm:hidden"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>

                  {/* My Account Button */}
                  <Button 
                    onClick={handleDashboardClick}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <User className="w-4 h-4 ml-2" />
                    <span className="hidden sm:inline">حسابي</span>
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleAuthClick}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative py-16 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              اشتري وبيع بمزاجك
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              أكثر من {ads?.length || 0} سيارة متاحة للبيع في جميع أنحاء السودان
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    الولاية
                  </label>
                  <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, city: value }))}>
                    <SelectTrigger className="h-12 text-right">
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الخرطوم">الخرطوم</SelectItem>
                      <SelectItem value="الجزيرة">الجزيرة</SelectItem>
                      <SelectItem value="النيل الأبيض">النيل الأبيض</SelectItem>
                      <SelectItem value="سنار">سنار</SelectItem>
                      <SelectItem value="النيل الأزرق">النيل الأزرق</SelectItem>
                      <SelectItem value="القضارف">القضارف</SelectItem>
                      <SelectItem value="كسلا">كسلا</SelectItem>
                      <SelectItem value="البحر الأحمر">البحر الأحمر</SelectItem>
                      <SelectItem value="الشمالية">الشمالية</SelectItem>
                      <SelectItem value="نهر النيل">نهر النيل</SelectItem>
                      <SelectItem value="شمال كردفان">شمال كردفان</SelectItem>
                      <SelectItem value="جنوب كردفان">جنوب كردفان</SelectItem>
                      <SelectItem value="غرب كردفان">غرب كردفان</SelectItem>
                      <SelectItem value="شمال دارفور">شمال دارفور</SelectItem>
                      <SelectItem value="جنوب دارفور">جنوب دارفور</SelectItem>
                      <SelectItem value="شرق دارفور">شرق دارفور</SelectItem>
                      <SelectItem value="غرب دارفور">غرب دارفور</SelectItem>
                      <SelectItem value="وسط دارفور">وسط دارفور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    العلامة التجارية
                  </label>
                  <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, brand: value }))}>
                    <SelectTrigger className="h-12 text-right">
                      <SelectValue placeholder="اختر العلامة التجارية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="تويوتا">تويوتا (Toyota)</SelectItem>
                      <SelectItem value="نيسان">نيسان (Nissan)</SelectItem>
                      <SelectItem value="هيونداي">هيونداي (Hyundai)</SelectItem>
                      <SelectItem value="كيا">كيا (Kia)</SelectItem>
                      <SelectItem value="ميتسوبيشي">ميتسوبيشي (Mitsubishi)</SelectItem>
                      <SelectItem value="هوندا">هوندا (Honda)</SelectItem>
                      <SelectItem value="سوزوكي">سوزوكي (Suzuki)</SelectItem>
                      <SelectItem value="شيفروليه">شيفروليه (Chevrolet)</SelectItem>
                      <SelectItem value="فورد">فورد (Ford)</SelectItem>
                      <SelectItem value="مرسيدس بنز">مرسيدس بنز (Mercedes-Benz)</SelectItem>
                      <SelectItem value="بي إم دبليو">بي إم دبليو (BMW)</SelectItem>
                      <SelectItem value="جيب">جيب (Jeep)</SelectItem>
                      <SelectItem value="لاند روفر">لاند روفر (Land Rover)</SelectItem>
                      <SelectItem value="دايهاتسو">دايهاتسو (Daihatsu)</SelectItem>
                      <SelectItem value="جيلي">جيلي (Geely)</SelectItem>
                      <SelectItem value="شيري">شيري (Chery)</SelectItem>
                      <SelectItem value="هافال">هافال (Haval)</SelectItem>
                      <SelectItem value="فوتون">فوتون (Foton)</SelectItem>
                      <SelectItem value="بايك">بايك (BAIC)</SelectItem>
                      <SelectItem value="ايسوزو">ايسوزو (Isuzu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    نطاق السعر
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="من" 
                      className="h-12 text-right" 
                      value={searchFilters.minPrice}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    />
                    <Input 
                      placeholder="إلى" 
                      className="h-12 text-right"
                      value={searchFilters.maxPrice}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    الحالة
                  </label>
                  <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger className="h-12 text-right">
                      <SelectValue placeholder="حالة السيارة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديدة</SelectItem>
                      <SelectItem value="excellent">ممتازة</SelectItem>
                      <SelectItem value="good">جيدة جداً</SelectItem>
                      <SelectItem value="fair">جيدة</SelectItem>
                      <SelectItem value="used">مستعملة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg shadow-lg"
                >
                  <Search className="w-5 h-5 ml-3" />
                  {isSearching ? 'جارٍ البحث...' : 'ابحث الآن'}
                </Button>
                
                {hasSearched && (
                  <Button 
                    onClick={handleClearSearch}
                    variant="outline"
                    className="h-14 px-8 text-lg font-bold"
                  >
                    مسح البحث
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Plan Card */}
      {!isPremium && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <PremiumCard variant="home" />
          </div>
        </section>
      )}

      {/* إعلان في أعلى الصفحة */}
      <AdComponent placement="header_banner" size="large" className="container mx-auto px-4 py-4" />

      {/* Ads Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {hasSearched ? `نتائج البحث (${displayAds.length})` : 'السيارات المتاحة'}
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {hasSearched 
                ? (displayAds.length > 0 ? 'إليك النتائج التي عثرنا عليها' : 'لم نعثر على نتائج مطابقة لبحثك')
                : 'اكتشف أفضل العروض المتاحة من البائعين الموثوقين'
              }
            </p>
          </div>

          {isLoadingAds ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayAds?.map((ad, index) => {
                const isPremium = ad.is_premium || ad.profiles?.is_premium;
                const isFeatured = ad.is_featured;
                const showSponsoredAd = index === 1; // جدول واحد فقط بعد البطاقة الثانية
                
                return (
                  <>
                    <Card key={ad.id} className={`group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white cursor-pointer ${
                      isPremium ? 'premium-card ring-2 ring-amber-300' : 
                      isFeatured ? 'featured-card' : ''
                    }`}>
                      <div className="relative">
                        <img 
                          src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop"}
                          alt={ad.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                          {isPremium && (
                            <Badge className="premium-badge border-0">
                              <Star className="w-3 h-3 ml-1" />
                              مميز
                            </Badge>
                          )}
                          {isFeatured && !isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                              <Star className="w-3 h-3 ml-1" />
                              مُروّج
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <Badge variant="outline" className="bg-black/70 text-white border-none">
                            <Eye className="w-3 h-3 ml-1" />
                            {ad.views_count}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h3 
                            className={`text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 ${
                              isPremium ? 'text-amber-700' : 'text-gray-800'
                            }`}
                            onClick={() => handleAdClick(ad)}
                          >
                            {ad.title}
                          </h3>
                          <p className={`text-3xl font-bold mb-3 ${
                            isPremium ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {formatPrice(ad.price)} مليون جنيه
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{ad.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>سنة الصنع: {ad.year}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{ad.brand}</span>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {formatDate(ad.created_at)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {(ad.profiles as any)?.full_name?.charAt(0) || 'م'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {(ad.profiles as any)?.full_name || 'مستخدم'}
                              </p>
                              {(ad.profiles as any)?.is_premium && (
                                <p className="text-xs text-amber-600">موثق ✓</p>
                              )}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className={`${
                              isPremium 
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            onClick={() => handleAdClick(ad)}
                          >
                            مشاهدة التفاصيل
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* جدول إعلانات ممولة صغير بعد كل بطاقتين */}
                    {showSponsoredAd && (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 my-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">إعلانات ممولة</span>
                            <Badge variant="outline" className="text-xs">
                              Sponsored
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <AdComponent 
                              placement="sponsored_small" 
                              size="medium" 
                              className="h-20 rounded-md"
                            />
                            <AdComponent 
                              placement="sponsored_small" 
                              size="medium" 
                              className="h-20 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
            </div>
          )}

          {displayAds && displayAds.length === 0 && !isLoadingAds && (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {hasSearched ? 'لم نعثر على نتائج' : 'لا توجد إعلانات متاحة'}
              </h3>
              <p className="text-gray-500">
                {hasSearched ? 'جرب تعديل معايير البحث' : 'تحقق مرة أخرى لاحقاً'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Suggested Ads Section */}
      <SuggestedAds 
        limit={6}
        title="سيارات مقترحة"
        className="bg-gray-50"
      />

      {/* إعلان في ذيل الصفحة */}
      <AdComponent placement="footer_banner" size="large" className="container mx-auto px-4 py-4" />

      {/* Create Ad Modal */}
      <CreateAdModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
};

export default Index;