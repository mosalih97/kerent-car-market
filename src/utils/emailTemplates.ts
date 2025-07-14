
export const getArabicEmailTemplate = (type: 'signup' | 'recovery' | 'magic_link', data: {
  confirmUrl?: string;
  siteName?: string;
  userEmail?: string;
}) => {
  const { confirmUrl = '', siteName = 'الكيرين' } = data;
  
  const baseStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
      .email-container {
        font-family: 'Cairo', Arial, sans-serif;
        direction: rtl;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        border-radius: 12px;
        color: white;
      }
      .content {
        background: #f8fafc;
        padding: 30px;
        border-radius: 12px;
        margin-bottom: 20px;
        border: 1px solid #e2e8f0;
      }
      .button {
        display: inline-block;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
      }
      .button-primary {
        background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
        color: white;
      }
      .button-danger {
        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
        color: white;
      }
      .footer {
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }
      .warning-box {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
        color: #dc2626;
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
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${siteName}</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">موقع السيارات الأول في السودان</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; font-weight: 600;">
                مرحباً بك في ${siteName}! 🎉
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 25px;">
                نشكرك لاختيارك ${siteName} لشراء وبيع السيارات. لإكمال عملية التسجيل وتفعيل حسابك، 
                يرجى النقر على الزر أدناه لتأكيد عنوان بريدك الإلكتروني.
              </p>
              
              <div style="text-align: center;">
                <a href="${confirmUrl}" class="button button-primary">
                  ✅ تأكيد الحساب الآن
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 25px; line-height: 1.6;">
                <strong>ملاحظة:</strong> إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان. 
                لن يتم إنشاء أي حساب بدون تأكيد عنوان البريد الإلكتروني.
              </p>
            </div>
            
            <div class="footer">
              <p>© 2025 ${siteName} - جميع الحقوق محفوظة</p>
              <p style="margin-top: 5px;">
                <a href="mailto:info@alkeren.com" style="color: #6b7280; text-decoration: none;">info@alkeren.com</a>
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
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${siteName}</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">إعادة تعيين كلمة المرور</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; font-weight: 600;">
                🔐 إعادة تعيين كلمة المرور
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 25px;">
                تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في ${siteName}. 
                إذا كنت قد طلبت ذلك، انقر على الزر أدناه لإنشاء كلمة مرور جديدة وآمنة.
              </p>
              
              <div style="text-align: center;">
                <a href="${confirmUrl}" class="button button-danger">
                  🔑 إعادة تعيين كلمة المرور
                </a>
              </div>
              
              <div class="warning-box">
                <p style="margin: 0; font-size: 14px; font-weight: 600;">
                  ⚠️ تنبيه أمني مهم:
                </p>
                <ul style="margin: 10px 0 0 20px; padding: 0; font-size: 13px;">
                  <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
                  <li>إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة</li>
                  <li>لا تشارك هذا الرابط مع أي شخص آخر</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 ${siteName} - جميع الحقوق محفوظة</p>
              <p style="margin-top: 5px;">
                <a href="mailto:info@alkeren.com" style="color: #6b7280; text-decoration: none;">info@alkeren.com</a>
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
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${siteName}</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">دخول سريع وآمن</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; font-weight: 600;">
                ✨ رابط الدخول السريع
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 25px;">
                انقر على الرابط أدناه للدخول إلى حسابك في ${siteName} مباشرة بدون الحاجة لكتابة كلمة المرور.
              </p>
              
              <div style="text-align: center;">
                <a href="${confirmUrl}" class="button button-primary">
                  🚀 دخول سريع
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 25px; line-height: 1.6;">
                <strong>ملاحظة:</strong> هذا الرابط صالح لمرة واحدة فقط ولمدة 15 دقيقة. 
                إذا لم تطلب تسجيل الدخول، يمكنك تجاهل هذه الرسالة بأمان.
              </p>
            </div>
            
            <div class="footer">
              <p>© 2025 ${siteName} - جميع الحقوق محفوظة</p>
              <p style="margin-top: 5px;">
                <a href="mailto:info@alkeren.com" style="color: #6b7280; text-decoration: none;">info@alkeren.com</a>
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
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${siteName}</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">موقع السيارات الأول في السودان</p>
            </div>
            
            <div class="content">
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                تم إرسال هذه الرسالة من نظام ${siteName}.
              </p>
              
              <div style="text-align: center;">
                <a href="${confirmUrl}" class="button button-primary">
                  متابعة
                </a>
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
