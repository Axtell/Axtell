import SelectDialogViewController from '~/controllers/SelectDialogViewController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import Template from '~/template/Template';

let postForm = document.getElementById("post-form");
let postPublishType = document.getElementById("post-publish");
let publishTarget = document.getElementById("publish-target");

if (postForm) {
    postPublishType.controller.didSetStateTo = (state, controller) => {
        publishTarget.value = state.id;
    };
    postPublishType.controller.setState('post');
}
