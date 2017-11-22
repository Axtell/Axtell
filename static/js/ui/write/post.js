import SelectDialogViewController from '~/controllers/SelectDialogViewController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import Template from '~/template/Template';

import FormControllerDelegate from '~/delegate/FormControllerDelegate';
import FormConstraint from '~/controllers/Form/FormConstraint';
import * as Post from '~/models/Post';

let postForm = document.getElementById("post-form");
let postPublishType = document.getElementById("post-publish");
let publishTarget = document.getElementById("publish-target");

if (postForm) {
    
    postPublishType.controller.didSetStateTo =
        (state, controller) => publishTarget.value = state.id;
    postPublishType.controller.setState('post');
    
    postForm.formController.addConstraints([
        new FormConstraint('post-body')
            .length(Post.MIN_BODY_LENGTH, Post.MAX_BODY_LENGTH),
        new FormConstraint('post-title')
            .length(Post.MIN_TITLE_LENGTH, Post.MAX_TITLE_LENGTH)
    ]);
    
    postForm.formController.delegate = new class extends FormControllerDelegate {
        formDidError(controller, errors) {
            controller.display(errors);
        }
    }
}
