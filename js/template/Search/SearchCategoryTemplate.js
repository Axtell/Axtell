/**
 * A search category list
 */
import Template from '~/template/Template';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';
import SwappingTemplate from '~/template/SwappingTemplate';
import LoadingIcon from '~/svg/LoadingIcon';
import Search from '~/models/Search';
import Theme from '~/models/Theme';
import ErrorManager from '~/helpers/ErrorManager';

import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const UnknownIndex = Symbol('SearchCategoryTemplate.Error.UnknownIndex');

function getCategoryPredicate(category) {
    switch(category.name) {
        case 'posts': return (post, result) => (
            <a tabindex="-1" href={post.getURLSync()}>
                <div class="search-result__component search-result__component--type-image">
                    <img class="search-result__data search-result__data--style-avatar" src={ post.owner.avatar }/>
                </div>
                <div class="search-result__component search-result__component--type-stack search-result__component--size-stretch">
                    <span class="search-result__data search-result__data--style-author">
                        by { post.owner.name }
                        &middot;
                        <time datetime={ post.dateCreated } title={ post.dateCreated.toISOString() }>
                            { moment(post.dateCreated).fromNow() }
                        </time>
                    </span>
                    <h5 class="search-result__data search-result__data--style-title">{ post.title }</h5>
                    { result.highlightSnippetForKey('body', (match) =>
                        <div class="search-result__hightlighted search-result__data search-result__data--style-body">{ match }</div>) }
                </div>
            </a>
        );

        case 'answers': return (answer) => (
            <a tabindex="-1" href={answer.post.getURLSync()}>
                <div class="search-result__component search-result__component--type-image">
                    <img class="search-result__data" src={ answer.language.iconURL }/>
                </div>
                <div class="search-result__component search-result__component--type-stack search-result__component--size-stretch">
                    <span class="search-result__data search-result__data--style-language">{ answer.language.displayName }</span>
                    <span class="search-result__caption">
                        posted to
                        <h5 class="search-result__data search-result__data--style-parentPost">{ answer.post.title }</h5>
                    </span>
                </div>
                <div class="search-result__component">
                    <span class="search-result__data search-result__data--style-unit">{ answer.length }</span>
                    <span class="search-result__data search-result__data--style-unit-name">bytes</span>
                </div>
            </a>
        );

        case 'users': return (user) => (
            <a tabindex="-1" href={user.profilePage}>
                <div class="search-result__component search-result__component--type-image">
                    <img class="search-result__data search-result__data--style-avatar" src={ user.avatar }/>
                </div>
                <div class="search-result__component search-result__component--size-stretch">
                    <h5 class="search-result__data search-result__data--style-title">{ user.name }</h5>
                </div>
            </a>
        );

        default:
            ErrorManager.warn(`Could not get predicate for unknown category ${category.name}`, UnknownIndex);
            return () => <a/>;
    }
}

export default class SearchCategoryTemplate extends Template {

    /**
     * Creates search category template
     * @param {SearchCategory} category
     * @param {SearchResult[]} results
     */
    constructor(category, results) {
        const predicate = getCategoryPredicate(category);

        const root = (
            <div class="search-overlay-base search-results">
                <h4 class="search-results__title" style={`color: ${category.color}`}>{ category.title }</h4>
                <ul class="search-results__list">
                    { results.map(item => (
                        <li class="search-result">{ predicate(item.value, item) }</li>
                    )) }
                </ul>
            </div>
        );

        super(root);
    }
}
