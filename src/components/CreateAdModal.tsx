
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateAd } from '@/hooks/useAds';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Car, Upload, X } from 'lucide-react';

interface CreateAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateAdModal = ({ open, onOpenChange }: CreateAdModalProps) => {
  const { user } = useAuth();
  const createAdMutation = useCreateAd();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    condition: 'used' as const,
    city: '',
    phone: ''
  });

  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      await createAdMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        condition: formData.condition,
        city: formData.city,
        phone: formData.phone,
        images: [] // We'll implement image upload later
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        price: '',
        brand: '',
        model: '',
        year: '',
        mileage: '',
        condition: 'used',
        city: '',
        phone: ''
      });
      setImages([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating ad:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setImages(prev => [...prev, ...fileList].slice(0, 6)); // Max 6 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Car className="w-5 h-5" />
            إضافة إعلان جديد
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الإعلان</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="مثال: تويوتا كامري 2020"
                className="text-right"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">السعر (جنيه سوداني)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="45000"
                className="text-right"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">الماركة</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الماركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toyota">تويوتا</SelectItem>
                  <SelectItem value="honda">هوندا</SelectItem>
                  <SelectItem value="nissan">نيسان</SelectItem>
                  <SelectItem value="hyundai">هيونداي</SelectItem>
                  <SelectItem value="bmw">بي ام دبليو</SelectItem>
                  <SelectItem value="mercedes">مرسيدس</SelectItem>
                  <SelectItem value="kia">كيا</SelectItem>
                  <SelectItem value="mazda">مازدا</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">الموديل</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="كامري"
                className="text-right"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">سنة الصنع</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                placeholder="2020"
                className="text-right"
                min="1990"
                max="2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                placeholder="85000"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">حالة السيارة</Label>
              <Select onValueChange={(value: any) => setFormData(prev => ({ ...prev, condition: value }))}>
                <SelectTrigger className="text-right">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">المدينة</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الخرطوم">الخرطوم</SelectItem>
                  <SelectItem value="بورتسودان">بورتسودان</SelectItem>
                  <SelectItem value="مدني">مدني</SelectItem>
                  <SelectItem value="كسلا">كسلا</SelectItem>
                  <SelectItem value="نيالا">نيالا</SelectItem>
                  <SelectItem value="الأبيض">الأبيض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+249123456789"
              className="text-right"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="اكتب وصفاً مفصلاً للسيارة..."
              className="text-right min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>صور السيارة (اختياري)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="images"
              />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">انقر لرفع الصور (حد أقصى 6 صور)</p>
              </label>
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={createAdMutation.isPending}
            >
              {createAdMutation.isPending ? 'جارٍ النشر...' : 'نشر الإعلان'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAdModal;
