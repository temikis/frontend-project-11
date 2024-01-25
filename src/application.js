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
        const comparator = !filtredPosts.find((filtredPost) => {filtredPost.title === postOfFeed.title});
        return comparator;
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

export default async () => {
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
    form: {},
    feeds: [],
    posts: [],
  };

  yup.setLocale({
    mixed: {
      notOneOf: 'error.repeat',
    },
    string: {
      url: 'error.url',
    },
  });

  const i18nInstance = i18n.createInstance();
  // тут нужно переделать без await
  await i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const state = view(initialState, elements, i18nInstance);

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const schema = yup.object().shape({
      url: yup.string().required()
        .url()
        .notOneOf(getAllUrl(state)),
    });

    state.loadingProcess = {
      processState: STATUS.LOADING,
      processError: null,
    };

    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    const data = { url };

    schema.validate(data)
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

  watcherNews(state);
};
