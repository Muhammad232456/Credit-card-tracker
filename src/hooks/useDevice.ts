import { useMemo } from 'react';

export type DeviceType = 'iphone' | 'ipad' | 'android-phone' | 'android-tablet' | 'desktop';

export function useDevice() {
  return useMemo(() => {
    const ua = navigator.userAgent;
    const maxTouch = navigator.maxTouchPoints ?? 0;

    const isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && maxTouch > 1);
    const isIPhone = /iPhone|iPod/.test(ua);
    const isIOS = isIPad || isIPhone;
    const isAndroid = /Android/.test(ua);
    const isAndroidTablet = isAndroid && !/Mobile/.test(ua);
    const isAndroidPhone = isAndroid && /Mobile/.test(ua);
    const isTablet = isIPad || isAndroidTablet;
    const isMobilePhone = isIPhone || isAndroidPhone;
    const isTouch = maxTouch > 0 || 'ontouchstart' in window;
    const isDesktop = !isTouch;

    let deviceType: DeviceType = 'desktop';
    if (isIPhone) deviceType = 'iphone';
    else if (isIPad) deviceType = 'ipad';
    else if (isAndroidPhone) deviceType = 'android-phone';
    else if (isAndroidTablet) deviceType = 'android-tablet';

    return {
      deviceType,
      isIOS,
      isIPhone,
      isIPad,
      isAndroid,
      isAndroidPhone,
      isAndroidTablet,
      isTablet,
      isMobilePhone,
      isTouch,
      isDesktop,
    };
  }, []);
}
