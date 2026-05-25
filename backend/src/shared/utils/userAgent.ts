export type DeviceType = 'tablet' | 'laptop' | 'phone' | 'desktop' | 'other';

export interface UAInfo {
  type: DeviceType;
  name: string;
}

export function inferDeviceInfo(userAgent: string | undefined): UAInfo {
  const ua = (userAgent ?? '').toLowerCase();
  if (!ua) return { type: 'other', name: 'Unknown device' };

  if (ua.includes('ipad')) return { type: 'tablet', name: 'iPad' };
  if (ua.includes('android') && ua.includes('tablet')) return { type: 'tablet', name: 'Android Tablet' };
  if (ua.includes('iphone')) return { type: 'phone', name: 'iPhone' };
  if (ua.includes('android')) return { type: 'phone', name: 'Android Phone' };

  const isMac = ua.includes('macintosh') || ua.includes('mac os x');
  const isWin = ua.includes('windows');
  const isLin = ua.includes('linux') && !ua.includes('android');

  let browser = 'Browser';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome/') && !ua.includes('edg/')) browser = 'Chrome';
  else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari';
  else if (ua.includes('firefox/')) browser = 'Firefox';

  if (isMac) return { type: 'laptop', name: `Mac · ${browser}` };
  if (isWin) return { type: 'laptop', name: `Windows · ${browser}` };
  if (isLin) return { type: 'desktop', name: `Linux · ${browser}` };
  return { type: 'other', name: browser };
}
