self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    return;
  }

  const url = typeof data.url === "string" && data.url.startsWith("/") && !data.url.startsWith("//")
    ? data.url
    : "/prayer-times";

  event.waitUntil(
    self.registration.showNotification(
      typeof data.title === "string" ? data.title : "Prayer time",
      {
        body: typeof data.body === "string" ? data.body : "",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: typeof data.tag === "string" ? data.tag : "prayer-alert",
        data: { url },
      },
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(
    event.notification.data?.url || "/prayer-times",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
