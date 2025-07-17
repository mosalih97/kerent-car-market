import { useState, useEffect, useRef } from 'react';
import { useBackup } from '@/hooks/useBackup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, Archive, Trash2, Plus, Clock, HardDrive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const BackupManager = () => {
  const {
    isLoading,
    backups,
    createBackup,
    fetchBackups,
    downloadBackup,
    uploadAndRestore,
    deleteBackup
  } = useBackup();

  const [newBackupName, setNewBackupName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    if (!newBackupName.trim()) return;
    
    await createBackup(newBackupName);
    setNewBackupName('');
    setIsCreateDialogOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('يرجى اختيار ملف JSON صالح');
      return;
    }

    await uploadAndRestore(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة النسخ الاحتياطية</h2>
          <p className="text-muted-foreground">
            إنشاء واستعادة نسخ احتياطية من بياناتك
          </p>
        </div>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            رفع واستعادة
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                إنشاء نسخة احتياطية
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>إنشاء نسخة احتياطية جديدة</DialogTitle>
                <DialogDescription>
                  اختر اسماً للنسخة الاحتياطية الجديدة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="اسم النسخة الاحتياطية"
                  value={newBackupName}
                  onChange={(e) => setNewBackupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateBackup();
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleCreateBackup}
                    disabled={!newBackupName.trim() || isLoading}
                  >
                    إنشاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      {backups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Archive className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد نسخ احتياطية</h3>
            <p className="text-muted-foreground text-center mb-4">
              لم تقم بإنشاء أي نسخة احتياطية بعد. ابدأ بإنشاء نسختك الأولى.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء نسخة احتياطية
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {backups.map((backup) => (
            <Card key={backup.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{backup.backup_name}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(backup.created_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(backup.backup_size)}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {new Date(backup.created_at).toLocaleDateString('ar-SA')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBackup(backup.id, backup.backup_name)}
                    disabled={isLoading}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    تحميل
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isLoading}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف النسخة الاحتياطية "{backup.backup_name}"؟
                          هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteBackup(backup.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-80">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-center">جاري المعالجة...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BackupManager;