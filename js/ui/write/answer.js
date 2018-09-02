import Post from '~/models/Post';
import FullScreenModalController from '~/controllers/FullScreenModalController';
import WriteAnswerTemplate from '~/template/WriteAnswer/WriteAnswerTemplate';
import ErrorManager, { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const ANSWER_TRIGGERS = document.getElementsByClassName("write-answer");

let template = null;
const openAnswerTrigger = () => {
    (async () => {
        if (template === null) {
            const { default: WriteAnswerTemplate } = await import('~/template/WriteAnswer/WriteAnswerTemplate');
            template = new WriteAnswerTemplate(Post.current);
        }

        FullScreenModalController.shared
            .present(template)
            .catch(HandleUnhandledPromise);
    })();
};

Array.from(ANSWER_TRIGGERS)
    .map(trigger =>
        trigger.addEventListener('click', openAnswerTrigger))
