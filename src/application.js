import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import view from './view.js';
import resources from './locales/index.js';
import customErrors from './locales/customErrors.js';
import parse from './parserRss.js';

const defaultLanguage = 'ru';
const updateTime = 5000;
const waitingTime = 10000;

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAIL: 'fail',
};

const getProxy = (url) => {
  const proxy = new URL('/get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);

  return proxy.toString();
};

const getErrorMessage = (error) => {
  if (error.isAxiosError) {
    return 'error.networkError';
  }
  if (error.isParserError) {
    return 'error.isNotRss';
  }

  return 'error.unknownError';
};

const selectFeedsUrls = (state) => state.feeds.map((element) => element.url);

const validate = (url, existingUrls) => {
  const schema = yup.string().required().url().notOneOf(existingUrls);

  return schema
    .validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const addNewContent = (url, value, state) => {
  const id = uniqueId();
  const { feed, posts } = value;

  state.feeds.push({ id, url, ...feed });
  const newPosts = posts.map((newPost) => ({
    id: uniqueId(),
    feedId: id,
    ...newPost,
  }));
  state.posts.unshift(...newPosts);
};

const watcherNews = (state) => {
  const { feeds, posts } = state;

  const promises = feeds.map(({ url, id }) => axios.get(getProxy(url), { timeout: waitingTime })
    .then((response) => {
      const { posts: postsOfFeed } = parse(response);
      const filtredPosts = posts.filter((post) => post.feedId === id);
      const uniqueNewPosts = postsOfFeed.filter((postOfFeed) => {
        const compare = !filtredPosts.some((filtredPost) => filtredPost.title === postOfFeed.title);
        return compare;
      });

      if (uniqueNewPosts.length > 0) {
        uniqueNewPosts.forEach((newPost) => {
          const preparedNewPost = { id: uniqueId(), feedId: id, ...newPost };
          return posts.unshift(preparedNewPost);
        });
      }
    })
    .catch((error) => {
      console.error(error);
    }));

  Promise.all(promises).then(setTimeout(() => watcherNews(state), updateTime));
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    fields: {
      input: document.getElementById('url-input'),
      button: document.querySelector('button[type="submit"]'),
    },
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  const initialState = {
    form: {
      isValid: true,
      error: null,
    },
    loadingProcess: {
      status: 'succes',
      error: null,
    },
    stateUI: {
      viewModalId: null,
      watchedPosts: new Set(),
    },
    feeds: [],
    posts: [],
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale(customErrors);

    const state = view(initialState, elements, i18nInstance);

    const loadFeed = (url) => {
      state.loadingProcess = {
        status: STATUS.LOADING,
        error: null,
      };

      return axios.get(getProxy(url))
        .then((response) => {
          const value = parse(response);
          state.loadingProcess = {
            status: STATUS.SUCCESS,
            error: null,
          };

          addNewContent(url, value, state);
        })
        .catch((error) => {
          const errorMessage = getErrorMessage(error);
          state.loadingProcess = {
            status: STATUS.FAIL,
            error: errorMessage,
          };
        });
    };

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url').trim();
      const existingUrls = selectFeedsUrls(state);

      validate(url, existingUrls)
        .then((error) => {
          if (error) {
            state.form = {
              isValid: false,
              error,
            };
            return;
          }

          state.form = {
            isValid: true,
            error: null,
          };
          loadFeed(url);
        });
    });

    elements.posts.addEventListener('click', (e) => {
      const postId = e.target.dataset.id;
      if (postId) {
        state.stateUI.watchedPosts.add(postId);
        state.stateUI.viewModalId = postId;
      }
    });

    watcherNews(state);
  });
};
