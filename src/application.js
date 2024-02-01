import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import view from './view.js';
import resources from './locales/index.js';
import parse from './parserRss.js';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAIL: 'fail',
};

const defaultLanguage = 'ru';

const getProxy = (url) => {
  const proxy = new URL('/get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);

  return proxy;
};

const selectFeedsUrls = (state) => state.feeds.map((element) => element.url);

const validate = async (url, existingUrls) => {
  yup.setLocale({
    mixed: {
      notOneOf: 'error.repeat',
    },
    string: {
      url: 'error.url',
    },
  });

  const schema = yup.string().required().url().notOneOf(existingUrls);

  return schema.validate(url);
};

const addNewContent = (url, value, state) => {
  const id = String(uniqueId());
  const { feed, posts } = value;

  state.feeds.push({ id, url, ...feed });
  const newPosts = posts.map((newPost) => ({
    id: String(uniqueId()),
    feedId: id,
    ...newPost,
  }));
  state.posts.unshift(...newPosts);
};

const watcherNews = (state) => {
  const { feeds, posts } = state;

  const promises = Promise.all(feeds.map(({ url }) => axios.get(getProxy(url))));

  promises.then((respones) => {
    respones.forEach((respone) => {
      const { feed, posts: postsOfFeed } = parse(respone);
      const { id } = feeds.find((feedItem) => feedItem.title === feed.title);
      const filtredPosts = posts.filter((post) => post.feedId === id);
      const uniqueNewPosts = postsOfFeed.filter((postOfFeed) => {
        const compare = !filtredPosts.some((filtredPost) => filtredPost.title === postOfFeed.title);
        return compare;
      });

      if (uniqueNewPosts.length > 0) {
        uniqueNewPosts.forEach((newPost) => {
          const preparedNewPost = { id: String(uniqueId()), feedId: id, ...newPost };
          return posts.unshift(preparedNewPost);
        });
      }
    });
  })
    .catch((error) => {
      console.error(error);
    });
  setTimeout(() => watcherNews(state), 5000);
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
    const state = view(initialState, elements, i18nInstance);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url').trim();
      const existingUrls = selectFeedsUrls(state);

      state.loadingProcess = {
        status: STATUS.LOADING,
        error: null,
      };

      validate(url, existingUrls)
        .catch((error) => {
          state.form = {
            isValid: false,
            error: error.message,
          };

          throw new Error();
        })
        .then((valideUrl) => {
          state.form = {
            isValid: true,
            error: null,
          };

          return axios.get(getProxy(valideUrl));
        })
        .catch(() => {
          throw new Error('error.networkError');
        })
        .then(parse)
        .then((value) => {
          state.loadingProcess = {
            status: STATUS.SUCCESS,
            error: null,
          };

          addNewContent(url, value, state);
        })
        .catch((error) => {
          state.loadingProcess = {
            status: STATUS.FAIL,
            error: error.message,
          };
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
