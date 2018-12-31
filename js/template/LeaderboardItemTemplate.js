import Template, { TemplateType } from '~/template/Template';

/**
 * A template representing an item on leaderboard.
 */
export default class LeaderboardItemTemplate extends Template {
    /**
     * Creates a LeaderboardItemTemplate given an Answer object.
     *
     * @param {Answer} answer - Answer object
     * @param {number} index - Position in leaderboard
     */
    constructor(answer, index) {
        super(
            <tr>
                <td class="counter">{ index }.</td>
                <td class="item-id">
                    <img class="icon" src={answer.language.iconURL} />
                    <span class="item-anchor">
                        <a href={answer.url}>{ answer.language.displayName }</a>
                        <span class="author">by <span>{ answer.user.name }</span></span>
                    </span>
                </td>
                <td class="metric">
                    { answer.length }<span class="label-type">bytes</span>
                </td>
            </tr>
        );
    }
}
