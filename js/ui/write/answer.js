import Post from '~/models/Post';
import FullScreenModalController from '~/controllers/FullScreenModalController';
import WriteAnswerTemplate from '~/template/WriteAnswer/WriteAnswerTemplate';
import ErrorManager, { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const ANSWER_TRIGGER = document.getElementById("write-answer");

if (ANSWER_TRIGGER) {
    let template = null;
    ANSWER_TRIGGER.addEventListener('click', () => {
        (async () => {
            if (template === null) {
                const { default: WriteAnswerTemplate } = await import('~/template/WriteAnswer/WriteAnswerTemplate');
                template = new WriteAnswerTemplate(Post.current);
            }

            FullScreenModalController.shared
                .present(template)
                .catch(HandleUnhandledPromise);
        })();
    });
}
