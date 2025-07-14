
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAd } from "@/hooks/useAds";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAdLimits, useCheckAdLimit } from "@/hooks/useAdLimits";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { X, Upload, AlertCircle, Star, Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  brand: string;
  model: string;
  year: string;
  mileage?: string;
  condition: 'new' | 'used' | 'excellent' | 'good' | 'fair';
  city: string;
  localCity?: string;
  phone: string;
  whatsapp: string;
}

const CreateAdModal = ({ open, onOpenChange }: CreateAdModalProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();
  const createAdMutation = useCreateAd();
  const { uploadImages, uploading } = useImageUpload();
  const { data: adLimits } = useAdLimits();
  const { data: canCreateAd } = useCheckAdLimit();
  const { profile } = useProfile();

  console.log('Ad limits:', adLimits);
  console.log('Can create ad:', canCreateAd);
  console.log('Profile:', profile);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const newImages = [...selectedImages, ...fileArray].slice(0, 6); // Max 6 images
    setSelectedImages(newImages);

    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    // Clean up old URLs
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    // Clean up removed URL
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form data:', data);
      
      // Validate required fields
      if (!data.title?.trim()) {
        toast.error("عنوان الإعلان مطلوب");
        return;
      }
      
      if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
        toast.error("يجب إدخال سعر صحيح");
        return;
      }
      
      if (!data.brand) {
        toast.error("العلامة التجارية مطلوبة");
        return;
      }
      
      if (!data.model?.trim()) {
        toast.error("الموديل مطلوب");
        return;
      }
      
      if (!data.year || isNaN(Number(data.year)) || Number(data.year) < 1990 || Number(data.year) > new Date().getFullYear() + 1) {
        toast.error("يجب إدخال سنة صنع صحيحة");
        return;
      }
      
      if (!data.condition) {
        toast.error("حالة السيارة مطلوبة");
        return;
      }
      
      if (!data.city) {
        toast.error("الولاية مطلوبة");
        return;
      }
      
      if (!data.phone?.trim()) {
        toast.error("رقم الهاتف مطلوب");
        return;
      }

      if (!data.whatsapp?.trim()) {
        toast.error("رقم الواتساب مطلوب");
        return;
      }

      let imageUrls: string[] = [];
      
      if (selectedImages.length > 0) {
        console.log('Uploading images...');
        const fileList = new DataTransfer();
        selectedImages.forEach(file => fileList.items.add(file));
        imageUrls = await uploadImages(fileList.files);
        console.log('Images uploaded:', imageUrls);
      }

      const adData = {
        title: data.title.trim(),
        description: data.description?.trim() || "",
        price: Number(data.price),
        brand: data.brand,
        model: data.model.trim(),
        year: Number(data.year),
        mileage: data.mileage ? Number(data.mileage) : undefined,
        condition: data.condition,
        city: data.localCity?.trim() ? `${data.city} - ${data.localCity.trim()}` : data.city,
        phone: data.phone.trim(),
        images: imageUrls,
      };

      console.log('Creating ad with data:', adData);
      
      await createAdMutation.mutateAsync(adData);

      toast.success("تم إنشاء الإعلان بنجاح!");
      
      // Clean up
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviewUrls([]);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating ad:', error);
      if (error instanceof Error) {
        toast.error(`خطأ: ${error.message}`);
      } else {
        toast.error("حدث خطأ أثناء إنشاء الإعلان. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">إضافة إعلان جديد</DialogTitle>
        </DialogHeader>

        {/* عرض حدود الإعلانات */}
        {adLimits && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-right">
              {profile?.is_premium ? (
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-600 font-medium">
                    عضو مميز - إعلانات غير محدودة
                  </span>
                </div>
              ) : canCreateAd ? (
                <span className="text-green-600 font-medium">
                  يمكنك إضافة {adLimits.max_ads - adLimits.ads_count} إعلان إضافي هذا الشهر
                  ({adLimits.ads_count}/{adLimits.max_ads} مستخدم)
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  لقد وصلت للحد الأقصى من الإعلانات هذا الشهر ({adLimits.max_ads} إعلانات).
                  <br />
                  <span className="text-blue-600 hover:underline cursor-pointer inline-flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    ترقية الحساب للحصول على إعلانات غير محدودة
                  </span>
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images Upload */}
          <div className="space-y-4">
            <Label>صور السيارة (اختياري - حتى 6 صور)</Label>
            
            {/* Image previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`صورة ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {selectedImages.length < 6 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-gray-600">اضغط لاختيار الصور</p>
                  <p className="text-sm text-gray-500">PNG, JPG, WEBP حتى 10MB</p>
                </label>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">عنوان الإعلان *</Label>
              <Input
                id="title"
                {...register("title", { required: "عنوان الإعلان مطلوب" })}
                placeholder="مثال: تويوتا كامري 2020 للبيع"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="price">السعر (جنيه سوداني) *</Label>
              <Input
                id="price"
                type="text"
                {...register("price", { 
                  required: "السعر مطلوب"
                })}
                placeholder="1000000"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          {/* Car Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">العلامة التجارية *</Label>
              <Select onValueChange={(value) => setValue("brand", value)}>
                <SelectTrigger>
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
              <input type="hidden" {...register("brand", { required: "العلامة التجارية مطلوبة" })} />
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
            </div>

            <div>
              <Label htmlFor="model">الموديل *</Label>
              <Input
                id="model"
                {...register("model", { required: "الموديل مطلوب" })}
                placeholder="مثال: كامري"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year">سنة الصنع *</Label>
              <Input
                id="year"
                type="text"
                {...register("year", { 
                  required: "سنة الصنع مطلوبة"
                })}
                placeholder="2020"
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
            </div>

            <div>
              <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
              <Input
                id="mileage"
                type="text"
                {...register("mileage")}
                placeholder="100000"
              />
            </div>

            <div>
              <Label htmlFor="condition">حالة السيارة *</Label>
              <Select onValueChange={(value: any) => setValue("condition", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">جديدة</SelectItem>
                  <SelectItem value="excellent">ممتازة</SelectItem>
                  <SelectItem value="good">جيدة</SelectItem>
                  <SelectItem value="fair">مقبولة</SelectItem>
                  <SelectItem value="used">مستعملة</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("condition", { required: "حالة السيارة مطلوبة" })} />
              {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>}
            </div>
          </div>

          {/* Location & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">الولاية *</Label>
              <Select onValueChange={(value) => setValue("city", value)}>
                <SelectTrigger>
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
              <input type="hidden" {...register("city", { required: "الولاية مطلوبة" })} />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <Label htmlFor="localCity">اكتب المدينة (اختياري)</Label>
              <Input
                id="localCity"
                {...register("localCity")}
                placeholder="مثال: الخرطوم"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                {...register("phone", { 
                  required: "رقم الهاتف مطلوب"
                })}
                placeholder="+249123456789"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="whatsapp">رقم الواتساب *</Label>
              <Input
                id="whatsapp"
                {...register("whatsapp", { 
                  required: "رقم الواتساب مطلوب"
                })}
                placeholder="+249123456789"
              />
              {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">وصف الإعلان</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="اكتب وصفاً تفصيلياً للسيارة، حالتها، أي ملاحظات إضافية..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-3 text-lg"
            disabled={createAdMutation.isPending || uploading || (!profile?.is_premium && !canCreateAd)}
          >
            {createAdMutation.isPending || uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {uploading ? "جاري تحميل الصور..." : "جاري إنشاء الإعلان..."}
              </div>
            ) : (
              "نشر الإعلان"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAdModal;
