import { createElement } from '../helpers/domHelper';

export function createFighterPreview(fighter, position) {
  const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
  const fighterElement = createElement({
    tagName: 'div',
    className: `fighter-preview___root ${positionClassName}`,
  });

  // todo: show fighter info (image, name, health, etc.)
  if (fighter) {
    Object.keys(fighter)
      .filter(key => key !== '_id' && key !== 'source')
      .forEach((key) => {
        const fighterInfo = createElement({
          tagName: 'div',
          className: 'arena___fighter-name',
        });
        fighterInfo.innerHTML = `${key.toUpperCase()}: ${fighter[key]}`;
        fighterElement.append(fighterInfo);
      });
  }

  return fighterElement;
}

export function createFighterImage(fighter) {
  const { source, name } = fighter;
  const attributes = {
    src: source,
    title: name,
    alt: name
  };
  const imgElement = createElement({
    tagName: 'img',
    className: 'fighter-preview___img',
    attributes,
  });

  return imgElement;
}
