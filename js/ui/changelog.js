import Analytics, { EventType } from '~/models/Analytics';

const changelogTrigger = document.getElementById('changelog__trigger');
if (changelog__trigger) {
    changelog__trigger.addEventListener('click', (event) => {
        const changelogCount = document.getElementById('changelog__count');

        if (changelogCount) {
            changelogCount.parentNode.removeChild(changelogCount);
        }

        Analytics.shared.report(EventType.changelogOpen);
    });
}
