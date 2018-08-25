import KeyManager from '~/models/KeyManager';

KeyManager.shared.registerMeta('k', async () => {
    const { default: SearchController } = await import('~/controllers/SearchViewController');
    await SearchController.shared.present();
});
