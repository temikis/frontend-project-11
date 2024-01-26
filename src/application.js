import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import view from './view';
import resources from './locales/index.js';
import parse from './parserRss.js';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAIL: 'fail',
};

const defaultLanguage = 'ru';

const getAllUrl = (state) => state.feeds.map((element) => element.url);

const getResponse = async ({ url }) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`);

const validate = async (url, state) => {
  const data = { url };

  yup.setLocale({
    mixed: {
      notOneOf: 'error.repeat',
    },
    string: {
      url: 'error.url',
    },
  });

  const schema = yup.object().shape({
    url: yup.string().required()
      .url()
      .notOneOf(getAllUrl(state)),
  });

  return schema.validate(data);
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
  // state = feeds: {id, title, description}, posts: [{id, feedid, title, link, description}, ...]
  const { feeds, posts } = state;

  const promises = Promise.all(feeds.map(getResponse));

  promises.then((respones) => {
    respones.forEach((respone) => {
      const { feed, posts: postsOfFeed } = parse(respone);
      const { id } = feeds.find((feedItem) => feedItem.title === feed.title);
      // {id, feedId, description, title, link}
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
    loadingProcess: {
      processState: 'succes',
      processError: null,
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

      state.loadingProcess = {
        processState: STATUS.LOADING,
        processError: null,
      };

      validate(url, state)
        .then(getResponse)
        .then(parse)
        .then((value) => {
          state.loadingProcess = {
            processState: STATUS.SUCCESS,
            processError: null,
          };

          addNewContent(url, value, state);
        })
        .catch((error) => {
          state.loadingProcess = {
            processState: STATUS.FAIL,
            processError: error.message,
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
