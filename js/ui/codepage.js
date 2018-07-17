import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const CODEPAGE_TABLE = document.getElementById("codepage-table");

if (CODEPAGE_TABLE) {
    (async () => {
        const { default: ClipboardJS } = await import('clipboard');
        const clipboard = new ClipboardJS('.codepage-table__char', {
            text: (el) => String.fromCodePoint(+el.dataset.codepoint)
        });

        let lastTimeout = null,
            lastTextNode = null;
        clipboard.on('success', (event) => {
            if (lastTimeout) {
                clearTimeout(lastTimeout);
                lastTextNode.data = 'copy';

                lastTimeout = null;
                lastTextNode = null;
            }

            const copyButton = event.trigger.getElementsByClassName('codepage-table__char__copy')[0];
            const textNode = document.createTextNode("copied!");

            while (copyButton.firstChild) copyButton.removeChild(copyButton.firstChild);
            copyButton.appendChild(textNode);

            lastTextNode = textNode;
            lastTimeout = setTimeout(() => {
                textNode.data = 'copy';
            }, 800);
        });
    })().catch(HandleUnhandledPromise);
}
