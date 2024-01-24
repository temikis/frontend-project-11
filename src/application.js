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
      .then(({ url }) => axios.get(`https://allorigins.hexlet.app/get?url=${url}`))
      .then(parse)
      .then((value) => {
        // console.log(value);
        // state.feeds.push(url);
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
};
