import onChange from 'on-change';

const createElement = (tagName, classNames = []) => {
  const element = document.createElement(tagName);
  if (classNames.length) {
    element.classList.add(...classNames);
  }
  return element;
};

const handleForm = (elements, state, i18nInstance) => {
  const { isValid, error } = state.form;
  const { feedback } = elements;

  if (!isValid) {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nInstance.t(error);
  }
};

const handleLoadingProcess = (elements, state, i18nInstance) => {
  const { status, error } = state.loadingProcess;
  const { form, fields: { input, button }, feedback } = elements;
  switch (status) {
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
      if (error) {
        feedback.classList.remove('text-success');
        feedback.classList.add('text-danger');
        feedback.textContent = i18nInstance.t(error);
      }
      break;

    default:
      break;
  }
};

const handleFeeds = (elements, state, i18nInstance) => {
  const { feeds } = elements;
  feeds.innerHTML = '';

  const cardElement = createElement('div', ['card', 'border-0']);
  const cardBodyElement = createElement('div', ['card-body']);
  const titleElement = createElement('h2', ['card-title', 'h4']);

  titleElement.textContent = i18nInstance.t('feeds');
  cardBodyElement.appendChild(titleElement);

  const listElement = createElement('ul', ['list-group', 'border-0', 'rounded-0']);

  state.feeds.forEach((feed) => {
    const listItemElement = createElement('li', ['list-group-item', 'border-0', 'border-end-0']);
    const listItemTitleElement = createElement('h3', ['h6', 'm-0']);

    listItemTitleElement.textContent = feed.title;

    const listItemDescriptionElement = createElement('p', ['m-0', 'small', 'text-black-50']);
    listItemDescriptionElement.textContent = feed.description;

    listItemElement.appendChild(listItemTitleElement);
    listItemElement.appendChild(listItemDescriptionElement);
    listElement.appendChild(listItemElement);
  });
  cardElement.appendChild(cardBodyElement);
  cardElement.appendChild(listElement);

  feeds.appendChild(cardElement);
};

const handlePosts = (elements, state, i18nInstance) => {
  const { posts } = elements;
  posts.innerHTML = '';

  const cardElement = createElement('div', ['card', 'border-0']);
  const cardBodyElement = createElement('div', ['card-body']);
  const titleElement = createElement('h2', ['card-title', 'h4']);
  titleElement.textContent = i18nInstance.t('posts');

  cardBodyElement.appendChild(titleElement);

  const listElement = createElement('ul', ['list-group', 'border-0', 'rounded-0']);

  state.posts.forEach((post) => {
    const listItemElement = createElement('li', ['list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0']);
    const linkElement = createElement('a');
    linkElement.href = post.link;
    const isWatched = state.stateUI.watchedPosts.has(post.id);
    linkElement.classList.add(isWatched ? 'fw-normal' : 'fw-bold');
    linkElement.textContent = post.title;

    const viewButtonElement = createElement('button', ['btn', 'btn-outline-primary', 'btn-sm']);
    viewButtonElement.type = 'button';
    viewButtonElement.textContent = i18nInstance.t('view');
    viewButtonElement.setAttribute('data-id', post.id);
    viewButtonElement.setAttribute('data-bs-toggle', 'modal');
    viewButtonElement.setAttribute('data-bs-target', '#modal');

    listItemElement.appendChild(linkElement);
    listItemElement.appendChild(viewButtonElement);
    listElement.appendChild(listItemElement);
  });
  cardElement.appendChild(cardBodyElement);
  cardElement.appendChild(listElement);

  posts.appendChild(cardElement);
};

const handleModal = (elements, state, id) => {
  const { posts } = state;
  const { modal } = elements;
  const { title, description, link } = posts.find((post) => post.id === id);

  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const fullArticleLink = modal.querySelector('.full-article');

  modalTitle.textContent = title;
  modalBody.textContent = description;
  fullArticleLink.href = link;
};

const updateWatchedPosts = (value) => {
  value.forEach((id) => {
    const button = document.querySelector(`button[data-id='${id}']`);
    if (button) {
      const link = button.parentElement.querySelector('a');
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal');
    }
  });
};

const render = (elements, state, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form':
      handleForm(elements, state, i18nInstance);
      break;

    case 'loadingProcess':
      handleLoadingProcess(elements, state, i18nInstance);
      break;

    case 'feeds':
      handleFeeds(elements, state, i18nInstance);
      break;

    case 'posts':
      handlePosts(elements, state, i18nInstance);
      break;

    case 'stateUI.viewModalId':
      handleModal(elements, state, value);
      break;

    case 'stateUI.watchedPosts':
      updateWatchedPosts(value);
      break;

    default:
      break;
  }
};

export default (initialState, elements, i18nInstance) => {
  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  return state;
};
