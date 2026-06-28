export async function registerServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return { gameSw: null, registerChatSw: async () => {} };
  }

  // Register game SW immediately
  const gameSw = await navigator.serviceWorker.register("/sw-game.js", {
    scope: "/",
  });

  // Lazy register chat SW when entering chat
  const registerChatSw = async () => {
    const controller = navigator.serviceWorker.controller;
    if (!controller?.scriptURL.includes("sw-chat.js")) {
      await navigator.serviceWorker.register("/sw-chat.js", {
        scope: "/papan-skor/",
      });
    }
  };

  return { gameSw, registerChatSw };
}
