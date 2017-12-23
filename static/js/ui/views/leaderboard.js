import LeaderboardViewController from '~/controllers/LeaderboardViewController';
import Post from '~/models/Post';

export const LEADERBOARD_CLASS_NAME = 'leaderboard';

LeaderboardViewController.forClass(
    LEADERBOARD_CLASS_NAME,
    (elem) => [elem, Post.current]
);
