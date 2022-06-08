import { controls } from '../../constants/controls';

const {
  PlayerOneAttack,
  PlayerOneBlock,
  PlayerTwoAttack,
  PlayerTwoBlock,
  PlayerOneCriticalHitCombination,
  PlayerTwoCriticalHitCombination,
} = controls;

export async function fight(firstFighter, secondFighter) {
  let pressedKeys = new Set();
  let leftFighterHealth = firstFighter.health;
  let rightFighterHealth = secondFighter.health;

  const leftIndicator = document.getElementById('left-fighter-indicator');
  const rightIndicator = document.getElementById('right-fighter-indicator');

  const getWonFighter = () => {
    leftIndicator.style.width = (leftFighterHealth / firstFighter.health) * 100 + '%';
    rightIndicator.style.width = (rightFighterHealth / secondFighter.health) * 100 + '%';

    if (leftFighterHealth >= 0 && rightFighterHealth <= 0) {
      rightIndicator.style.width = '0%';
      return firstFighter;
    }
    if (leftFighterHealth <= 0 && rightFighterHealth >= 0) {
      leftIndicator.style.width = '0%';
      return secondFighter;
    }
    return false;
  }

  const handleKeyUp = (e) => {
    e.preventDefault();
    pressedKeys.delete(e.code);
  }

  return new Promise((resolve) => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    const handleKeyDown = (e) => {
      e.preventDefault();
      pressedKeys.add(e.code);
      let power = fightControls(pressedKeys, firstFighter, secondFighter);
      rightFighterHealth -= getDamage(power[0].firstFighterHit, power[0].secondFighterBlock);
      leftFighterHealth -= getDamage(power[1].secondFighterHit, power[1].firstFighterBlock);
      const wonFighter = getWonFighter();
      if (wonFighter) {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        resolve(wonFighter);
      }
    }
    // resolve the promise with the winner when fight is over
  });
}

const isCriticalHitCombination = (hitCombinations, keysArray) => {
  const hitCombination = hitCombinations.reduce((previous, current) =>
    previous + Number(keysArray.includes(current)), 0);
  return hitCombination === 3;
}

let firstFighterHighestPower = true;
let secondFighterHighestPower = true;

function fightControls(keys, firstFighter, secondFighter) {
  const keysArray = [...keys];
  let firstFighterHit = 0;
  let firstFighterBlock = 0;
  let secondFighterHit = 0;
  let secondFighterBlock = 0;

  if (
    (firstFighterHighestPower && isCriticalHitCombination(PlayerOneCriticalHitCombination, keysArray)) ||
    (secondFighterHighestPower && isCriticalHitCombination(PlayerTwoCriticalHitCombination, keysArray))
  ) {
    if (
      isCriticalHitCombination(PlayerOneCriticalHitCombination, keysArray) &&
      isCriticalHitCombination(PlayerTwoCriticalHitCombination, keysArray)
    ) {
      firstFighterHighestPower = false;
      secondFighterHighestPower = false;
      firstFighterHit = getHitPower(firstFighter.attack * 2);
      secondFighterHit = getHitPower(secondFighter.attack * 2);
      setTimeout(() => {
        firstFighterHighestPower = true;
        secondFighterHighestPower = true;
      }, 10000);
      return [
        { firstFighterHit, secondFighterBlock },
        { secondFighterHit, firstFighterBlock },
      ];
    }
    if (isCriticalHitCombination(PlayerOneCriticalHitCombination, keysArray)) {
      if (keysArray.includes(PlayerTwoAttack)) {
        secondFighterHit = getHitPower(secondFighter.attack);
      }
      firstFighterHighestPower = false;
      firstFighterHit = getHitPower(firstFighter.attack * 2);
      setTimeout(() => {
        firstFighterHighestPower = true;
      }, 10000);
      return [
        { firstFighterHit, secondFighterBlock },
        { secondFighterHit, firstFighterBlock },
      ];
    }
    if (isCriticalHitCombination(PlayerTwoCriticalHitCombination, keysArray)) {
      if (keysArray.includes(PlayerOneAttack)) {
        firstFighterHit = getHitPower(firstFighter.attack);
      }
      secondFighterHighestPower = false;
      secondFighterHit = getHitPower(secondFighter.attack * 2);
      setTimeout(() => {
        secondFighterHighestPower = true;
      }, 10000);
      return [
        { firstFighterHit, secondFighterBlock },
        { secondFighterHit, firstFighterBlock },
      ];
    }
    return [
      { firstFighterHit, secondFighterBlock },
      { secondFighterHit, firstFighterBlock },
    ];
  }

  if (keysArray.includes(PlayerOneBlock) || keysArray.includes(PlayerTwoBlock)) {
    if (keysArray.includes(PlayerOneBlock) && keysArray.includes(PlayerTwoBlock)) {
      return [
        { firstFighterHit, secondFighterBlock },
        { secondFighterHit, firstFighterBlock },
      ];
    }
    if (keysArray.includes(PlayerOneBlock)) {
      firstFighterBlock = getBlockPower(firstFighter.defense);
    }
    if (keysArray.includes(PlayerTwoBlock)) {
      secondFighterBlock = getBlockPower(secondFighter.defense);
    }
    if (keysArray.includes(PlayerOneBlock) && keysArray.includes(PlayerTwoAttack)) {
      secondFighterHit = getHitPower(secondFighter.attack);
    }
    if (keysArray.includes(PlayerTwoBlock) && keysArray.includes(PlayerOneAttack)) {
      firstFighterHit = getHitPower(firstFighter.attack);
    }
    return [
      { firstFighterHit, secondFighterBlock },
      { secondFighterHit, firstFighterBlock },
    ];
  }

  if (keysArray.includes(PlayerOneAttack) || keysArray.includes(PlayerTwoAttack)) {
    if (keysArray.includes(PlayerOneAttack)) {
      firstFighterHit = getHitPower(firstFighter.attack);
    }
    if (keysArray.includes(PlayerTwoAttack)) {
      secondFighterHit = getHitPower(secondFighter.attack);
    }
    return [
      { firstFighterHit, secondFighterBlock },
      { secondFighterHit, firstFighterBlock },
    ];
  }

  return [
    { firstFighterHit, secondFighterBlock },
    { secondFighterHit, firstFighterBlock },
  ];
}

export function getDamage(attacker, defender) {
  const damage = getHitPower(attacker) - getBlockPower(defender);
  return damage <= 0 ? 0 : damage;
  // return damage
}

export function getHitPower(fighter) {
  const { attack } = fighter;
  const criticalHitChance = Math.random() + 1;
  const power = attack * criticalHitChance
  return power;
  // return hit power
}

export function getBlockPower(fighter) {
  const { defense } = fighter;
  const dodgeChance = Math.random() + 1;
  const power = defense * dodgeChance;
  return power;
  // return block power
}
