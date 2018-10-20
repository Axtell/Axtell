import PopoverViewController from '~/controllers/PopoverViewController';
import Template from '~/template/Template';
import Auth from '~/models/Auth';

(async () => {

    const auth = Auth.shared;

    if (auth.isAuthorized) {
        const userInfo = new PopoverViewController(
        	null,
            document.getElementById("useroverview-target"),
            Template.fromId("useroverview-info")
        );
    }

})();
