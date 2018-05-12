import Analytics, { EventType } from '~/models/Analytics';

const changelogTrigger = document.getElementById('changelog__trigger');
if (changelog__trigger) {
    changelog__trigger.addEventListener('click', (event) => {
        Analytics.shared.report(EventType.changelogOpen);
    });
}
