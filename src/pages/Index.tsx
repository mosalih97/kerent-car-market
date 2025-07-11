
import { Search, MapPin, Car, DollarSign, Filter, Star, Eye, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const featuredCars = [
    {
      id: 1,
      title: "تويوتا كامري 2020",
      price: "45,000",
      location: "الخرطوم",
      year: "2020",
      mileage: "85,000",
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      condition: "ممتازة",
      images: ["https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop"],
      isFeatured: true,
      isPremium: false,
      views: 234,
      seller: "أحمد محمد",
      isVerified: true,
      postedDate: "منذ 3 أيام"
    },
    {
      id: 2,
      title: "هوندا أكورد 2019",
      price: "38,000",
      location: "بورتسودان",
      year: "2019",
      mileage: "95,000",
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      condition: "جيدة جداً",
      images: ["https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop"],
      isFeatured: false,
      isPremium: true,
      views: 156,
      seller: "محمد عثمان",
      isVerified: false,
      postedDate: "منذ يوم واحد"
    },
    {
      id: 3,
      title: "نيسان التيما 2021",
      price: "52,000",
      location: "مدني",
      year: "2021",
      mileage: "45,000",
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      condition: "ممتازة",
      images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop"],
      isFeatured: true,
      isPremium: true,
      views: 312,
      seller: "فاطمة أحمد",
      isVerified: true,
      postedDate: "منذ 2 أيام"
    },
    {
      id: 4,
      title: "هيونداي إلنترا 2018",
      price: "28,000",
      location: "كسلا",
      year: "2018",
      mileage: "120,000",
      fuel: "بنزين",
      transmission: "عادي",
      condition: "جيدة",
      images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop"],
      isFeatured: false,
      isPremium: false,
      views: 89,
      seller: "عبدالله حسن",
      isVerified: false,
      postedDate: "منذ 5 أيام"
    },
    {
      id: 5,
      title: "تويوتا كورولا 2022",
      price: "58,000",
      location: "الخرطوم",
      year: "2022",
      mileage: "25,000",
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      condition: "جديدة",
      images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop"],
      isFeatured: true,
      isPremium: false,
      views: 445,
      seller: "يوسف إبراهيم",
      isVerified: true,
      postedDate: "منذ ساعتين"
    },
    {
      id: 6,
      title: "بي ام دبليو X3 2017",
      price: "75,000",
      location: "الخرطوم",
      year: "2017",
      mileage: "110,000",
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      condition: "ممتازة",
      images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop"],
      isFeatured: false,
      isPremium: true,
      views: 178,
      seller: "مريم صالح",
      isVerified: true,
      postedDate: "منذ 4 أيام"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-800">الكيرين</h1>
                  <p className="text-xs text-blue-600">موقع السيارات الأول في السودان</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">الرئيسية</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">البحث</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">إضافة إعلان</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">عنا</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="hidden sm:flex">
                <MessageCircle className="w-4 h-4 ml-2" />
                الرسائل
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                تسجيل الدخول
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Custom Search */}
      <section className="relative py-16 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              اعثر على سيارة أحلامك
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              أكثر من 10,000 سيارة متاحة للبيع في جميع أنحاء السودان
            </p>
          </div>

          {/* Custom Search Box */}
          <div className="max-w-5xl mx-auto">
            <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    المدينة
                  </label>
                  <Select>
                    <SelectTrigger className="h-12 text-right">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="khartoum">الخرطوم</SelectItem>
                      <SelectItem value="portsudan">بورتسودان</SelectItem>
                      <SelectItem value="madani">مدني</SelectItem>
                      <SelectItem value="kassala">كسلا</SelectItem>
                      <SelectItem value="nyala">نيالا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    الماركة والموديل
                  </label>
                  <Select>
                    <SelectTrigger className="h-12 text-right">
                      <SelectValue placeholder="اختر الماركة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toyota">تويوتا</SelectItem>
                      <SelectItem value="honda">هوندا</SelectItem>
                      <SelectItem value="nissan">نيسان</SelectItem>
                      <SelectItem value="hyundai">هيونداي</SelectItem>
                      <SelectItem value="bmw">بي ام دبليو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    نطاق السعر
                  </label>
                  <div className="flex gap-2">
                    <Input placeholder="من" className="h-12 text-right" />
                    <Input placeholder="إلى" className="h-12 text-right" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    الحالة
                  </label>
                  <Select>
                    <SelectTrigger className="h-12 text-right">
                      <SelectValue placeholder="حالة السيارة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديدة</SelectItem>
                      <SelectItem value="excellent">ممتازة</SelectItem>
                      <SelectItem value="very-good">جيدة جداً</SelectItem>
                      <SelectItem value="good">جيدة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg shadow-lg">
                <Search className="w-5 h-5 ml-3" />
                ابحث الآن
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              السيارات المميزة
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              اكتشف أفضل العروض المتاحة من البائعين الموثوقين
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <Card key={car.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white">
                <div className="relative">
                  <img 
                    src={car.images[0]} 
                    alt={car.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {car.isFeatured && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                        <Star className="w-3 h-3 ml-1" />
                        مميز
                      </Badge>
                    )}
                    {car.isPremium && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                        بريميوم
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      <Eye className="w-3 h-3 ml-1" />
                      {car.views}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {car.title}
                    </h4>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-600">${car.price}</p>
                      <p className="text-sm text-gray-500">جنيه سوداني</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{car.location}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm">{car.postedDate}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 mb-1">السنة</p>
                      <p className="font-semibold text-gray-800">{car.year}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 mb-1">المسافة</p>
                      <p className="font-semibold text-gray-800">{car.mileage} كم</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 mb-1">الوقود</p>
                      <p className="font-semibold text-gray-800">{car.fuel}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 mb-1">ناقل الحركة</p>
                      <p className="font-semibold text-gray-800">{car.transmission}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {car.seller.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{car.seller}</p>
                        {car.isVerified && (
                          <p className="text-xs text-green-600">موثق ✓</p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Phone className="w-4 h-4 ml-2" />
                      اتصل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              عرض جميع السيارات
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-4xl font-bold mb-2">10,000+</h4>
              <p className="text-blue-200">سيارة متاحة</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">5,000+</h4>
              <p className="text-blue-200">عميل راضي</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">18</h4>
              <p className="text-blue-200">ولاية مغطاة</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">24/7</h4>
              <p className="text-blue-200">دعم العملاء</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h5 className="text-xl font-bold">الكيرين</h5>
              </div>
              <p className="text-gray-400 mb-4">
                موقع السيارات الأول في السودان. نساعدك في العثور على السيارة المثالية.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">روابط سريعة</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">عن الموقع</a></li>
                <li><a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">للبائعين</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">إضافة إعلان</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الأسعار</a></li>
                <li><a href="#" className="hover:text-white transition-colors">نصائح البيع</a></li>
                <li><a href="#" className="hover:text-white transition-colors">دليل البائع</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">تواصل معنا</h6>
              <ul className="space-y-2 text-gray-400">
                <li>هاتف: +249 123 456 789</li>
                <li>بريد: info@alkeren.com</li>
                <li>العنوان: الخرطوم، السودان</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 الكيرين. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
