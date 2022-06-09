import { controls } from '../../constants/controls';

const {
  PlayerOneAttack,
  PlayerOneBlock,
  PlayerTwoAttack,
  PlayerTwoBlock,
  PlayerOneCriticalHitCombination,
} = controls;

export async function fight(firstFighter, secondFighter) {
  return new Promise((resolve) => {
    const leftHealthIndicator = document.getElementById('left-fighter-indicator');
    const rightHealthIndicator = document.getElementById('right-fighter-indicator');
    // State fight players
    const state = {
      playerOne: { isCriticalHit: true, isBlock: false, ...firstFighter },
      playerTwo: { isCriticalHit: true, isBlock: false, ...secondFighter }
    };
    // 
    let pressed = new Set();

    document.addEventListener('keydown', (event) => {
      pressed.add(event.code);
      // Hit event
      switch (event.code) {
        case PlayerOneAttack:
          if (!state.playerOne.isBlock) {
            state.playerTwo.health -= getDamage(state.playerOne, state.playerTwo);
          }
          break;
        case PlayerOneBlock:
          state.playerOne.isBlock = true;
          break;
        case PlayerTwoAttack:
          if (!state.playerTwo.isBlock) {
            state.playerOne.health -= getDamage(state.playerTwo, state.playerOne);
          }
          break;
        case PlayerTwoBlock:
          state.playerTwo.isBlock = true;
          break;
        default:
          break;
      }
      // Critical Hit Combination event
      if (pressed.size >= 3) {
        const playerCriticalHit = PlayerOneCriticalHitCombination
          .every((code) => pressed.has(code)) ? 'playerOne' : 'playerTwo';
        switch (playerCriticalHit) {
          case 'playerOne':
            if (state.playerOne.isCriticalHit && !state.playerOne.isBlock) {
              state.playerTwo.health -= criticalHit(state.playerOne);
              state.playerOne.isCriticalHit = false;
              reloadCriticalHit(state.playerOne);
            }
            break;
          case 'playerTwo':
            if (state.playerTwo.isCriticalHit && !state.playerTwo.isBlock) {
              state.playerOne.health -= criticalHit(state.playerTwo);
              state.playerTwo.isCriticalHit = false;
              reloadCriticalHit(state.playerTwo);
            }
            break;
          default:
            break;
        }
      }
      const healthIndicatorPlayerOne = healthIndicator(state.playerOne.health, firstFighter.health);
      const healthIndicatorPlayerTwo = healthIndicator(state.playerTwo.health, secondFighter.health);
      // Render players healthIndicator
      leftHealthIndicator.style.width = healthIndicatorPlayerOne;
      rightHealthIndicator.style.width = healthIndicatorPlayerTwo;
      // resolve the promise with the winner when fight is over
      if (healthIndicatorPlayerOne === 0 || healthIndicatorPlayerTwo === 0) {
        healthIndicatorPlayerOne ? resolve(firstFighter) : resolve(secondFighter);
      }
    })

    document.addEventListener('keyup', (event) => {
      pressed.delete(event.code);
      // Remove player`s block event
      switch (event.code) {
        case PlayerOneBlock:
          state.playerOne.isBlock = false;
          break;
        case PlayerTwoBlock:
          state.playerTwo.isBlock = false;
          break;
        default:
          break;
      }
    });

  });
}

export function healthIndicator(currentlyHealth, basedHealth) {
  // return player health
  const indicator = currentlyHealth * 100 / basedHealth;
  return indicator > 0 ? `${indicator}%` : 0;
}

export function reloadCriticalHit(player) {
  // reload critical hit
  setTimeout(() => player.isCriticalHit = true, 10000);
}

export function criticalHit(fighter) {
  // return critical hit
  const { attack } = fighter;
  return attack * 2;
}

export function getDamage(attacker, defender) {
  // return damage
  const damage = getHitPower(attacker) - getBlockPower(defender)
  const isBlockedDamage = defender.isBlock && defender.defense > attacker.attack;
  return isBlockedDamage || Math.sign(damage) === -1 ? 0 : damage;
}

export function getHitPower(fighter) {
  // return hit power
  const { attack } = fighter;
  const criticalHitChance = Math.random() + 1;
  return attack * criticalHitChance;
}

export function getBlockPower(fighter) {
  // return block power
  const { defense } = fighter;
  const dodgeChance = Math.random() + 1;
  return defense * dodgeChance;
}