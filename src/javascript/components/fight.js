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
    const fightersOptions = {
      leftFighter: {
        isCriticalHit: true,
        isBlock: false,
        ...firstFighter
      },
      rightFighter: {
        isCriticalHit: true,
        isBlock: false,
        ...secondFighter
      }
    };

    const leftHealthIndicator = document.getElementById('left-fighter-indicator');
    const rightHealthIndicator = document.getElementById('right-fighter-indicator');

    let pressedKeys = new Set();

    const handleKeyUnPress = (e) => {
      e.preventDefault();
      pressedKeys.delete(e.code);
      switch (e.code) {
        case PlayerOneBlock:
          fightersOptions.leftFighter.isBlock = false;
          break;
        case PlayerTwoBlock:
          fightersOptions.rightFighter.isBlock = false;
          break;
        default:
          break;
      }
    }

    const handleKeyPress = (e) => {
      pressedKeys.add(e.code);

      switch (e.code) {
        case PlayerOneAttack:
          if (!fightersOptions.leftFighter.isBlock) {
            fightersOptions.rightFighter.health -= getDamage(fightersOptions.leftFighter, fightersOptions.rightFighter);
          }
          break;
        case PlayerOneBlock:
          fightersOptions.leftFighter.isBlock = true;
          break;
        case PlayerTwoAttack:
          if (!fightersOptions.rightFighter.isBlock) {
            fightersOptions.leftFighter.health -= getDamage(fightersOptions.rightFighter, fightersOptions.leftFighter);
          }
          break;
        case PlayerTwoBlock:
          fightersOptions.rightFighter.isBlock = true;
          break;
        default:
          break;
      }

      if (pressedKeys.size >= 3) {
        const playerCriticalHit = PlayerOneCriticalHitCombination
          .every((code) => pressedKeys.has(code)) ? 'leftFighter' : 'rightFighter';
        switch (playerCriticalHit) {
          case 'leftFighter':
            if (fightersOptions.leftFighter.isCriticalHit && !fightersOptions.leftFighter.isBlock) {
              fightersOptions.rightFighter.health -= getCriticalHit(fightersOptions.leftFighter);
              fightersOptions.leftFighter.isCriticalHit = false;
              setCriticalHit(fightersOptions.leftFighter);
            }
            break;
          case 'rightFighter':
            if (fightersOptions.rightFighter.isCriticalHit && !fightersOptions.rightFighter.isBlock) {
              fightersOptions.leftFighter.health -= getCriticalHit(fightersOptions.rightFighter);
              fightersOptions.rightFighter.isCriticalHit = false;
              setCriticalHit(fightersOptions.rightFighter);
            }
            break;
          default:
            break;
        }
      }
      const healthIndicatorPlayerOne = setHealthIndicator(fightersOptions.leftFighter.health, firstFighter.health);
      const healthIndicatorPlayerTwo = setHealthIndicator(fightersOptions.rightFighter.health, secondFighter.health);

      leftHealthIndicator.style.width = healthIndicatorPlayerOne;
      rightHealthIndicator.style.width = healthIndicatorPlayerTwo;

      if (healthIndicatorPlayerOne === 0 || healthIndicatorPlayerTwo === 0) {
        document.removeEventListener('keydown', handleKeyPress);
        document.removeEventListener('keyup', handleKeyUnPress);
        healthIndicatorPlayerOne ? resolve(firstFighter) : resolve(secondFighter);
      }
    }

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyUnPress);

  });
}

export function setHealthIndicator(currentlyHealth, basedHealth) {
  const indicator = currentlyHealth * 100 / basedHealth;
  return indicator > 0 ? `${indicator}%` : 0;
}

export function setCriticalHit(player) {
  setTimeout(() => player.isCriticalHit = true, 10000);
}

export function getCriticalHit(fighter) {
  return fighter.attack * 2;
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