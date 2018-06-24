import ViewController from '~/controllers/ViewController';
import AnimationControllerDelegate from '~/delegate/AnimationControllerDelegate';

function anim(name, types, props) {
    let o = {};
    for (let i = 0; i < types.length; i++) {
        o[types[i]] = [name, types[i], props];
    }
    return [name, o];
}

function anims(anims) {
    let o = {};
    for (let i = 0; i < anims.length; i++) {
        o[anims[i][0]] = anims[i][1];
    }
    return o;
}

export const Animation = anims([
    anim('slide', ['left', 'bottom'], {
        time: 301
    }),
    anim('expand', ['height', 'width'], {
        time: 201,
        styles: new Map([
            ['height', (e) => `${e.scrollHeight}px`]
        ])
    }),
    anim('swipe-menu', ['activate'], {
        time: 101,
        styles: new Map([
            ['left', (e) => `${e.scrollX}px`],
            ['top', (e) => `${e.scrollY}px`],
        ])
    })
]);

/**
 * Manages an animated element
 */
export default class AnimationController extends ViewController {
    /**
     * Creates an animation controller. Do note that some animations require elements
     * to be in the DOM at the time otherwise their width/height calculations would
     * be incorrect.
     *
     * @param {HTMLElement} element element to animate
     * @param {Animation[]} animations See {@link Animation}
     */
    constructor(element, animations) {
        super();

        if (!element.animationControllers) element.animationControllers = [this];
        else element.animationControllers.push(this);

        /** @private */
        this.element = element;

        /** @private */
        this.styles = new Map();

        let largestAnimationTime = 0;
        for (const [name, variation, { time: defaultTime, styles }] of animations) {
            this.element.classList.add(`template--animated`);
            this.element.classList.add(`template--animation-${name}`);
            this.element.classList.add(`template--${name}-${variation}`);

            styles.forEach((value, key) => this.styles.set(key, value));

            largestAnimationTime = Math.max(largestAnimationTime, defaultTime);
        }

        /** @private */
        this.animationTime = this.element.dataset.animationTime || largestAnimationTime;

        /** @private */
        this.delegate = new AnimationControllerDelegate();

        /** @private */
        this.untriggerTimeout = null;

        /** @private */
        this.triggerTimeout = null;
    }

    /**
     * Starts the animation. Do note that calculation for some animations is done
     * here so it may be needed to expand
     */
    triggerAnimation() {
        setTimeout(() => {
            this.delegate.didStartAnimation(this);

            if (this.untriggerTimeout) clearTimeout(this.untriggerTimeout);

            this.element.classList.add('template--active');
            this.styles.forEach((value, style) => {
                this.element.style[style] = value(this.element);
            });

            this.triggerTimeout = setTimeout(() => {
                this.triggerTimeout = null;
                this.styles.forEach((_, style) => {
                    this.element.style[style] = '';
                });
                this.element.classList.add('template--finished');
                this.delegate.didFinishAnimation(this);
            }, this.animationTime);
        });
    }

    /**
     * Starts the opposite animation. e.g. hide
     */
    untriggerAnimation() {
        this.delegate.didUnstartAnimation(this);

        if (this.triggerTimeout) clearTimeout(this.triggerTimeout);

        this.styles.forEach((value, style) => {
            this.element.style[style] = value(this.element);
        });
        this.element.classList.remove('template--active', 'template--finished');
        setTimeout(() => {
            this.styles.forEach((_, style) => {
                this.element.style[style] = '';
            });
            this.untriggerTimeout = setTimeout(() => {
                this.untriggerTimeout = null;
                this.delegate.didUnfinishAnimation(this);
            }, this.animationTime);
        });
    }
}
