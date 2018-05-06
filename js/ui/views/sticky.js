import StickyViewController from '~/controllers/StickyViewController';
import {forEach} from '~/modern/array';

document.getElementsByClassName('sticky-sidebar')
    ::forEach(elem =>
        new StickyViewController(elem, StickyViewController.global)
    );
