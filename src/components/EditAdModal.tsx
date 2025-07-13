
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUpdateAd } from '@/hooks/useAds';
import { useToast } from '@/hooks/use-toast';

interface Ad {
  id: string;
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

interface EditAdModalProps {
  ad: Ad | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditAdModal = ({ ad, open, onOpenChange }: EditAdModalProps) => {
  const { toast } = useToast();
  const updateAdMutation = useUpdateAd();
  
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

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title,
        description: ad.description || '',
        price: ad.price.toString(),
        brand: ad.brand,
        model: ad.model,
        year: ad.year.toString(),
        mileage: ad.mileage?.toString() || '',
        condition: ad.condition,
        city: ad.city,
        phone: ad.phone
      });
    }
  }, [ad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ad) return;

    try {
      await updateAdMutation.mutateAsync({
        id: ad.id,
        ...formData,
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined
      });

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث إعلانك بنجاح"
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الإعلان",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    const priceInMillions = price / 1000000;
    return `${priceInMillions.toFixed(2)} مليون جنيه سوداني`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الإعلان</DialogTitle>
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">السعر (بالجنيه السوداني)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="مثال: 50000000"
                required
              />
              {formData.price && (
                <p className="text-sm text-gray-600">
                  السعر: {formatPrice(parseFloat(formData.price) || 0)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">العلامة التجارية</Label>
              <Select 
                value={formData.brand} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
              >
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">الموديل</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="مثال: كامري"
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
                placeholder="مثال: 2020"
                min="1990"
                max={new Date().getFullYear()}
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
                placeholder="مثال: 50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">حالة السيارة</Label>
              <Select 
                value={formData.condition} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Select 
                value={formData.city} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الخرطوم">الخرطوم</SelectItem>
                  <SelectItem value="الجزيرة">الجزيرة</SelectItem>
                  <SelectItem value="النيل الأبيض">النيل الأبيض</SelectItem>
                  <SelectItem value="سنار">سنار</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="مثال: +249123456789"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف السيارة</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="اكتب وصفاً مفصلاً للسيارة..."
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={updateAdMutation.isPending}
              className="flex-1"
            >
              {updateAdMutation.isPending ? 'جاري التحديث...' : 'تحديث الإعلان'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdModal;
