import onChange from 'on-change';

const handleLoadingProcess = (elements, state) => {
  const { processState, processError } = state.loadingProcess;
  const { form, fields: { input, button }, feedback } = elements;
  switch (processState) {
    case 'loading':
      input.setAttribute('readonly', 'true');
      input.classList.remove('is-invalid');
      button.disabled = true;
      feedback.innerText = '';
      break;

    case 'succes':
      input.removeAttribute('readonly');
      input.classList.remove('is-invalid');
      button.disabled = false;
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.innerText = 'RSS успешно загружен';
      form.reset();
      input.focus();
      break;

    case 'fail':
      input.removeAttribute('readonly');
      input.classList.add('is-invalid');
      button.disabled = false;
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.innerText = processError;
      break;

    default:
      break;
  }
};

const render = (elements, state) => (path) => {
  // console.log(path); (path, _value, _prevValue)
  switch (path) {
    case 'loadingProcess':
      handleLoadingProcess(elements, state);
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

export default (initialState, elements) => {
  const state = onChange(initialState, render(elements, initialState));

  return state;
};
