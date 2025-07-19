import React from 'react';
import { useAdDistributionStats } from '@/hooks/usePremiumAds';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Eye, Target, BarChart3 } from 'lucide-react';

interface AdPerformanceStatsProps {
  adId: string;
}

const AdPerformanceStats: React.FC<AdPerformanceStatsProps> = ({ adId }) => {
  const { data: stats, isLoading } = useAdDistributionStats(adId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد إحصائيات متاحة بعد</p>
        </CardContent>
      </Card>
    );
  }

  const placementData = [
    { name: 'رأس الصفحة', value: stats.header_impressions, color: 'bg-blue-500' },
    { name: 'الشريط الجانبي', value: stats.sidebar_impressions, color: 'bg-green-500' },
    { name: 'بين الإعلانات', value: stats.between_ads_impressions, color: 'bg-yellow-500' },
    { name: 'أسفل الصفحة', value: stats.footer_impressions, color: 'bg-purple-500' },
    { name: 'أعلى التفاصيل', value: stats.details_top_impressions, color: 'bg-red-500' },
    { name: 'أسفل التفاصيل', value: stats.details_bottom_impressions, color: 'bg-indigo-500' },
  ];

  const maxImpressions = Math.max(...placementData.map(p => p.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          إحصائيات الأداء والعرض العادل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* الإحصائيات الإجمالية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{stats.total_impressions}</p>
            <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{Math.round(stats.fairness_score)}%</p>
            <p className="text-sm text-gray-600">درجة العدالة</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">
              {new Date(stats.last_shown_at).toLocaleDateString('ar-SA')}
            </p>
            <p className="text-sm text-gray-600">آخر عرض</p>
          </div>
        </div>

        {/* توزيع المشاهدات حسب الموقع */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            توزيع المشاهدات حسب الموقع
          </h4>
          <div className="space-y-3">
            {placementData.map((placement, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{placement.name}</span>
                  <Badge variant="outline">{placement.value}</Badge>
                </div>
                <div className="relative">
                  <Progress 
                    value={maxImpressions > 0 ? (placement.value / maxImpressions) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* نصائح لتحسين الأداء */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">نصائح لتحسين الأداء:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            {stats.fairness_score < 80 && (
              <li>• إعلانك يحتاج لمزيد من التوزيع العادل لزيادة الظهور</li>
            )}
            {stats.total_impressions < 100 && (
              <li>• ترقية الحساب لبريميوم يضمن ظهور أكثر وأولوية أعلى</li>
            )}
            <li>• الإعلانات الحديثة تحصل على نقاط أولوية أعلى</li>
            <li>• تحديث الإعلان يمكن أن يحسن من ترتيبه</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdPerformanceStats;