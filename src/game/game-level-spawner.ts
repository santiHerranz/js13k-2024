// let message = '5a|5b|10c|1C';
// let message = '1a3|1a|1a|1a|1a|1a|1a|1a||1b|1b|1b|1b|1b|1b|1b||1c|1c|1c|1c|1c|1c|1c|1c||2C';
let enemyData = '1a3||||||1C1';

type SPAWN_POSITION = 9 | 10 | 11 | 12 | 13 | 14 | 15

const SPAWN_POSITION_9: SPAWN_POSITION = 9;
const SPAWN_POSITION_10: SPAWN_POSITION = 10;
const SPAWN_POSITION_11: SPAWN_POSITION = 11;
const SPAWN_POSITION_12: SPAWN_POSITION = 12;
const SPAWN_POSITION_13: SPAWN_POSITION = 13;
const SPAWN_POSITION_14: SPAWN_POSITION = 14;
const SPAWN_POSITION_15: SPAWN_POSITION = 15;


type WEAPON_TYPE = 'singleStraight'
const WEAPON_TYPE_ONE: WEAPON_TYPE = 'singleStraight';


const sizeS = { size: { r: 10 } };
const sizeM = { size: { r: 20 } };
const sizeL = { size: { r: 30 } };

const singleStraight = { type: WEAPON_TYPE_ONE, dp: 100 };
const singleStraightSlow = { ...singleStraight, cooldown: .2 };
const singleStraightFast = { ...singleStraight, cooldown: .05 };
const singleStraightLittle = { ...singleStraightFast, dp: 10 };
const singleStraightHeavy = { ...singleStraightSlow, dp: 500 };

const pathOne = { start: { x: 100, y: 100 }, path: [{ x: 200, y: 100 }, { x: 100, y: 100 }] };
const pathTwo = { start: { x: 800, y: 100 }, path: [{ x: 200, y: 600 }, { x: 200, y: 100 }] };

const getEnemy = (type: string) => {
    switch (type) {
        case 'a': return { name: 'Alpha', size: sizeM, weapon: { ...singleStraightSlow }, path: pathOne };
        case 'b': return { name: 'Beta', size: sizeM, weapon: { ...singleStraightFast }, path: pathOne };
        case 'c': return { name: 'Charly', size: sizeM, weapon: { ...singleStraightLittle }, path: pathOne };
        case 'C': return { name: 'Big Charly', size: sizeL, weapon: { ...singleStraightHeavy }, path: pathTwo };
        default: return null;
    }
};

const getPosition = (angle: number) => {
    return { x: Math.sin(angle), y: Math.cos(angle) };
};

enemyData.split('|').forEach(m => {

    let d = m.split('');
    if (d.length > 1) {

        let count = parseInt(d[0]);
        let enemy = getEnemy(d[1]);
        let position = getPosition(parseInt(d[2])); 

        if (enemy && position) {
            console.log(count + ' ' + enemy.name  + ' at position ' + JSON.stringify(position));

            for (let index = 0; index < count; index++) {
                console.log('\t' + (1 + index) + '. ' + enemy.name + ' with ' + enemy.weapon.type + ' cooldown:' + enemy.weapon.cooldown + ' dp:' + enemy.weapon.dp);
                console.log('\t\tSize: ' + JSON.stringify(enemy.size));
                console.log('\t\tPath: ' + JSON.stringify(enemy.path));
            }
        }
    } else {
        console.log('wait ' + 1 + ' second');
    }
});
