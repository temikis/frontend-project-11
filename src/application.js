import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import view from './view';
import resources from './locales/index.js';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAIL: 'fail',
};

const defaultLanguage = 'ru';

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
        .notOneOf(state.feeds),
    });

    state.loadingProcess = {
      processState: STATUS.LOADING,
      processError: null,
    };

    const formData = new FormData(e.target);
    const data = {
      url: formData.get('url').trim(),
    };

    schema.validate(data)
      .then(({ url }) => {
        return axios.get(url);
      })
      .then((value) => {
        console.log(value);
        // state.feeds.push(url);
        // state.loadingProcess = {
        //   processState: STATUS.SUCCESS,
        //   processError: null,
        // };
      })
      .catch((error) => {
        state.loadingProcess = {
          processState: STATUS.FAIL,
          processError: error.message,
        };
      });
  });
};
