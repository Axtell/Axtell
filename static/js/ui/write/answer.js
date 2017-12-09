import LanguageLookupViewController from '~/controllers/LanguageLookupViewController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import FormControllerDelegate from '~/delegate/FormControllerDelegate';
import PopoverViewController from '~/controllers/PopoverViewController';
import FormConstraint from '~/controllers/Form/FormConstraint';
import ViewController from '~/controllers/ViewController';
import Template from '~/template/Template';
import Language from '~/models/Language';
import HexBytes from '~/modern/HexBytes';
import Chain from '~/modern/Chain';
import Auth from '~/models/Auth';
import Ace from '~/modern/Ace';

export const ANSWER_VIEW = "answer-box";
export const ANSWER_FORM = "answer-source";
export const ANSWER_LANG_ID = "lang-id";
export const ANSWER_LANG = document.getElementById("lang-input");
export const ANSWER_CLOSE = document.getElementById("answer-close");
export const ANSWER_TRIGGER = document.getElementById("write-answer");
export const ANSWER_EDITOR = "code";

let formController;
if (formController = ViewController.of(ANSWER_FORM)) {
    formController.addConstraints([
        new FormConstraint(ANSWER_LANG_ID)
            .notEmpty(`You must provide a language`)
    ]);

    // Create code language
    let editor = new Ace(ANSWER_EDITOR);
    editor.shouldValidate = false;

    // Create lanuage identification.
    let languageLookup = new LanguageLookupViewController(ANSWER_LANG);
    languageLookup.delegate.didSetStateTo = Chain([
        ActionControllerDelegate.bindValue(ANSWER_LANG_ID),
        ActionControllerDelegate.pipeValueTo(::editor.setLanguage)
    ]);
}

let answerView;
// Create answer load box
if (ANSWER_TRIGGER) {
    const answerBox = new PopoverViewController(
        ANSWER_TRIGGER,
        Template.fromId(ANSWER_VIEW),
        ANSWER_CLOSE
    );
} else {
    if (answerView = document.getElementById(ANSWER_VIEW)) {
        answerView.parentNode.removeChild(answerView);
    }
}
