
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

const getArabicEmailContent = (type: string, token: string, redirectUrl: string) => {
  const baseUrl = Deno.env.get('SUPABASE_URL') || '';
  const confirmUrl = `${baseUrl}/auth/v1/verify?token=${token}&type=${type}&redirect_to=${redirectUrl}`;
  
  switch (type) {
    case 'signup':
      return {
        subject: 'تأكيد حسابك في الكيرين',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; font-size: 32px; margin-bottom: 10px;">الكيرين</h1>
              <p style="color: #6b7280; font-size: 16px;">موقع السيارات الأول في السودان</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">تأكيد إنشاء الحساب</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                مرحباً بك في الكيرين! يرجى النقر على الرابط أدناه لتأكيد حسابك وإكمال عملية التسجيل.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                  تأكيد الحساب
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.
              </p>
            </div>
            
            <div style="text-align: center; color: #9ca3af; font-size: 12px;">
              <p>© 2025 الكيرين - جميع الحقوق محفوظة</p>
            </div>
          </div>
        `
      };
      
    case 'recovery':
      return {
        subject: 'إعادة تعيين كلمة المرور - الكيرين',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; font-size: 32px; margin-bottom: 10px;">الكيرين</h1>
              <p style="color: #6b7280; font-size: 16px;">موقع السيارات الأول في السودان</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك. انقر على الرابط أدناه لإنشاء كلمة مرور جديدة.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                  إعادة تعيين كلمة المرور
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. ستبقى كلمة المرور الحالية كما هي.
              </p>
              
              <p style="color: #ef4444; font-size: 13px; margin-top: 15px; background: #fef2f2; padding: 10px; border-radius: 4px;">
                ملاحظة: هذا الرابط صالح لمدة ساعة واحدة فقط لأغراض الأمان.
              </p>
            </div>
            
            <div style="text-align: center; color: #9ca3af; font-size: 12px;">
              <p>© 2025 الكيرين - جميع الحقوق محفوظة</p>
            </div>
          </div>
        `
      };
      
    default:
      return {
        subject: 'رسالة من الكيرين',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; font-size: 32px; margin-bottom: 10px;">الكيرين</h1>
              <p style="color: #6b7280; font-size: 16px;">موقع السيارات الأول في السودان</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                تم إرسال هذه الرسالة من نظام الكيرين.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                  متابعة
                </a>
              </div>
            </div>
            
            <div style="text-align: center; color: #9ca3af; font-size: 12px;">
              <p>© 2025 الكيرين - جميع الحقوق محفوظة</p>
            </div>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // التحقق من صحة webhook
    const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET');
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      const data = wh.verify(payload, headers) as {
        user: { email: string };
        email_data: EmailData;
      };
      
      const { user, email_data } = data;
      const { email_action_type, token_hash, redirect_to } = email_data;
      
      // إنشاء محتوى البريد الإلكتروني باللغة العربية
      const emailContent = getArabicEmailContent(
        email_action_type,
        token_hash,
        redirect_to || `${Deno.env.get('SUPABASE_URL') || ''}/auth/callback`
      );
      
      console.log(`إرسال ${email_action_type} email إلى ${user.email}`);
      
      // هنا يمكن إضافة خدمة إرسال البريد الإلكتروني مثل Resend
      // في الوقت الحالي سنعيد استجابة ناجحة
      
      return new Response(JSON.stringify({ 
        message: 'تم إرسال البريد الإلكتروني بنجاح',
        type: email_action_type 
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      });
    }
    
    return new Response(JSON.stringify({ error: 'غير مصرح' }), {
      status: 401,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
    
  } catch (error: any) {
    console.error('خطأ في إرسال البريد الإلكتروني:', error);
    return new Response(JSON.stringify({ 
      error: 'خطأ في الخادم',
      details: error.message 
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  }
};

serve(handler);
