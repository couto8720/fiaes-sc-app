/**
 * Push notification service using Web Push API
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  actions?: NotificationAction[];
  data?: Record<string, any>;
}

interface NotificationAction {
  action: string;
  title: string;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Check if notifications are supported and enabled
 */
export function isNotificationEnabled(): boolean {
  if (!("Notification" in window)) {
    return false;
  }
  return Notification.permission === "granted";
}

/**
 * Send a local notification
 */
export async function sendLocalNotification(options: NotificationOptions): Promise<void> {
  if (!isNotificationEnabled()) {
    console.warn("Notifications not enabled");
    return;
  }

  if (!("serviceWorker" in navigator)) {
    // Fallback: use browser notification if no service worker
    new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
    });
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || "/icon-192.png",
      badge: options.badge || "/badge-72.png",
      tag: options.tag,
      actions: options.actions,
      data: options.data || {},
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

/**
 * Subscribe to push notifications (requires backend VAPID key)
 */
export async function subscribeToPushNotifications(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to backend
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      // Notify backend
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
    }
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
