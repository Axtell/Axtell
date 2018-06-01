import Data from '~/models/Data';
import ForeignChildInteractor from '~/interactors/ForeignChildInteractor';
import ErrorManager from '~/helpers/ErrorManager';
import * as PreviewKey from '~/helpers/PreviewKey';

const PREVIEW_TITLE = document.getElementById("post-title");
const PREVIEW_BODY = document.getElementById("post-body");

const NO_TITLE = (
    <span class="dim">No Title...</span>
);
const NO_BODY = (
    <div id="content-dim">
        <svg namespace="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path namespace="http://www.w3.org/2000/svg" d="M 4 2 L 4 11 L 2 11 L 2 12.5 C 2 13.328 2.672 14 3.5 14 L 11.5 14 C 11.909962 14 12.301599 13.855814 12.578125 13.580078 C 12.854651 13.304342 13 12.912335 13 12.5 L 13 2 L 4 2 z M 5 3 L 12 3 L 12 12.5 C 12 12.690665 11.94482 12.79758 11.871094 12.871094 C 11.79737 12.944607 11.689038 13 11.5 13 C 11.172 13 11 12.686 11 12.375 L 11 11 L 5 11 L 5 3 z" />
        </svg>
        <h3>Live Post Preview</h3>
        <span>Preview will be automatically refreshed as you type.</span>
    </div>
);

let id;
if (id = Data.shared.valueForKey('previewId')) {
    let interactor = new ForeignChildInteractor(id);

    interactor.watch(
        PreviewKey.Title,
        (value) => {
            let realTitle = value.trim();
            while (PREVIEW_TITLE.firstChild) PREVIEW_TITLE.removeChild(PREVIEW_TITLE.firstChild);

            if (realTitle) {
                document.title = realTitle;
                PREVIEW_TITLE.appendChild(document.createTextNode(realTitle));
            } else {
                document.title = "Post Preview";
                PREVIEW_TITLE.appendChild(NO_TITLE);
            }
        }
    );

    import('#/markdown-renderer')
        .then(markdown => {
            interactor.watch(
                PreviewKey.Body,
                (value) => {
                    if (value.trim()) {
                        PREVIEW_BODY.innerHTML = markdown.render(value);
                    } else {
                        while (PREVIEW_BODY.firstChild) PREVIEW_BODY.removeChild(PREVIEW_BODY.firstChild);
                        PREVIEW_BODY.appendChild(NO_BODY);
                    }
                }
            );
        })
        .catch(error => {
            ErrorManager.unhandled(error);
        });
}
