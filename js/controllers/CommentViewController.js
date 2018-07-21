import WriteCommentViewController from '~/controllers/WriteCommentViewController';
import CommentListViewController from '~/controllers/CommentListViewController';
import ViewController from '~/controllers/ViewController';

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

        // Get 'reply' button. The CommentListViewController will handle the
        // 'AddComment' button.
        const replyButton = element.getElementsByClassName('comment__reply')[0];
        new WriteCommentViewController(
            replyButton,
            comment,
            this.subCommentList
        );

        /** @type {Comment} */
        this.comment = comment;
    }

}
