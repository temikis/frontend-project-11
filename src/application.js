import * as yup from 'yup';
import view from './view';

const STATUS = {
  LOADING: 'loading',
  SUCCES: 'succes',
  FAIL: 'fail',
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
    form: {},
    feeds: [],
  };

  const state = view(initialState, elements);

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const schema = yup.object().shape({
      url: yup.string().trim().required()
        .url('Ссылка должна быть валидным URL')
        .notOneOf(state.feeds, 'RSS уже существует'),
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
        state.feeds.push(url);
        state.loadingProcess = {
          processState: STATUS.SUCCES,
          processError: null,
        };
      })
      .catch((error) => {
        state.loadingProcess = {
          processState: STATUS.FAIL,
          processError: error.message,
        };
      });
  });
};
