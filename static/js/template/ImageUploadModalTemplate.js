import ModalController from '~/controllers/ModalController';
import ModalTemplate from '~/template/ModalTemplate';
import ImgurUpload from '~/models/Request/ImgurUpload';
import HexBytes from '~/modern/HexBytes';

const MAX_FILE_SIZE = 10000000; // In bytes
const NO_FILE_TEXT = 'No Selected';

function uploadButton(text) {
    return <button class="button accent -small -top-space">{ text }</button>;
}

/**
 * Image upload Modal dialog.
 *
 * @extends {ModalTemplate}
 */
export default class ImageUploadModalTemplate extends ModalTemplate {
    /** @override */
    constructor(controller) {
        let templateId = HexBytes.ofDefault(),
            urlId = `url-${templateId}`,
            fileId = `file-${templateId}`,
            fileViewId = `file-view-${templateId}`;

        let urlUpload = <input id={urlId} class="text-input text-base -url" type="text" />,
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

        this._controller = controller;

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
        this._insertWithURL(await request.get());
    }

    async _uploadFile(event) {
        let request = new ImgurUpload({
            file: this._selectedFile
        });

        this._setLoading();
        this._insertWithURL(await request.get());
    }

    _setLoading() {
        this._urlButton.classList.add('-disabled');
        this._fileButton.classList.add('-disabled');
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
        this._controller.insertAtSelectionStart('![')
        this._controller.insertAtSelectionEnd(`](${url})`)

        ModalController.shared.dismiss();
    }

}
