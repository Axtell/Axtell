import FormController from '~/controllers/Form/FormController';
import {forEach} from '~/modern/array';

document.getElementsByTagName('Form')
    ::forEach(form => new FormController(form));
