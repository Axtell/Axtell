import Auth from '~/models/Auth';
import User from '~/models/User';
import Data from '~/models/Data';
import addSchema from '~/helpers/addSchema';
import FollowButtonController from '~/controllers/FollowButtonController';

import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const FOLLOW_BUTTON_ID = "user__follow";

const profileUserData = Data.shared.encodedJSONForKey('profile_user');
if (profileUserData) {
    const profileUser = User.fromJSON(profileUserData);

    // We are on profile page.
    (async () => {

        const schema = await profileUser.getSchema();
        addSchema({
            "@context": "http://schema.org",
            "@type": "ProfilePage",
            mainEntity: schema,
            about: schema
        });


        const auth = await Auth.shared;

        if (await auth.isAuthorized) {
            // Setup follow button
            const followButtonNode = document.getElementById(FOLLOW_BUTTON_ID);
            followButtonNode && new FollowButtonController(followButtonNode, auth, profileUser);
        }


    })().catch(HandleUnhandledPromise);
}
