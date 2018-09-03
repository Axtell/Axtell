import Data from '~/models/Data';

export let Bugsnag = null;

const BugsnagKey = Data.shared.envValueForKey('BUGSNAG');
if (BugsnagKey) {
    // Even though we always include bugsnag some evil ad blockers will block
    // bugsnag even though it is not an ad >:U
    if (typeof bugsnag !== 'undefined' && bugsnag) {
        Bugsnag = bugsnag({
            apiKey: BugsnagKey,
            appVersion: Data.shared.envValueForKey('VERSION'),
            autoCaptureSessions: true,
            autoBreadcrumbs: true,
            networkBreadcrumbsEnabled: true,
            beforeSend: (report) => {
                report.user.instance_id = Data.shared.dataId;
            }
        });
        Bugsnag.metaData = {};
    }
}
