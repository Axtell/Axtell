import PostVoteViewController from '~/controllers/PostVoteViewController';
import CommentListViewController from '~/controllers/CommentListViewController';
import Post from '~/models/Post';

export const POST_VOTE_CONTAINER = 'post-vote-list';
export const POST_COMMENT_CONTAINER = 'post-vote-list';

let post;
if (post = Post.current) {
    PostVoteViewController.forClass(
        'vote-button',
        (elem) => [elem, {
            voteType: elem.dataset.type,
            postId: post.id
        }],
        POST_VOTE_CONTAINER
    )

    const postComments = new CommentListViewController(
        document.querySelector('#post > .comment-list'),
        post
    );
    postComments.setupSublists();
}
