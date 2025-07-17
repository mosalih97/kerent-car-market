
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X } from 'lucide-react';

interface EditAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ad: any;
}

const EditAdModal = ({ open, onOpenChange, ad }: EditAdModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    condition: 'used',
    city: '',
    phone: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        price: ad.price?.toString() || '',
        brand: ad.brand || '',
        model: ad.model || '',
        year: ad.year?.toString() || '',
        mileage: ad.mileage?.toString() || '',
        condition: ad.condition || 'used',
        city: ad.city || '',
        phone: ad.phone || '',
        images: ad.images || []
      });
    }
  }, [ad]);

  const updateAdMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('ads')
        .update({
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          brand: data.brand,
          model: data.model,
          year: parseInt(data.year),
          mileage: data.mileage ? parseInt(data.mileage) : null,
          condition: data.condition,
          city: data.city,
          phone: data.phone,
          images: data.images,
          updated_at: new Date().toISOString()
        })
        .eq('id', ad.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث الإعلان بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating ad:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإعلان",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.brand || !formData.model || !formData.year || !formData.city || !formData.phone) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    updateAdMutation.mutate(formData);
  };

  const cities = [
    'الخرطوم', 'الخرطوم بحري', 'أم درمان', 'مدني', 'الأبيض', 'نيالا', 'الفاشر', 'كسلا', 'بورتسودان', 'الدمازين'
  ];

  const brands = [
    'تويوتا', 'نيسان', 'هيونداي', 'كيا', 'مرسيدس', 'بي إم دبليو', 'أودي', 'فولكس واجن', 'فورد', 'شيفروليه'
  ];

  const conditions = [
    { value: 'new', label: 'جديد' },
    { value: 'excellent', label: 'ممتاز' },
    { value: 'good', label: 'جيد' },
    { value: 'used', label: 'مستعمل' },
    { value: 'fair', label: 'مقبول' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الإعلان</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">عنوان الإعلان *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="مثال: تويوتا كامري 2020"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">السعر (مليون جنيه سوداني) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="مثال: 150000"
                required
              />
            </div>

            <div>
              <Label htmlFor="brand">الماركة *</Label>
              <Select value={formData.brand} onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الماركة" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model">الموديل *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="مثال: كامري"
                required
              />
            </div>

            <div>
              <Label htmlFor="year">سنة الصنع *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                placeholder="مثال: 2020"
                min="1990"
                max="2025"
                required
              />
            </div>

            <div>
              <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                placeholder="مثال: 50000"
              />
            </div>

            <div>
              <Label htmlFor="condition">الحالة *</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">المدينة *</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="مثال: 0912345678"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="اكتب وصفاً مفصلاً للسيارة..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={updateAdMutation.isPending}>
              {updateAdMutation.isPending ? 'جاري التحديث...' : 'تحديث الإعلان'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdModal;
