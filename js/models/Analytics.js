import { Bugsnag } from '~/helpers/ErrorManager';

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

        Bugsnag?.leaveBreadcrumb(eventType.description || eventType.name, eventType.info || {});

        eventObject.event_category = eventType.category;
        this.gtag?.('event', eventType.name, eventObject);
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
        name: 'login_open'
    },
    loginCancel: {
        category: EventCategory.userManagement,
        description: 'Close login dialog',
        name: 'login_cancel'
    },
    loginMethod: {
        category: EventCategory.userManagement,
        name: 'login_method'
    },

    // ===== Changelog =====
    changelogOpen: {
        category: EventCategory.engagement,
        description: 'Opened changelog',
        name: 'changelog_open'
    },

    // ===== Answer Events =====
    answerWriteOpen: (post) => ({
        category: EventCategory.answer,
        info: post?.toJSON(),
        description: 'Opened answer write box',
        name: 'Begin answer write',
        value: post?.id
    }),
    answerWriteClose: (post) => ({
        category: EventCategory.answer,
        info: post?.toJSON(),
        description: 'Closed answer write box',
        name: 'Ended answer write',
        value: post?.id
    }),

    // ===== Comment Events =====
    commentWriteOpen: (ty) => ({
        category: EventCategory.comment,
        info: ty.toJSON(),
        description: 'Opened comment write box',
        name: `write_open_${ty.endpoint}`,
        value: ty.id
    }),
    commentWriteClose: (ty) => ({
        category: EventCategory.comment,
        info: ty.toJSON(),
        description: 'Closed comment write box',
        name: `write_close_${ty.endpoint}`,
        value: ty.id
    }),
    commentWrite: (ty) => ({
        category: EventCategory.comment,
        description: 'Submitted a comment',
        info: ty.toJSON(),
        name: `write_${ty.endpoint}`,
        value: ty.id
    }),
    commentTooShort: {
        category: EventCategory.comment,
        description: 'Failed to submit comment: too short',
        name: `too_short`
    },

    // ===== Voting Events =====
    postVote: {
        category: EventCategory.vote,
        description: 'Voted on a post',
        name: 'post_vote'
    },
    answerVote: {
        category: EventCategory.vote,
        description: 'Voted on an answer',
        name: 'answer_vote'
    }
};

export const TimingType = {
    pageLoad: {
        name: 'load'
    }
};
