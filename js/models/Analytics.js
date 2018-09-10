import { Bugsnag } from '~/helpers/Bugsnag';

/**
 * Analytics wrapper
 */
export default class Analytics {
    /**
     * The object to create from which. Returns `null` if invalid
     * @param {Object} obj Generally `gtag`
     */
    constructor(obj) {
        if (!obj) return null;

        /** @private */
        this.gtag = obj;
    }

    /**
     * Reports an event of type
     * @param {string} eventName An additional descriptor name
     * @param {EventType} eventType An EventType symbol
     * @param {?string} label a string describing event
     * @param {?number} id unique number
     */
    report(eventType, label = null, id = null) {
        const eventObject = {};

        if (eventType.value) {
            eventObject.value = eventType.value;
        }

        if (typeof label == 'number' || id) {
            eventObject.value = id || label;
        }

        if (typeof label == 'string') {
            eventObject.event_label = label;
        }

        Bugsnag?.leaveBreadcrumb(eventType.name, eventType.info || {});

        eventObject.event_category = eventType.category;
        this.gtag?.('event', eventType.name, eventObject);
    }

    /**
     * Reports an error
     * @param {string} level - `error` or `warning`
     * @param {Error|AnyError} error
     * @param {Object} opts - Additional options
     * @param {boolean} [opts.critical=false] If the error is critical to app
     */
    reportError(level, error, { critical = false } = {}) {
        if (error?.jsError) {
            Bugsnag?.notify(
                error.jsError,
                {
                    name: error.toString(),
                    severity: level
                }
            );
        } else {
            Bugsnag?.notify(error, {
                severity: level
            })
        }

        this.gtag?.('event', 'exception', {
            description: String(error),
            fatal: critical
        })
    }

    /**
     * Reports a time of sorts
     * @param {TimingType} timingTime An TimingType symbol
     * @param {number} id time in MS
     */
    reportTime(timingType, id) {
        let timingObject = Object.create(timingType);
        timingObject.value = id;
        this.gtag?.('event', 'timing_complete', timingObject);
    }

    static shared = new Analytics(window.gtag);
}

export const EventCategory = {
    engagement: 'engagement',
    userManagement: 'user_management',
    socialEngagement: 'social_engagement',
    vote: 'Vote',
    comment: 'Comment',
    answer: 'Answer'
};

export const EventType = {
    // ===== Login Events =====
    loginOpen: {
        category: EventCategory.userManagement,
        description: 'Open login dialog',
        name: 'Opened login dialog'
    },
    loginCancel: {
        category: EventCategory.userManagement,
        description: 'Close login dialog',
        name: 'Closed login dialog'
    },
    loginMethod: {
        category: EventCategory.userManagement,
        name: 'login_method'
    },

    // ===== Changelog =====
    changelogOpen: {
        category: EventCategory.engagement,
        description: 'Opened changelog',
        name: 'Opened Changelog'
    },

    // ===== Answer Events =====
    answerWriteOpen: (post) => ({
        info: post?.toJSON(),
        value: post?.id,
        category: EventCategory.answer,
        description: 'Opened answer write box',
        name: 'Begin answer write',
    }),
    answerWriteClose: (post) => ({
        info: post?.toJSON(),
        value: post?.id,
        category: EventCategory.answer,
        description: 'Closed answer write box',
        name: 'Ended answer write',
    }),

    answerEditClick: (post) => ({
        info: post?.toJSON(),
        value: post?.id,
        category: EventCategory.answer,
        name: 'Clicked edit answer',
    }),
    answerEdited: (post) => ({
        info: post?.toJSON(),
        value: post?.id,
        category: EventCategory.answer,
        name: 'Edited answer',
    }),
    answerNotEdited: (post) => ({
        info: post?.toJSON(),
        value: post?.id,
        category: EventCategory.answer,
        name: 'Canceled edit answer',
    }),

    // === Delete Events ===
    deleteClick: (post) => ({
        info: post?.toJSON(),
        value: post?.id,
        category: EventCategory.answer,
        name: 'Clicked delete answer',
    }),
    deleted: (post) => ({
        info: post?.toJSON(),
        value: post?.id,
        category: EventCategory.answer,
        name: 'Deleted answer',
    }),
    notDeleted: (post) => ({
        info: post?.toJSON(),
        value: post?.id,
        category: EventCategory.answer,
        name: 'Canceled delete answer',
    }),

    // ===== Comment Events =====
    commentWriteOpen: (ty) => ({
        category: EventCategory.comment,
        info: ty.toJSON(),
        description: 'Opened comment write box',
        name: `Began writting ${ty.endpoint} comment`,
        value: ty.id
    }),
    commentWriteClose: (ty) => ({
        category: EventCategory.comment,
        info: ty.toJSON(),
        name: `Cancel writing ${ty.endpoint} cp,,emt`,
        value: ty.id
    }),
    commentWrite: (ty) => ({
        category: EventCategory.comment,
        info: ty.toJSON(),
        name: `Wrote ${ty.endpoint} comment`,
        value: ty.id
    }),
    commentTooShort: {
        category: EventCategory.comment,
        name: `Comment too short`
    },

    // ===== Voting Events =====
    postVote: {
        category: EventCategory.vote,
        name: 'Post vote'
    },
    answerVote: {
        category: EventCategory.vote,
        name: 'Answer vote'
    }
};

export const TimingType = {
    pageLoad: {
        name: 'load'
    }
};
