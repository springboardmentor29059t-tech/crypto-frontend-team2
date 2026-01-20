/**
 * 🛡️ SENTINEL NOTIFICATION HELPER
 * Milestone 3: Browser Handshake & Price Pulse Alerts
 */

/**
 * 🛰️ BROWSER HANDSHAKE
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("📡 Sentinel Node: Browser does not support desktop notifications.");
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
};

/**
 * 🚨 TRIGGER PRICE ALERT
 * Formatted for INR (₹) and optimized for Sentinel Vault.
 */
export const triggerPriceAlert = (title, message) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const options = {
      body: message,
      icon: "/logo192.png",
      badge: "/logo192.png",
      tag: "sentinel-alert", // Groups alerts to prevent browser clutter
      vibrate: [200, 100, 200],
      requireInteraction: true,
    };

    try {
      const notification = new Notification(title, options);
      setTimeout(() => notification.close(), 10000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.error("📡 Notification Node Error:", err);
    }
  } else {
    console.info(`🔔 IN-APP ALERT: [${title}] ${message}`);
  }
};

/**
 * 💾 FORENSIC CACHE: Persists Chart Pulse Data to Disk
 * Prevents "Vanishing Charts" by providing immediate hydration.
 */
export const cacheChartPulse = (assetId, range, data) => {
  try {
    const cacheKey = `pulse_${assetId}_${range}`;
    const payload = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch (e) {
    console.error("📡 Cache Node Error: Storage full or restricted.");
  }
};

/**
 * 💧 HYDRATE PULSE: Retrieves cached chart data
 * Validates data age (Expires after 1 hour).
 */
export const getCachedChartPulse = (assetId, range) => {
  try {
    const cacheKey = `pulse_${assetId}_${range}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const { timestamp, data } = JSON.parse(cached);

    // Check if cache is older than 1 hour (3600000ms)
    if (Date.now() - timestamp > 3600000) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (e) {
    return null;
  }
};

/**
 * 🧹 PURGE CACHE: Clears old forensic data
 */
export const clearSentinelCache = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith('pulse_'))
    .forEach(key => localStorage.removeItem(key));
  console.log("📡 Sentinel Node: Forensic cache purged.");
};