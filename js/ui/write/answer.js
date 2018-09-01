import Post from '~/models/Post';
import FullScreenModalController from '~/controllers/FullScreenModalController';
import WriteAnswerTemplate from '~/template/WriteAnswer/WriteAnswerTemplate';
import ErrorManager, { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const ANSWER_TRIGGER = document.getElementById("write-answer");

if (ANSWER_TRIGGER) {
    const template = new WriteAnswerTemplate(Post.current);
    ANSWER_TRIGGER.addEventListener('click', () => {
        FullScreenModalController.shared
            .present(template)
            .catch(HandleUnhandledPromise);
    });
}
