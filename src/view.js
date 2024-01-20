import onChange from 'on-change';

const handleLoadingProcess = (elements, state, i18nInstance) => {
  const { processState, processError } = state.loadingProcess;
  const { form, fields: { input, button }, feedback } = elements;
  switch (processState) {
    case 'loading':
      input.setAttribute('readonly', 'true');
      input.classList.remove('is-invalid');
      button.disabled = true;
      feedback.textContent = '';
      break;

    case 'success':
      input.removeAttribute('readonly');
      input.classList.remove('is-invalid');
      button.disabled = false;
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18nInstance.t('success');
      form.reset();
      input.focus();
      break;

    case 'fail':
      input.removeAttribute('readonly');
      input.classList.add('is-invalid');
      button.disabled = false;
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18nInstance.t(processError);
      break;

    default:
      break;
  }
};

const render = (elements, state, i18nInstance) => (path) => {
  // console.log(path) (path, value, prevValue)
  switch (path) {
    case 'loadingProcess':
      handleLoadingProcess(elements, state, i18nInstance);
      break;

    case 'signupProcess.processError':
      // handleProcessError();
      break;

    case 'form.valid':
      // elements.submitButton.disabled = !value;
      break;

    case 'form.errors':
      // renderErrors(elements, value, prevValue, initialState);
      break;

    default:
      break;
  }
};

export default (initialState, elements, i18nInstance) => {
  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  return state;
};
