import SelectDialogViewController from '~/controllers/SelectDialogViewController';
import Template from '~/template/Template';
import {forEach} from '~/modern/array';

document.getElementsByClassName('select-dialog')::forEach(dialog => {
    let controller = new SelectDialogViewController(new Template(dialog));
    dialog.controller = controller;
});
