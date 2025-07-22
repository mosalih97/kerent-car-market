import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Car, DollarSign, Filter, Star, Eye, Plus, User, Heart, Share2, Phone, MessageCircle, Zap, Sparkles, Cpu } from "lucide-react";
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
    <div className="min-h-screen bg-background cyber-grid" dir="rtl">
      {/* Futuristic Header */}
      <header className="glass-dark border-b border-border/20 sticky top-0 z-50 backdrop-blur-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 neon-border p-2 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/6e1da3af-20f1-469a-8fb3-547fa3c534ac.png" 
                    alt="الكرين" 
                    className="w-20 h-20 object-contain transform scale-110"
                  />
                  <div className="absolute inset-0 bg-accent/10 rounded-xl"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient-primary">الكرين</h1>
                  <p className="text-xs text-muted-foreground">مستقبل السيارات في السودان</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  <Sparkles className="w-4 h-4 ml-2" />
                  الرئيسية
                </Button>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  <Search className="w-4 h-4 ml-2" />
                  البحث
                </Button>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  <Cpu className="w-4 h-4 ml-2" />
                  عنا
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    مرحباً، {user.user_metadata?.full_name || user.email}
                  </span>
                  
                  <Button 
                    onClick={() => user ? setShowCreateModal(true) : navigate('/auth')}
                    variant="premium"
                    size="lg"
                    className="hidden sm:flex"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة إعلان
                  </Button>
                  
                  <Button 
                    onClick={() => user ? setShowCreateModal(true) : navigate('/auth')}
                    variant="premium"
                    size="icon"
                    className="sm:hidden"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>

                  <Button 
                    onClick={handleDashboardClick}
                    variant="cyber"
                    size="lg"
                  >
                    <User className="w-4 h-4 ml-2" />
                    <span className="hidden sm:inline">حسابي</span>
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleAuthClick}
                  variant="default"
                  size="lg"
                >
                  <Zap className="w-4 h-4 ml-2" />
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Cyberpunk Style */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="absolute inset-0">
          <div className="cyber-grid opacity-30"></div>
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient-primary">المستقبل</span>
              <br />
              <span className="text-gradient-secondary">يبدأ هنا</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              تجربة شراء سيارات بتقنية عصرية • أكثر من {ads?.length || 0} سيارة متاحة
            </p>
            
            <div className="flex justify-center gap-4 mt-8">
              <div className="glass-dark px-6 py-3 rounded-full">
                <Sparkles className="w-5 h-5 text-accent inline ml-2" />
                <span className="text-accent font-bold">تقنية متطورة</span>
              </div>
              <div className="glass-dark px-6 py-3 rounded-full">
                <Zap className="w-5 h-5 text-primary inline ml-2" />
                <span className="text-primary font-bold">بحث ذكي</span>
              </div>
            </div>
          </div>

          {/* Modern Search Interface */}
          <div className="max-w-6xl mx-auto">
            <Card className="card-glow p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    الموقع
                  </label>
                  <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, city: value }))}>
                    <SelectTrigger className="h-14 text-right glass-light border-border/50">
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent className="glass-dark">
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

                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    العلامة التجارية
                  </label>
                  <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, brand: value }))}>
                    <SelectTrigger className="h-14 text-right glass-light border-border/50">
                      <SelectValue placeholder="اختر العلامة التجارية" />
                    </SelectTrigger>
                    <SelectContent className="glass-dark">
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

                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    نطاق السعر
                  </label>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="من" 
                      className="h-14 text-right glass-light border-border/50" 
                      value={searchFilters.minPrice}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    />
                    <Input 
                      placeholder="إلى" 
                      className="h-14 text-right glass-light border-border/50"
                      value={searchFilters.maxPrice}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    الحالة
                  </label>
                  <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger className="h-14 text-right glass-light border-border/50">
                      <SelectValue placeholder="حالة السيارة" />
                    </SelectTrigger>
                    <SelectContent className="glass-dark">
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
                  variant="default"
                  size="xl"
                  className="flex-1"
                >
                  <Search className="w-5 h-5 ml-3" />
                  {isSearching ? 'جارٍ البحث...' : 'ابحث الآن'}
                </Button>
                
                {hasSearched && (
                  <Button 
                    onClick={handleClearSearch}
                    variant="outline"
                    size="xl"
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
        <section className="py-8">
          <div className="container mx-auto px-4">
            <PremiumCard variant="home" />
          </div>
        </section>
      )}

      {/* Ad Component */}
      <AdComponent placement="header_banner" size="large" className="container mx-auto px-4 py-4" />

      {/* Modern Ads Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              {hasSearched ? (
                <>
                  <span className="text-gradient-primary">نتائج البحث</span>
                  <span className="text-muted-foreground"> ({displayAds.length})</span>
                </>
              ) : (
                <span className="text-gradient-secondary">السيارات المتاحة</span>
              )}
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {hasSearched 
                ? (displayAds.length > 0 ? 'إليك النتائج التي عثرنا عليها' : 'لم نعثر على نتائج مطابقة لبحثك')
                : 'اكتشف أفضل العروض المتاحة من البائعين الموثوقين'
              }
            </p>
          </div>

          {isLoadingAds ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse h-96">
                  <div className="h-48 bg-muted rounded-t-2xl"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayAds?.map((ad, index) => {
                const isPremium = ad.is_premium || ad.profiles?.is_premium;
                const isFeatured = ad.is_featured;
                const showSponsoredAd = (index + 1) % 2 === 0;
                
                return (
                  <>
                    <Card key={ad.id} className={`group cursor-pointer transition-all duration-500 hover:scale-[1.02] ${
                      isPremium ? 'premium-card' : 
                      isFeatured ? 'featured-card' : 'card-glow'
                    }`}>
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <img 
                          src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop"}
                          alt={ad.title}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        
                        {/* Status Badges */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          {isPremium && (
                            <Badge className="premium-badge">
                              <Star className="w-3 h-3 ml-1" />
                              مميز
                            </Badge>
                          )}
                          {isFeatured && (
                            <Badge className="bg-featured text-featured-foreground">
                              <Sparkles className="w-3 h-3 ml-1" />
                              منتقى
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <SaveAdButton 
                            adId={ad.id} 
                            className="glass-dark rounded-full p-2 w-10 h-10 hover:scale-110"
                          />
                          <ShareAdButton 
                            adId={ad.id}
                            adTitle={ad.title}
                            className="glass-dark rounded-full p-2 w-10 h-10 hover:scale-110"
                          />
                        </div>

                        {/* Quick View Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <Button 
                            onClick={() => handleAdClick(ad)}
                            variant="ghost"
                            size="sm"
                            className="glass-light text-foreground"
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-6" onClick={() => handleAdClick(ad)}>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight">
                              {ad.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {ad.year} • {ad.mileage?.toLocaleString()} كم • {ad.city}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gradient-primary">
                                {formatPrice(ad.price)} مليون
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(ad.created_at)}
                              </p>
                            </div>
                            
                            {/* Seller Info */}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-foreground" />
                              </div>
                            </div>
                          </div>

                          {/* Modern Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="cyber" 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle contact
                              }}
                            >
                              <MessageCircle className="w-4 h-4 ml-2" />
                              محادثة
                            </Button>
                            <Button 
                              variant="neon" 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle call
                              }}
                            >
                              <Phone className="w-4 h-4 ml-2" />
                              اتصال
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sponsored Ad Integration */}
                    {showSponsoredAd && (
                      <AdComponent 
                        placement="between_ads" 
                        size="medium"
                        className="md:col-span-2 lg:col-span-1"
                      />
                    )}
                  </>
                );
              })}
            </div>
          )}

          {!isLoadingAds && displayAds?.length === 0 && hasSearched && (
            <div className="text-center py-16">
              <div className="glass-dark rounded-2xl p-8 max-w-md mx-auto">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-bold text-foreground mb-2">لا توجد نتائج</h4>
                <p className="text-muted-foreground mb-6">جرب تعديل معايير البحث للحصول على نتائج أفضل</p>
                <Button onClick={handleClearSearch} variant="outline">
                  مسح البحث
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Suggested Ads */}
      <SuggestedAds />

      {/* Bottom Ad Component */}
      <AdComponent placement="footer_banner" size="large" className="container mx-auto px-4 py-8" />

      {/* Create Ad Modal */}
      <CreateAdModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
};

export default Index;