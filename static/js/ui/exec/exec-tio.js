import TIO from '~/models/TIO';
import Template, { TemplateType } from '~/template/Template';
import * as TIOController from '~/controllers/TIOController';
import ErrorManager from '~/helper/ErrorManager';
import { InvalidLanguage } from '~/models/Language';
import { filter, forEach } from '~/modern/array';

const TIO_EXEC_CLASS = 'exec-target';

// Create 'Run' button
let trigger = Template.fromText('\u25b6 Run', TemplateType.clone);
trigger.getUnderlyingNode.classList.add('exec-float');

// Load TIO
TIO.shared.then(tio => {
    
    document.getElementsByClassName(TIO_EXEC_CLASS)
        ::filter(elem => elem.dataset.lang)
        ::forEach(elem => {
            try {
                // Create a controller for it
                const controller = new TIOController.TIOExec(tio, elem, trigger);
                
                // Attach controller to elem
                elem.tioExecController = controller;
            } catch(e) {
                if (e.id === InvalidLanguage) return;
                else throw e;
            }
        });
    
}).catch(error => {
    ErrorManager.silent(error, 'Failed to initalize TIO execution.');
});
