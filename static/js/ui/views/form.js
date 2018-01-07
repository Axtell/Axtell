import FormController from '~/controllers/Form/FormController';
import { forEach } from '~/modern/array';

document.getElementsByTagName('form')
    ::forEach(form => new FormController(form));
