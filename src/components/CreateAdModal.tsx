
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAd } from "@/hooks/useAds";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface CreateAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  condition: 'new' | 'used' | 'excellent' | 'good' | 'fair';
  city: string;
  phone: string;
}

const CreateAdModal = ({ open, onOpenChange }: CreateAdModalProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();
  const createAdMutation = useCreateAd();
  const { uploadImages, uploading } = useImageUpload();

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
      let imageUrls: string[] = [];
      
      if (selectedImages.length > 0) {
        const fileList = new DataTransfer();
        selectedImages.forEach(file => fileList.items.add(file));
        imageUrls = await uploadImages(fileList.files);
      }

      await createAdMutation.mutateAsync({
        ...data,
        images: imageUrls,
      });

      toast.success("تم إنشاء الإعلان بنجاح!");
      
      // Clean up
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviewUrls([]);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error("حدث خطأ أثناء إنشاء الإعلان");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">إضافة إعلان جديد</DialogTitle>
        </DialogHeader>

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
                type="number"
                {...register("price", { 
                  required: "السعر مطلوب",
                  min: { value: 1, message: "السعر يجب أن يكون أكبر من صفر" }
                })}
                placeholder="1000000"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          {/* Car Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">الماركة *</Label>
              <Select onValueChange={(value) => setValue("brand", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الماركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toyota">تويوتا</SelectItem>
                  <SelectItem value="honda">هوندا</SelectItem>
                  <SelectItem value="nissan">نيسان</SelectItem>
                  <SelectItem value="hyundai">هيونداي</SelectItem>
                  <SelectItem value="bmw">بي إم دبليو</SelectItem>
                  <SelectItem value="mercedes">مرسيدس</SelectItem>
                  <SelectItem value="audi">أودي</SelectItem>
                  <SelectItem value="kia">كيا</SelectItem>
                  <SelectItem value="mazda">مازدا</SelectItem>
                  <SelectItem value="mitsubishi">ميتسوبيشي</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("brand", { required: "الماركة مطلوبة" })} />
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
                type="number"
                {...register("year", { 
                  required: "سنة الصنع مطلوبة",
                  min: { value: 1990, message: "السنة يجب أن تكون من 1990 أو أحدث" },
                  max: { value: new Date().getFullYear() + 1, message: "السنة غير صحيحة" }
                })}
                placeholder="2020"
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
            </div>

            <div>
              <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
              <Input
                id="mileage"
                type="number"
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
              <Label htmlFor="city">المدينة *</Label>
              <Select onValueChange={(value) => setValue("city", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الخرطوم">الخرطوم</SelectItem>
                  <SelectItem value="بورتسودان">بورتسودان</SelectItem>
                  <SelectItem value="مدني">مدني</SelectItem>
                  <SelectItem value="كسلا">كسلا</SelectItem>
                  <SelectItem value="نيالا">نيالا</SelectItem>
                  <SelectItem value="الأبيض">الأبيض</SelectItem>
                  <SelectItem value="القضارف">القضارف</SelectItem>
                  <SelectItem value="أم درمان">أم درمان</SelectItem>
                  <SelectItem value="الخرطوم بحري">الخرطوم بحري</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("city", { required: "المدينة مطلوبة" })} />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                {...register("phone", { 
                  required: "رقم الهاتف مطلوب",
                  pattern: { 
                    value: /^(\+249|0)?[19]\d{8}$/,
                    message: "رقم الهاتف غير صحيح" 
                  }
                })}
                placeholder="+249123456789"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
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
            disabled={createAdMutation.isPending || uploading}
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
