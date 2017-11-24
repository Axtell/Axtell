import FormController from '~/controllers/Form/FormController';
import {forEach} from '~/modern/array';

document.getElementsByTagName('Form')::forEach(form => {
    form.formController = new FormController(form);
});
