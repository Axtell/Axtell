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
        case 'posts': return (post) => (
            <a href={post.getURLSync()}>
                <div class="search-result__component search-result__component--type-image">
                    <img class="search-result__data search-result__data--style-avatar" src={ post.owner.avatar }/>
                </div>
                <div class="search-result__component search-result__component--type-stack">
                    <span class="search-result__data search-result__data--style-author">
                        by { post.owner.name }
                        &middot;
                        <time datetime={ post.dateCreated } title={ post.dateCreated.toISOString() }>
                            { moment(post.dateCreated).fromNow() }
                        </time>
                    </span>
                    <h5 class="search-result__data search-result__data--style-title">{ post.title }</h5>
                </div>
            </a>
        );

        case 'answers': return (answer) => (
            <a href={answer.post.getURLSync()}></a>
        );

        case 'users': return (user) => (
            <a href={user.profilePage}></a>
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
            <div class="search-results">
                <h4 class="search-results__title" style={`color: ${category.color}`}>{ category.title }</h4>
                <ul class="search-results__list">
                    { results.map(item => (
                        <li class="search-result">{ predicate(item.value) }</li>
                    )) }
                </ul>
            </div>
        );

        super(root);
    }
}
