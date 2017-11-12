import PopoverViewController from '~/controllers/PopoverViewController';
import Template from '~/template/Template';
import Auth from '~/models/Auth';

(async () => {
    
    const auth = await Auth.shared;
    
    if (await auth.isAuthorized) {
        const userInfo = new PopoverViewController(
            document.getElementById("userbox-target"),
            Template.fromId("userbox-info")
        );
    }
    
})().catch(error => { throw error });
