import Theme from '~/models/Theme';
import User from '~/models/Request/User';
import UserOverviewTemplate from '~/template/UserOverviewTemplate';
import LoadingIcon from '~/svg/LoadingIcon';

import tippy from 'tippy.js/dist/tippy.all.min.js';

export const USERBOX_AUTHOR_TRIGGERS = document.getElementsByClassName('userbox--trigger-author');

for (const trigger of USERBOX_AUTHOR_TRIGGERS) {
    const userId = trigger.dataset.userid;
    const userRequest = new User({ id: userId });
    const template = new UserOverviewTemplate(userRequest);

    let setup = false;

    tippy.one(trigger, {
        delay: [400, 0],
        theme: Theme.current.name,
        html: <div></div>,
        arrow: true,
        interactive: true,
        onShow(tip) {
            this.getElementsByClassName('tippy-tooltip')[0].style.padding = "0";

            const content = this.getElementsByClassName('tippy-content')[0];
            template.loadInContext(content, false);
        }
    })
};
