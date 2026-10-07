(() => {
  const walks = Array.isArray(window.HHFWalks) ? window.HHFWalks : [];
  const detailPage = 'walk-detail.html';

  const element = (name, className, text) => {
    const node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const actionLink = (className, label, href, external) => {
    const link = element('a', className, label);
    link.href = href;
    if (external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    return link;
  };

  const dateTag = (className, dateTime, label) => {
    const tag = element('time', className, label);
    tag.dateTime = dateTime;
    return tag;
  };

  const programmeTime = (dateLabel) => dateLabel.split(' — ').pop();

  const eventFrame = (walk, index) => {
    const item = element('li', 'walk-event-frame');
    item.id = `walk-${walk.slug}`;
    const tone = index % 2 === 0 ? 'lime' : 'forest';
    item.dataset.tone = tone;

    const tag = dateTag('walk-event-date', walk.dateTime, walk.dateTag);

    const article = element('article', 'walk-event-card');
    article.setAttribute('aria-labelledby', `walk-${walk.slug}-title`);
    const heading = element('h3', 'walk-event-title', walk.title);
    heading.id = `walk-${walk.slug}-title`;

    const time = element('time', 'walk-event-time', programmeTime(walk.dateLabel));
    time.dateTime = walk.dateTime;

    const actions = element('div', 'walk-event-actions');
    actions.append(
      actionLink('walk-event-action', 'Ticket →', walk.ticketUrl, true),
      actionLink('walk-event-action', 'More →', `${detailPage}?event=${encodeURIComponent(walk.slug)}`, false)
    );

    article.append(heading, time, actions);
    item.append(tag, article);
    return item;
  };

  const list = document.querySelector('#walks-list');
  if (list) {
    walks.forEach((walk, index) => list.append(eventFrame(walk, index)));
  }

  const detail = document.querySelector('#walk-detail');
  if (!detail) return;

  const eventSlug = new URLSearchParams(window.location.search).get('event');
  const walk = walks.find((item) => item.slug === eventSlug);
  if (!walk) {
    detail.append(element('p', 'walk-detail-error', 'This walk could not be found.'));
    return;
  }

  document.title = `${walk.title} — Hackney History Festival`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = `${walk.title}. ${walk.dateLabel}.`;

  const back = actionLink('walk-detail-back', '← All past events', `past-events.html#walk-${walk.slug}`, false);
  const frame = element('article', 'walk-detail-frame');
  frame.dataset.tone = 'forest';
  frame.setAttribute('aria-labelledby', 'walk-detail-title');

  const tag = dateTag('walk-detail-date', walk.dateTime, walk.dateTag);
  const label = element('p', 'walk-detail-label', 'Walks 2026');
  const title = element('h1', 'walk-detail-title', walk.title);
  title.id = 'walk-detail-title';
  const meta = element('dl', 'walk-detail-meta');
  const dateTerm = element('dt', '', 'When');
  const dateValue = element('dd', '', walk.dateLabel);
  const guideTerm = element('dt', '', 'Guide');
  const guideValue = element('dd', '', walk.guide);
  meta.append(dateTerm, dateValue, guideTerm, guideValue);
  const body = element('p', 'walk-detail-description', walk.description);
  const ticket = actionLink('walk-detail-ticket', 'Get tickets →', walk.ticketUrl, true);

  frame.append(tag, label, title, meta, body, ticket);
  detail.append(back, frame);
})();
