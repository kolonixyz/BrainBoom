export async function registerServiceWorkers(): Promise<void> {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    try {
        await navigator.serviceWorker.register("/sw-game.js", { scope: "/" });
    } catch (e) {
        console.warn("[SW] Game SW registration failed:", e);
    }
}

export async function registerChatServiceWorker(): Promise<void> {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    try {
        const existing = await navigator.serviceWorker.getRegistration("/papan-skor/");
        if (!existing) {
            await navigator.serviceWorker.register("/sw-chat.js", { scope: "/papan-skor/" });
        }
    } catch (e) {
        console.warn("[SW] Chat SW registration failed:", e);
    }
}
