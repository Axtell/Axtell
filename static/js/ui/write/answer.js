import LanguageLookupViewController from '~/delegate/LanguageLookupViewController';
import FormControllerDelegate from '~/delegate/FormControllerDelegate';
import PopoverViewController from '~/controllers/PopoverViewController';
import FormConstraint from '~/controllers/Form/FormConstraint';
import ViewController from '~/controllers/ViewController';
import Template from '~/template/Template';
import Language from '~/models/Language';
import Auth from '~/models/Auth';

export const ANSWER_VIEW = "answer-box";
export const ANSWER_FORM = "answer-source";
export const ANSWER_LANG = document.getElementById("lang-input");
export const ANSWER_CLOSE = document.getElementById("answer-close");
export const ANSWER_TRIGGER = document.getElementById("write-answer");

let formController;
if (formController = ViewController.of(ANSWER_FORM)) {
    formController.addConstraints([

    ]);

    formController.delegate = new class extends FormControllerDelegate {
        formWillSubmit(controller) {
            // TODO: Set lang_id and lang_name
        }
    }

    // Create lanuage identification.
    new LanguageLookupViewController(ANSWER_LANG);

    // Create answer load box
    const answerBox = new PopoverViewController(
        ANSWER_TRIGGER,
        Template.fromId(ANSWER_VIEW),
        ANSWER_CLOSE
    )
}
