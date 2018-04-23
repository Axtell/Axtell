import LanguageLookupViewController from '~/controllers/LanguageLookupViewController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import FormControllerDelegate from '~/delegate/FormControllerDelegate';
import PopoverViewController from '~/controllers/PopoverViewController';
import AceViewController, { AceTheme, AceThemeType } from '~/controllers/AceViewController';
import ModalController from '~/controllers/ModalController';
import FormConstraint from '~/controllers/Form/FormConstraint';
import ViewController from '~/controllers/ViewController';
import Template, { TemplateType } from '~/template/Template';
import ModalTemplate from '~/template/ModalTemplate';
import Language from '~/models/Language';
import HexBytes from '~/modern/HexBytes';
import Theme from '~/models/Theme';
import Chain from '~/modern/Chain';
import Auth from '~/models/Auth';

export const ANSWER_VIEW = "answer-box";
export const ANSWER_FORM = "answer-source";
export const ANSWER_LANG_ID = "lang-id";
export const ANSWER_LANG = document.getElementById("lang-input");
export const ANSWER_CLOSE = document.getElementById("answer-close");
export const ANSWER_TRIGGER = document.getElementById("write-answer");
export const ANSWER_EDITOR = "code";

export const ANSWER_CODE_NAME = 'code';

export const TEST_CONFIG = new ModalTemplate(`Setup Tests`, Template.fromId('test-entry', TemplateType.move));
export const TEST_CONFIG_TRIGGER = 'test-entry--trigger';

export const TEST_CONFIG_CODE = 'test-entry--code';

let formController;
if (formController = ViewController.of(ANSWER_FORM)) {
    // Create code language
    let editor = new AceViewController(ANSWER_EDITOR);
    editor.shouldValidate = false;

    editor.setThemeType(AceThemeType.fromTheme(Theme.current));

    // Create lanuage identification.
    let languageLookup = new LanguageLookupViewController(ANSWER_LANG);
    languageLookup.delegate.didSetStateTo = Chain([
        ActionControllerDelegate.bindValue(ANSWER_LANG_ID),
        ActionControllerDelegate.pipeValueTo(::editor.setLanguage)
    ]);

    // Setup form validation
    formController.addConstraints([
        new FormConstraint(ANSWER_LANG_ID)
            .notEmpty(`You must provide a language`)
    ]);

    formController.delegate = new class extends FormControllerDelegate {
        formDidError(controller, errors) {
            controller.display(errors);
        }

        formWillSubmit(controller) {
            super.formWillSubmit(controller);
            controller.setFieldWithName(editor.value, ANSWER_CODE_NAME);
        }
    }

    document.getElementById(TEST_CONFIG_TRIGGER).addEventListener("click", (event) => {
        ModalController.shared.present(TEST_CONFIG);
    });

    let testEditor = new AceViewController(TEST_CONFIG_CODE, AceTheme.default, {
        start: [
            {
                token: "axtell-placeholder",
                match: /\$\$axtell:[a-z]+\$\$/
            }
        ]
    });
    testEditor.setThemeType(AceThemeType.fromTheme(Theme.current));
    testEditor.shouldValidate = false;
}

let answerView;
// Create answer load box
if (ANSWER_TRIGGER) {
    const answerBox = new PopoverViewController(
        null,
        ANSWER_TRIGGER,
        Template.fromId(ANSWER_VIEW),
        ANSWER_CLOSE
    );
} else {
    if (answerView = document.getElementById(ANSWER_VIEW)) {
        answerView.parentNode.removeChild(answerView);
    }
}
