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
import { SaveAdButton } from "@/components/SaveAdButton";
import { ShareAdButton } from "@/components/ShareAdButton";
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
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-green-600 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full p-2 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/6e1da3af-20f1-469a-8fb3-547fa3c534ac.png" 
                  alt="الكرين" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold">سوق الكرين</h1>
                <p className="text-xs text-green-100">alsoug.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button 
                    onClick={() => user ? setShowCreateModal(true) : navigate('/auth')}
                    className="bg-white text-green-600 hover:bg-gray-100 text-sm"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    أضف إعلان
                  </Button>
                  
                  <Button 
                    onClick={handleDashboardClick}
                    className="bg-green-700 hover:bg-green-800 text-sm"
                    size="sm"
                  >
                    <User className="w-4 h-4 ml-1" />
                    حسابي
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleAuthClick}
                  className="bg-white text-green-600 hover:bg-gray-100 text-sm"
                  size="sm"
                >
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              وظائف السودان
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap"
            >
              منازل للبيع في ود مدني
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              بيوت للإيجار في ود مدني
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap"
            >
              عقارات دنقلا
            </Button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              أحدث الإعلانات المميزة في سوق السودان
            </h2>
          </div>

          <Card className="p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, city: value }))}>
                <SelectTrigger className="text-right">
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

              <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, brand: value }))}>
                <SelectTrigger className="text-right">
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

              <div className="flex gap-1">
                <Input 
                  placeholder="من" 
                  className="text-right text-sm" 
                  value={searchFilters.minPrice}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                />
                <Input 
                  placeholder="إلى" 
                  className="text-right text-sm"
                  value={searchFilters.maxPrice}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>

              <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, condition: value }))}>
                <SelectTrigger className="text-right">
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

            <div className="flex gap-2">
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
                size="sm"
              >
                <Search className="w-4 h-4 ml-2" />
                {isSearching ? 'جارٍ البحث...' : 'ابحث'}
              </Button>
              
              {hasSearched && (
                <Button 
                  onClick={handleClearSearch}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  مسح
                </Button>
              )}
            </div>
          </Card>
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
            <div className="space-y-4">
              {displayAds?.map((ad, index) => {
                const isPremium = ad.is_premium || ad.profiles?.is_premium;
                const isFeatured = ad.is_featured;
                const showSponsoredAd = (index + 1) % 2 === 0;
                
                return (
                  <>
                    <Card key={ad.id} className={`hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden bg-white cursor-pointer ${
                      isPremium ? 'border-l-4 border-l-amber-400' : ''
                    }`} onClick={() => handleAdClick(ad)}>
                      <div className="flex">
                        {/* Ad Image */}
                        <div className="w-32 h-24 flex-shrink-0 relative">
                          <img 
                            src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=150&fit=crop"}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                          {isPremium && (
                            <div className="absolute top-1 right-1">
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                            </div>
                          )}
                        </div>

                        {/* Ad Content */}
                        <div className="flex-1 p-4 flex justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
                              {ad.title}
                            </h3>
                            
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              SDG {formatPrice(ad.price)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{ad.city}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Car className="w-4 h-4" />
                                <span>{ad.brand}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <div onClick={(e) => e.stopPropagation()}>
                                <SaveAdButton 
                                  adId={ad.id} 
                                  className="w-10 h-8 border border-orange-300 hover:bg-orange-50"
                                />
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                دردشة
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                اتصال
                              </Button>
                            </div>
                          </div>

                          {/* User Avatar */}
                          <div className="flex flex-col items-center gap-2 ml-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              <User className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              {ad.profiles?.full_name || 'مستخدم'}
                            </div>
                          </div>
                        </div>
                      </div>
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