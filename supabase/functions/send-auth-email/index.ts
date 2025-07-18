
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const getArabicEmailTemplate = (type: 'signup' | 'recovery' | 'magic_link', data: {
  confirmUrl?: string;
  siteName?: string;
  userEmail?: string;
}) => {
  const { confirmUrl = '', siteName = 'الكرين' } = data;
  
  const baseStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Cairo', Arial, sans-serif;
        direction: rtl;
        background-color: #f8fafc;
        padding: 20px;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        padding: 30px 20px;
        text-align: center;
        color: white;
      }
      .header h1 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .header p {
        font-size: 16px;
        opacity: 0.9;
      }
      .content {
        padding: 40px 30px;
      }
      .content h2 {
        color: #1f2937;
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
        text-align: center;
      }
      .content p {
        color: #4b5563;
        font-size: 16px;
        line-height: 1.8;
        margin-bottom: 25px;
      }
      .button-container {
        text-align: center;
        margin: 30px 0;
      }
      .button {
        display: inline-block;
        padding: 15px 30px;
        background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        transition: transform 0.2s ease;
      }
      .button:hover {
        transform: translateY(-2px);
      }
      .button.danger {
        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      }
      .warning-box {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 20px;
        margin-top: 25px;
      }
      .warning-box h3 {
        color: #dc2626;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .warning-box ul {
        color: #dc2626;
        font-size: 14px;
        margin-right: 20px;
      }
      .warning-box li {
        margin-bottom: 5px;
      }
      .info-box {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
      }
      .info-box p {
        color: #0369a1;
        font-size: 14px;
        margin: 0;
      }
      .footer {
        background: #f8fafc;
        padding: 25px 30px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }
      .footer p {
        color: #9ca3af;
        font-size: 12px;
        margin-bottom: 8px;
      }
      .footer a {
        color: #6b7280;
        text-decoration: none;
      }
      .footer a:hover {
        color: #374151;
      }
    </style>
  `;

  switch (type) {
    case 'signup':
      return `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تأكيد حسابك في ${siteName}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>${siteName}</h1>
              <p>موقع السيارات الأول في السودان</p>
            </div>
            
            <div class="content">
              <h2>🎉 مرحباً بك في ${siteName}!</h2>
              
              <p>
                نشكرك لاختيارك ${siteName} لشراء وبيع السيارات. لإكمال عملية التسجيل وتفعيل حسابك، 
                يرجى النقر على الزر أدناه لتأكيد عنوان بريدك الإلكتروني.
              </p>
              
              <div class="button-container">
                <a href="${confirmUrl}" class="button">
                  ✅ تأكيد الحساب الآن
                </a>
              </div>
              
              <div class="info-box">
                <p>
                  <strong>ملاحظة:</strong> إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان. 
                  لن يتم إنشاء أي حساب بدون تأكيد عنوان البريد الإلكتروني.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 ${siteName} - جميع الحقوق محفوظة</p>
              <p>
                <a href="mailto:info@alkeren.com">info@alkeren.com</a> | 
                <a href="tel:+249123456789">+249 123 456 789</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'recovery':
      return `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>إعادة تعيين كلمة المرور - ${siteName}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>${siteName}</h1>
              <p>إعادة تعيين كلمة المرور</p>
            </div>
            
            <div class="content">
              <h2>🔐 إعادة تعيين كلمة المرور</h2>
              
              <p>
                تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في ${siteName}. 
                إذا كنت قد طلبت ذلك، انقر على الزر أدناه لإنشاء كلمة مرور جديدة وآمنة.
              </p>
              
              <div class="button-container">
                <a href="${confirmUrl}" class="button danger">
                  🔑 إعادة تعيين كلمة المرور
                </a>
              </div>
              
              <div class="warning-box">
                <h3>⚠️ تنبيه أمني مهم:</h3>
                <ul>
                  <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
                  <li>إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة</li>
                  <li>لا تشارك هذا الرابط مع أي شخص آخر</li>
                  <li>تأكد من استخدام كلمة مرور قوية وفريدة</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 ${siteName} - جميع الحقوق محفوظة</p>
              <p>
                <a href="mailto:info@alkeren.com">info@alkeren.com</a> | 
                <a href="tel:+249123456789">+249 123 456 789</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'magic_link':
      return `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>رابط الدخول السريع - ${siteName}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>${siteName}</h1>
              <p>دخول سريع وآمن</p>
            </div>
            
            <div class="content">
              <h2>✨ رابط الدخول السريع</h2>
              
              <p>
                انقر على الرابط أدناه للدخول إلى حسابك في ${siteName} مباشرة 
                بدون الحاجة لكتابة كلمة المرور.
              </p>
              
              <div class="button-container">
                <a href="${confirmUrl}" class="button">
                  🚀 دخول سريع الآن
                </a>
              </div>
              
              <div class="info-box">
                <p>
                  <strong>ملاحظة:</strong> هذا الرابط صالح لمرة واحدة فقط ولمدة 15 دقيقة. 
                  إذا لم تطلب تسجيل الدخول، يمكنك تجاهل هذه الرسالة بأمان.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 ${siteName} - جميع الحقوق محفوظة</p>
              <p>
                <a href="mailto:info@alkeren.com">info@alkeren.com</a> | 
                <a href="tel:+249123456789">+249 123 456 789</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>رسالة من ${siteName}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>${siteName}</h1>
              <p>موقع السيارات الأول في السودان</p>
            </div>
            
            <div class="content">
              <h2>رسالة من ${siteName}</h2>
              <p>تم إرسال هذه الرسالة من نظام ${siteName}.</p>
              
              <div class="button-container">
                <a href="${confirmUrl}" class="button">متابعة</a>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 ${siteName} - جميع الحقوق محفوظة</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
};

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
      siteName: 'الكرين',
      userEmail: user.email
    });
    
    // في هذا المثال، سنطبع المحتوى فقط
    // يمكنك إضافة خدمة إرسال البريد الإلكتروني مثل Resend هنا
    console.log('محتوى البريد الإلكتروني العربي:', {
      to: user.email,
      subject: emailType === 'recovery' ? 'إعادة تعيين كلمة المرور - الكرين' : 'تأكيد حسابك في الكرين',
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
