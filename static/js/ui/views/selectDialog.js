import SelectDialogViewController from '~/controllers/SelectDialogViewController';
import Template from '~/template/Template';
import {forEach} from '~/modern/array';

document.getElementsByClassName('select-dialog')
    ::forEach(dialog => new SelectDialogViewController(new Template(dialog)));
