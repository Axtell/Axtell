import PostVoteViewController from '~/controllers/PostVoteViewController';
import Post from '~/models/Post';

export const POST_VOTE_CONTAINER = 'post-vote-list';

let postId;
if (postId = Post.current?.id) {
    PostVoteViewController.forClass(
        'vote-button',
        (elem) => [elem, {
            voteType: elem.dataset.type,
            postId
        }],
        POST_VOTE_CONTAINER
    )
}
