import CommentViewController from '~/controllers/CommentViewController';
import Template from '~/template/Template';
import Data from '~/models/Data';
import SVG from '~/models/Request/SVG';

export const COMMENT_NEST_DEPTH = +Data.shared.envValueForKey('COMMENT_NEST_COUNT');

/**
 * Creates a comment given a Comment object
 */
export default class CommentTemplate extends Template {

    /**
     * Creates with comment (async).
     * @param {Comment} comment
     * @param {boolean} o.expandRecursively - If should recursively
     */
    constructor(comment, opts = {}) {
        const { expandRecursively = false } = opts;

        const root = <div class="comment-item comment__user_split comment"/>;
        super(root);

        return (async () => {
            const markdown = await import('#/markdown-renderer');

            // Lazy Load CommentListViewController to avoid cyclic dependency :(

            const body = <div class="body"/>;
            body.innerHTML = markdown.render(comment.text);

            let subComments = <DocumentFragment/>;
            let seeMoreButton = <DocumentFragment/>;

            const isOwnComment = comment.owner.isMe();

            /** @type {Comment} */
            this.comment = comment;

            if (expandRecursively) {
                // If we can't render all children we'll add show more
                if (comment.children.length > COMMENT_NEST_DEPTH) {
                    const DownIcon = await SVG.load('down');
                    seeMoreButton = (
                        <li class="comment-item comment-item--action comment-item--hoverable comment-item__load-more">
                            { DownIcon }
                            See More
                        </li>
                    );
                }

                // Add all the subcomment nodes. Don't show more than COMMENT_NEST_DEPTH
                for (const subComment of comment.children.slice(0, COMMENT_NEST_DEPTH)) {
                    const subCommentTemplate = await new CommentTemplate(subComment, opts);
                    subComments.appendChild(subCommentTemplate.unique());
                }
            } else {
                // If we aren't expanding recursively, add the 'Expand' button if they are children
                if (comment.children.length > 0) {
                    const ExpandIcon = await SVG.load('expand');
                    seeMoreButton = (
                        <li class="comment-item comment-item--action comment-item--hoverable comment-item__load-more comment-item__load-more--expand">
                            { ExpandIcon }
                            Expand
                        </li>
                    );
                }
            }

            let deleteButton = <DocumentFragment/>;
            if (isOwnComment) {
                deleteButton = <a class="comment__footer__item comment__delete">delete</a>;
            }

            this.underlyingNode.appendChild(
                <DocumentFragment>
                    <div class="user">
                        <img class="avatar" src={comment.owner.avatar} />
                    </div>
                    <div class="comment__content">
                        <div class="comment__header">
                            <span class="comment__name">{comment.owner.name}</span>
                        </div>
                        { body }
                        <div class="comment__footer">
                            <a class="comment__footer__item comment__reply">reply</a>
                            { deleteButton }
                            <span class="comment__footer__item comment__timestamp">{ moment(comment.date).fromNow() }</span>
                        </div>
                        <ul class="comment-list comment-list--nested">
                            { seeMoreButton }
                            <li class="comment--append-first-ref"></li>
                            <li class="comment--append-ref"></li>
                            { subComments }
                            <li class="comment--prepend-ref"></li>
                        </ul>
                    </div>
                </DocumentFragment>
            );

            this.controller = new CommentViewController(this.underlyingNode, this.comment);

            return this;
        })();
    }

}
