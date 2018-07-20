import PostVoteViewController from '~/controllers/PostVoteViewController';
import CommentListViewController from '~/controllers/CommentListViewController';
import DeleteItemViewController from '~/controllers/DeleteItemViewController';
import addSchema from '~/helpers/addSchema';
import Post from '~/models/Post';

export const POST_ACTION_CONTAINER = 'post-action-list';

let post;
if (post = Post.current) {
    // Add the schema
    post.getSchema()
        .then(addSchema);

    PostVoteViewController.forClass(
        'vote-button',
        (elem) => [elem, {
            voteType: elem.dataset.type,
            postId: post.id
        }],
        POST_ACTION_CONTAINER
    )

    const postComments = new CommentListViewController(
        document.querySelector('#post > .comment-list'),
        post
    );
    postComments.setupSublists();

    const deleteController = DeleteItemViewController.forClass(
        'delete-button',
        (elem) => [{
            trigger: elem,
            item: post
        }],
        POST_ACTION_CONTAINER
    )[0];

    if (deleteController)
        deleteController.delegate.didSetStateTo = async (controller, state) => {
            if (state.isDeleted) {
                window.location.reload(true);
            }
        };
}
