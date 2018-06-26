import TIO from '~/models/TIO';
import Template, {TemplateType} from '~/template/Template';
import TIOExec from '~/controllers/TIOController/TIOExec';
import ErrorManager from '~/helpers/ErrorManager';
import {InvalidLanguage} from '~/models/Language';
import {filter, forEach} from '~/modern/array';

const TIO_EXEC_CLASS = 'exec-target';

// Create 'Run' button
let trigger = Template.fromText('\u25b6 Run', TemplateType.clone);
trigger.underlyingNode.classList.add('exec-float');

// Load TIO
TIO.shared.then(tio => {

    document.getElementsByClassName(TIO_EXEC_CLASS)
        ::filter(elem => elem.dataset.lang)
        ::forEach(elem => {
        try {
            // Create a controller for it
            const controller = new TIOExec(tio, elem, trigger);
        } catch (e) {
            if (e.id === InvalidLanguage) return;
            throw e;
        }
    });

}).catch(error => {
    ErrorManager.silent(error, 'Failed to initalize TIO execution.');
});
