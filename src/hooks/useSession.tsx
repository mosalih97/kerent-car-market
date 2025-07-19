import { useEffect, useState } from 'react';

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // الحصول على معرف الجلسة أو إنشاء واحد جديد
    let storedSessionId = sessionStorage.getItem('session_id');
    
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      sessionStorage.setItem('session_id', storedSessionId);
    }
    
    setSessionId(storedSessionId);
  }, []);

  const generateSessionId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  return { sessionId };
};