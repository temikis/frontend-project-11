export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.data.contents, 'application/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const customError = new Error();
    customError.isParserError = true;
    throw customError;
  }

  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const feed = { title: feedTitle, description: feedDescription };

  const posts = [];
  const items = doc.querySelectorAll('item');
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    posts.push({ title, link, description });
  });

  return { feed, posts };
};
