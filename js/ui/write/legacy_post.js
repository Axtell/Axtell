import StackExchangeImportViewController from '~/controllers/StackExchangeImportViewController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import FormControllerDelegate from '~/delegate/FormControllerDelegate';
import CategoryListViewController from '~/controllers/CategoryListViewController';
import PopoverViewController from '~/controllers/PopoverViewController';
import ForeignInteractor from '~/interactors/ForeignInteractor';
import ModalController from '~/controllers/ModalController';
import ViewController from '~/controllers/ViewController';
import FormConstraint from '~/controllers/Form/FormConstraint';
import ModalTemplate from '~/template/ModalTemplate';
import Template, { TemplateType } from '~/template/Template';
import StackExchange from '~/models/StackExchange';
import * as Post from '~/models/Post';

export const PUBLISH_FORM = "post-form";
export const PUBLISH_TYPE_CONTROLLER = "post-publish";
export const PUBLISH_TYPE_FORM_ITEM = "publish-target";
export const PUBLISH_CATEGORIES_CONTROLLER = document.getElementById("post-categories");
export const PUBLISH_CATEGORIES_LABEL = document.getElementById("category-label");
export const PREVIEW_WRAPPER = document.getElementById("preview-wrap");

let formController, publishTypeController, categoryListViewController;

if (formController = ViewController.of(PUBLISH_FORM)) {

    let preview = formController.foreignSynchronize("Preview");
    PREVIEW_WRAPPER.appendChild(preview);

    publishTypeController = ViewController.of(PUBLISH_TYPE_CONTROLLER);

    publishTypeController.didSetStateTo =
        ActionControllerDelegate.bindValue(PUBLISH_TYPE_FORM_ITEM);
    publishTypeController.setState('code-golf');

    categoryListViewController = new CategoryListViewController(PUBLISH_CATEGORIES_CONTROLLER, PUBLISH_CATEGORIES_LABEL);

    formController.addConstraints([
        new FormConstraint('post-body')
            .length(Post.MIN_BODY_LENGTH, Post.MAX_BODY_LENGTH),
        new FormConstraint('post-title')
            .length(Post.MIN_TITLE_LENGTH, Post.MAX_TITLE_LENGTH)
    ]);

    formController.delegate = new class extends FormControllerDelegate {
        formDidError(controller, errors) {
            controller.display(errors);
        }
    }
}

// Create the popover button
export const CREATE_POST_MORE_BUTON = document.getElementById('create-post__trigger');
export const CREATE_POST_MORE_POPOVER = document.getElementById('create-post__more');

// Create SE template
export const IMPORT_FROM_STACKEXCHANGE_TRIGGER = document.getElementById('create-post__StackExchangeImport__trigger');
export const IMPORT_FROM_STACKEXCHANGE = document.getElementById('create-post__StackExchangeImport');
export const IMPORT_FROM_STACKEXCHANGE_LOGIN = document.getElementById('create-post__StackExchangeImport__login');

if (CREATE_POST_MORE_BUTON) {
    const popover = new PopoverViewController(
        null,
        CREATE_POST_MORE_BUTON,
        new Template(CREATE_POST_MORE_POPOVER)
    );

    // Create Stack Exchange import
    const StackExchangeImportModal = new ModalTemplate('PPCG Importer', IMPORT_FROM_STACKEXCHANGE, TemplateType.move);
    IMPORT_FROM_STACKEXCHANGE_TRIGGER.addEventListener("click", () => {
        ModalController.shared.present(
            StackExchangeImportModal
        );
    });

    async function StackExchangeImportLogin() {
        const stackExchange = await StackExchange.authorize();

        new StackExchangeImportViewController(
            IMPORT_FROM_STACKEXCHANGE,
            stackExchange
        );
    }

    IMPORT_FROM_STACKEXCHANGE_LOGIN.addEventListener("click", () => {
        StackExchangeImportLogin()
    })
}
