self.addEventListener('push', (event) => {
    console.log('[Axtell.sw.PushNotification] Received Push');

    const notificationJSON = event.data.json();
    const notificationDate = new Date(notificationJSON.date_created);

    event.waitUntil(
        self.registration.showNotification(notificationJSON.title, {
            body: notificationJSON.body,
            icon: '/static/webpush/icon.png',
            badge: '/static/webpush/badge.png',
            tag: `axtell:${notificationJSON.category}-${notificationJSON.id}`,
            timestamp: notificationDate,
            actions: [
                {
                    action: 'view',
                    title: 'View'
                }
            ],
            data: {
                'id': notificationJSON.id,
                'category': notificationJSON.category,
                'target': notificationJSON.target
            }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    const notificationId = event.notification.data.id;
    const category = event.notification.data.category;
    const target = event.notification.data.target;

    if (event.action === 'view' || !event.action) {
        // The default action and 'view' action will
        // open up a window with the event
        clients.openWindow(`/responder/${notificationId}/${category}/${target}`)
    }

    event.notification.close();
});

console.log('[Axtell.sw.PushNotification] Ready');
