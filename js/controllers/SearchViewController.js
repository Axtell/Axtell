import ViewController from '~/controllers/ViewController';
import ModalViewController from '~/controllers/ModalViewController';

export default class SearchViewController extends ViewController {

    static shared = new SearchViewController();

    /**
     * Constructs master search view controller. See {@link SearchViewController.shared}
     */
    constructor() {
        super();

        /**
         * If is open
         * @type {Boolean}
         */
        this.opened = false;

        /**
         * Private modal instance. Do not call
         * @type {ModalViewController}
         */
        this.modalController = new ModalViewController(document.body, {
            baseZIndex: 30,
            bumpAnimation: false
        });
    }

    /**
     * Presents if not already
     */
    async present() {
        if (this.opened) return;

        const { default: SearchTemplate } = await import('~/template/Search/SearchTemplate');

        await this.modalController.present(
            await new SearchTemplate(),
            { alignmentClass: 'search-overlay__aligner' }
        );
    }

    /**
     * Hides if open
     */
    async hide() {
        if (!this.opened) return;
        await this.modalController.hide()
    }

}
