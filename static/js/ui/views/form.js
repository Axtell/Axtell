import FormController from '~/controllers/Form/FormController';
import ItemGroupViewController from '~/controllers/ItemGroupViewController';
import { forEach } from '~/modern/array';

document.getElementsByTagName('form')
    ::forEach(form => new FormController(form));

ItemGroupViewController.forClass('rc-group');
