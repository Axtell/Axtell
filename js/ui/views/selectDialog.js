import SelectDialogViewController from '~/controllers/SelectDialogViewController';
import SortControllerDelegate from '~/delegate/SortControllerDelegate';
import Template from '~/template/Template';
import { forEach } from '~/modern/array';

document.getElementsByClassName('select-dialog')
    ::forEach(dialog => {
        let controller = new SelectDialogViewController(new Template(dialog))

        if (dialog.classList.contains('d-sort'))
            controller.delegate = new SortControllerDelegate();
    });
