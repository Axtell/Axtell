import TIO from '~/models/TIO';
import * as TIOController from '~/controllers/TIOController';
import ErrorManager from '~/helper/ErrorManager';
import { filter, forEach } from '~/modern/array';

const TIO_EXEC_CLASS = 'exec-target';
const TIO_

// Load TIO
TIO.shared.then(tio => {
    
    document.getElementsByClassName(TIO_EXEC_CLASS)
        ::filter(elem => elem.dataset.lang)
        ::forEach(elem => {
            // Create a controller for it
            const controller = new TIOController.TIOExec(elem);
            
            // Attach controller to elem
            elem.tioExecController = controller;
        });
    
}).catch(error => {
    ErrorManager.silent(error, 'Failed to initalize TIO execution.');
});
