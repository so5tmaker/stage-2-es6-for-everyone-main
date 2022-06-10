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
      },
      setCriticalHit(fighter) {
        setTimeout(() => fighter.isCriticalHit = true, 10000);
      },
      setHealthIndicator(currentlyHealth, fighterHealth) {
        const indicator = currentlyHealth * 100 / fighterHealth;
        return indicator > 0 ? `${indicator}%` : 0;
      },
      getCriticalHit(fighter) {
        return fighter.attack * 2;
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
          leftFighter.isBlock = false;
          break;
        case PlayerTwoBlock:
          rightFighter.isBlock = false;
          break;
        default:
          break;
      }
    }

    const {
      leftFighter,
      rightFighter,
      getCriticalHit,
      setHealthIndicator,
      setCriticalHit
    } = fightersOptions;

    const handleKeyPress = (e) => {
      pressedKeys.add(e.code);

      switch (e.code) {
        case PlayerOneAttack:
          if (!leftFighter.isBlock) {
            rightFighter.health -= getDamage(leftFighter, rightFighter);
          }
          break;
        case PlayerOneBlock:
          leftFighter.isBlock = true;
          break;
        case PlayerTwoAttack:
          if (!rightFighter.isBlock) {
            leftFighter.health -= getDamage(rightFighter, leftFighter);
          }
          break;
        case PlayerTwoBlock:
          rightFighter.isBlock = true;
          break;
        default:
          break;
      }

      if (pressedKeys.size >= 3) {
        const playerCriticalHit = PlayerOneCriticalHitCombination
          .every((code) => pressedKeys.has(code)) ? 'leftFighter' : 'rightFighter';
        switch (playerCriticalHit) {
          case 'leftFighter':
            if (leftFighter.isCriticalHit && !leftFighter.isBlock) {
              rightFighter.health -= getCriticalHit(leftFighter);
              leftFighter.isCriticalHit = false;
              setCriticalHit(leftFighter);
            }
            break;
          case 'rightFighter':
            if (rightFighter.isCriticalHit && !rightFighter.isBlock) {
              leftFighter.health -= getCriticalHit(rightFighter);
              rightFighter.isCriticalHit = false;
              setCriticalHit(rightFighter);
            }
            break;
          default:
            break;
        }
      }
      const healthIndicatorPlayerOne = setHealthIndicator(leftFighter.health, firstFighter.health);
      const healthIndicatorPlayerTwo = setHealthIndicator(rightFighter.health, secondFighter.health);

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

export function getDamage(attacker, defender) {
  // return damage
  const { isBlock } = defender;
  const damage = getHitPower(attacker) - getBlockPower(defender);
  return damage <= 0 || isBlock ? 0 : damage;
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