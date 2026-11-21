export type LinmaxNotificationPayload = {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  vibrate?: boolean;
  onClick?: () => void;
};

const BASE_DOCUMENT_TITLE = 'Linmax — Connect Without Limits';

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') return 'granted';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

export function triggerNotificationVibration(enabled = true) {
  if (!enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return;
  }
  try {
    navigator.vibrate([90, 45, 90]);
  } catch {
    // ignore unsupported vibration contexts
  }
}

export function syncAppUnreadBadges(unreadCount: number, enabled = true) {
  if (typeof document !== 'undefined') {
    document.title =
      enabled && unreadCount > 0
        ? `(${unreadCount}) New messages · Linmax`
        : BASE_DOCUMENT_TITLE;
  }

  if (typeof navigator !== 'undefined') {
    const nav = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    try {
      if (enabled && unreadCount > 0 && typeof nav.setAppBadge === 'function') {
        nav.setAppBadge(unreadCount).catch(() => {});
      } else if (typeof nav.clearAppBadge === 'function') {
        nav.clearAppBadge().catch(() => {});
      }
    } catch {
      // ignore unsupported Badging API
    }
  }
}

export async function sendLinmaxNotification(
  payload: LinmaxNotificationPayload
): Promise<boolean> {
  if (payload.vibrate !== false) {
    triggerNotificationVibration(true);
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  const icon = payload.icon || '/pwa-192x192.png';

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(payload.title, {
          body: payload.body,
          icon,
          badge: '/pwa-192x192.png',
          tag: payload.tag || 'linmax-alert',
          renotify: true,
          vibrate: payload.vibrate !== false ? [100, 50, 100] : undefined,
        } as NotificationOptions);
        return true;
      }
    }

    const notif = new Notification(payload.title, {
      body: payload.body,
      icon,
      tag: payload.tag || 'linmax-alert',
    });
    notif.onclick = () => {
      window.focus();
      payload.onClick?.();
      notif.close();
    };
    return true;
  } catch {
    return false;
  }
}
