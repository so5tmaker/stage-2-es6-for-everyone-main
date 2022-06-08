import { showModal } from './modal';
import { createFighterImage } from '../fighterPreview';
import App from '../../app';

export function showWinnerModal(fighter) {
  const title = `${fighter.name} is the WINNER!!!`;
  const bodyElement = createFighterImage(fighter);
  function startNewGame() {
    const root = document.getElementById('root');
    root.innerHTML = '';
    App.startApp();
  }

  showModal({ title, bodyElement, onClose: () => startNewGame() });
  // call showModal function 
}
