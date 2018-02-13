import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import FormControllerDelegate from '~/delegate/FormControllerDelegate';
import CategoryListViewController from '~/controllers/CategoryListViewController';
import ViewController from '~/controllers/ViewController';
import FormConstraint from '~/controllers/Form/FormConstraint';
import * as Post from '~/models/Post';

export const PUBLISH_FORM = "post-form";
export const PUBLISH_TYPE_CONTROLLER = "post-publish";
export const PUBLISH_TYPE_FORM_ITEM = "publish-target";
export const PUBLISH_CATEGORIES_CONTROLLER = document.getElementById("post-categories");

let formController, publishTypeController, categoryListViewController;

if (formController = ViewController.of(PUBLISH_FORM)) {

    publishTypeController = ViewController.of(PUBLISH_TYPE_CONTROLLER);

    publishTypeController.didSetStateTo =
        ActionControllerDelegate.bindValue(PUBLISH_TYPE_FORM_ITEM);
    publishTypeController.setState('code-golf');

    categoryListViewController = new CategoryListViewController(PUBLISH_CATEGORIES_CONTROLLER);

    formController.addConstraints([
        new FormConstraint('post-body')
            .length(Post.MIN_BODY_LENGTH, Post.MAX_BODY_LENGTH),
        new FormConstraint('post-title')
            .length(Post.MIN_TITLE_LENGTH, Post.MAX_TITLE_LENGTH)
    ]);

    formController.delegate = new class extends FormControllerDelegate {
        formDidError(controller, errors) {
            controller.display(errors);
        }
    }
}
