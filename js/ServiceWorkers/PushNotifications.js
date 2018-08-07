self.addEventListener('push', (event) => {
    console.log('[Axtell.sw.PushNotification] Received Push');
    event.waitUntil(self.registration.showNotification('Placeholder title', { body: 'Placeholder body' }));
});

console.log('[Axtell.sw.PushNotification] Ready');
