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

const handleFeeds = (elements, state, i18nInstance) => {
  const { feeds } = elements;
  feeds.innerHTML = '';

  const cardElement = document.createElement('div');
  cardElement.classList.add('card', 'border-0');

  const cardBodyElement = document.createElement('div');
  cardBodyElement.classList.add('card-body');

  const titleElement = document.createElement('h2');
  titleElement.classList.add('card-title', 'h4');
  titleElement.textContent = i18nInstance.t('feeds');

  cardBodyElement.appendChild(titleElement);

  const listElement = document.createElement('ul');
  listElement.classList.add('list-group', 'border-0', 'rounded-0');

  state.feeds.forEach((feed) => {
    const listItemElement = document.createElement('li');
    listItemElement.classList.add('list-group-item', 'border-0', 'border-end-0');

    const listItemTitleElement = document.createElement('h3');
    listItemTitleElement.classList.add('h6', 'm-0');
    listItemTitleElement.textContent = feed.title;

    const listItemDescriptionElement = document.createElement('p');
    listItemDescriptionElement.classList.add('m-0', 'small', 'text-black-50');
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

  const cardElement = document.createElement('div');
  cardElement.classList.add('card', 'border-0');

  const cardBodyElement = document.createElement('div');
  cardBodyElement.classList.add('card-body');

  const titleElement = document.createElement('h2');
  titleElement.classList.add('card-title', 'h4');
  titleElement.textContent = i18nInstance.t('posts');

  cardBodyElement.appendChild(titleElement);

  const listElement = document.createElement('ul');
  listElement.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach((post) => {
    const listItemElement = document.createElement('li');
    listItemElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const linkElement = document.createElement('a');
    linkElement.href = post.link;
    const isWatched = state.stateUI.watchedPosts.has(post.id);
    linkElement.classList.add(isWatched ? 'fw-normal' : 'fw-bold');
    linkElement.textContent = post.title;

    const viewButtonElement = document.createElement('button');
    viewButtonElement.type = 'button';
    viewButtonElement.classList.add('btn', 'btn-outline-primary', 'btn-sm');
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
  const { title, description, link}  = posts.find((post) => post.id === id);
  
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const fullArticleLink = modal.querySelector('.full-article');

  modalTitle.textContent = title;
  modalBody.textContent = description;
  fullArticleLink.href = link;
};

const updateWatchedPosts = (value) => {
  value.forEach((id) => {
    console.log(id);
    const button = document.querySelector(`button[data-id='${id}']`);
    if (button) {
      const link = button.parentElement.querySelector('a');
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal');
    }
  });
};

const render = (elements, state, i18nInstance) => (path, value, prevValue) => {
  console.log(path);
  switch (path) {
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
