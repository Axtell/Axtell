import FormController from '~/controllers/Form/FormController';
import Template from '~/template/Template';
import { forEach } from '~/modern/array';

document.getElementsByTagName('Form')::forEach(form => {
    form.formController = new FormController(form);
});
