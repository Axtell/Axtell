import StackExchangeImportViewController from '~/controllers/StackExchangeImportViewController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import FormControllerDelegate from '~/delegate/FormControllerDelegate';
import CategoryListViewController from '~/controllers/CategoryListViewController';
import PopoverViewController from '~/controllers/PopoverViewController';
import SwappingViewController from '~/controllers/SwappingViewController';
import ForeignInteractor from '~/interactors/ForeignInteractor';
import ModalController from '~/controllers/ModalController';
import ViewController from '~/controllers/ViewController';
import FormConstraint from '~/controllers/Form/FormConstraint';
import ModalTemplate from '~/template/ModalTemplate';
import Template, { TemplateType } from '~/template/Template';
import StackExchange from '~/models/StackExchange';
import ErrorManager, { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import * as Post from '~/models/Post';

const root = document.getElementById("post-write");
if (root) {
    const rootView = new SwappingViewController(root);

    // Load the view
    import('~/template/WritePost/WritePostTemplate').then(async ({ default: WritePostTemplate }) => {

        const writePostTemplate = new WritePostTemplate();
        rootView.displayAlternate(writePostTemplate);

    }).catch(HandleUnhandledPromise);
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
