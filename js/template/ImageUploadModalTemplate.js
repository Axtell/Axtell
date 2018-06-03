import ModalController from '~/controllers/ModalController';
import ModalTemplate from '~/template/ModalTemplate';
import ImgurUpload from '~/models/Request/ImgurUpload';
import Random from '~/modern/Random';
import Theme from '~/models/Theme';

const MAX_FILE_SIZE = 10000000; // In bytes
const NO_FILE_TEXT = 'No Selected';

function uploadButton(text) {
    return <button class="button button--color-accent button--size-small button--padding-top">{ text }</button>;
}

/**
 * Image upload Modal dialog.
 * @extends {ModalTemplate}
 */
export default class ImageUploadModalTemplate extends ModalTemplate {
    /** @override */
    constructor(delegate = null) {
        let templateId = Random.ofDefault(),
            urlId = `url-${templateId}`,
            fileId = `file-${templateId}`,
            fileViewId = `file-view-${templateId}`;

        let urlUpload = <input id={urlId} class="text-input text-input--type-url" type="text" />,
            urlUploadButton = uploadButton('Add Image');

        let fileUpload = <input class="file invisible" id={fileId} type="file" accept="image/*"/>,
            filePreview = <span class="file preview" id={fileViewId}>{ NO_FILE_TEXT }</span>,
            fileUploadButton = uploadButton('Upload Image');

        super(
            "Upload an image",
            <div class="md-upload-split">
                <div class="label-group item-wrap">
                    <label>From URL</label>
                    { urlUpload }
                    { urlUploadButton }
                </div>
                <div class="label-group item-wrap">
                    <label>From File</label>
                    <div class="file container">
                        <label class="file trigger" for={fileId}>Choose File</label>
                        { filePreview }
                    </div>
                    { fileUpload }
                    { fileUploadButton }
                </div>
            </div>
        );

        /** @type {ActionControllerDelegate} */
        this.delegate = delegate;

        this._urlInput = urlUpload;
        this._urlButton = urlUploadButton;

        this._fileInput = fileUpload;
        this._filePreview = filePreview;
        this._fileButton = fileUploadButton;

        fileUpload.addEventListener("change", ::this._didSelectFile);
        urlUploadButton.addEventListener("click", ::this._uploadURL);
        fileUploadButton.addEventListener("click", ::this._uploadFile);
    }

    async _uploadURL(event) {
        let request = new ImgurUpload({
            url: this._urlInput.value
        });

        this._setLoading();
        this.delegate?.didChangeProgressState(this, true);

        try {
            this._insertWithURL(await request.run());
        } finally {
            this.delegate?.didChangeProgressState(this, false);
        }
    }

    async _uploadFile(event) {
        let request = new ImgurUpload({
            file: this._selectedFile
        });

        this._setLoading();
        this.delegate?.didChangeProgressState(this, true);

        try {
            this._insertWithURL(await request.run());
        } finally {
            this.delegate?.didChangeProgressState(this, false);
        }
    }

    _setLoading() {
        const buttons = [this._urlButton, this._fileButton];

        for (const button of buttons) {
            const loadingSvg = <img src={ Theme.light.imageForTheme('loading') }/>;

            button.classList.add('button--color-disabled');
            while (button.firstChild) {
                button.removeChild(button.firstChild);
            }

            button.appendChild(loadingSvg);
        }
    }

    _didSelectFile(event) {
        let file = this._selectedFile;

        if (!file) {
            this._setFilePreview(NO_FILE_TEXT);
        } else {
            this._setFilePreview(file.name);
        }
    }

    get _selectedFile() {
        return this._fileInput.files[0];
    }

    _setFilePreview(filename) {
        while (this._filePreview.lastChild) {
            this._filePreview.removeChild(this._filePreview.lastChild);
        }

        this._filePreview.appendChild(document.createTextNode(filename));
    }

    _insertWithURL(url) {
        this.delegate?.didSetStateTo(this, url);
        ModalController.shared.dismiss();
    }

}
