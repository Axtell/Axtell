import WriteCommentViewController from '~/controllers/WriteCommentViewController';
import CommentListViewController from '~/controllers/CommentListViewController';
import ViewController from '~/controllers/ViewController';
import DeleteCommentViewController from '~/controllers/DeleteCommentViewController';

function immediateChildWithClass(el, className) {
    const children = el.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].classList.contains(className)) {
            return children[i];
        }
    }
    return null;
}

function traverseClassTree(el, classNames) {
    let element = el;
    for (let i = 0; i < classNames.length; i++) {
        const startingElement = element;
        for (let j = 0; j < element.children.length; j++) {
            if (element.children[j].classList.contains(classNames[i])) {
                element = element.children[j];
                break;
            }
        }

        if (element === startingElement) {
            return null;
        }
    }
    return element;
}

/**
 * Why be smart and use a view controller when you can make your
 * code look like you use React
 */
export default class CommentViewController extends ViewController {

    /**
     * Create comment given element use {@link CommentTemplate} and get node.
     * @param {HTMLElement} element
     * @param {Comment} comment - The current comment
     */
    constructor(element, comment) {
        super(element);

        // Init sublist
        const subCommentListNode = element.getElementsByClassName('comment-list')[0];
        this.subCommentList = new CommentListViewController(subCommentListNode, comment);

        /**
         * Node wrapping comment
         * @type {HTMLElement}
         */
        this.commentNode = element;

        /** @type {Comment} */
        this.comment = comment;

        // Get 'reply' button. The CommentListViewController will handle the
        // 'AddComment' button.
        const replyButton = element.getElementsByClassName('comment__reply')[0];
        new WriteCommentViewController(
            replyButton,
            comment,
            this.subCommentList
        );

        // Get 'delete' button if it exiests.
        const deleteButton = traverseClassTree(element, ['comment__content', 'comment__footer', 'comment__delete']);
        if (deleteButton) {
            new DeleteCommentViewController(
                deleteButton,
                this
            );
        }
    }

}
