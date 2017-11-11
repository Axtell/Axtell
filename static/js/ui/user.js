import Auth from '~/models/Auth';

(async () => {
    
    const auth = await Auth.shared;
    
    if (await auth.isAuthorized) {
        // We are authorized lets get the user
        const user = await auth.getUser();
        
    }
    
})().catch(error => { throw error });
