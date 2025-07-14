
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getArabicEmailTemplate } from "../../../src/utils/emailTemplates.ts";

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

interface WebhookPayload {
  user: { 
    email: string;
    id: string;
  };
  email_data: EmailData;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const { user, email_data } = payload;
    const { email_action_type, token_hash, redirect_to, site_url } = email_data;
    
    console.log(`معالجة ${email_action_type} email لـ ${user.email}`);
    
    // إنشاء رابط التأكيد
    const baseUrl = site_url || Deno.env.get('SUPABASE_URL') || '';
    const confirmUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || baseUrl}`;
    
    // تحديد نوع الرسالة
    let emailType: 'signup' | 'recovery' | 'magic_link' = 'signup';
    if (email_action_type === 'recovery') {
      emailType = 'recovery';
    } else if (email_action_type === 'magiclink') {
      emailType = 'magic_link';
    }
    
    // إنشاء محتوى البريد الإلكتروني باللغة العربية
    const emailContent = getArabicEmailTemplate(emailType, {
      confirmUrl,
      siteName: 'الكيرين',
      userEmail: user.email
    });
    
    // في هذا المثال، سنطبع المحتوى فقط
    // يمكنك إضافة خدمة إرسال البريد الإلكتروني مثل Resend هنا
    console.log('محتوى البريد الإلكتروني العربي:', {
      to: user.email,
      subject: emailType === 'recovery' ? 'إعادة تعيين كلمة المرور - الكيرين' : 'تأكيد حسابك في الكيرين',
      html: emailContent
    });
    
    // محاكاة إرسال ناجح
    // TODO: إضافة خدمة إرسال البريد الإلكتروني الفعلية
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'تم إرسال البريد الإلكتروني باللغة العربية بنجاح',
      type: email_action_type,
      email: user.email
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
    
  } catch (error: any) {
    console.error('خطأ في إرسال البريد الإلكتروني:', error);
    return new Response(JSON.stringify({ 
      error: 'خطأ في معالجة البريد الإلكتروني',
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
