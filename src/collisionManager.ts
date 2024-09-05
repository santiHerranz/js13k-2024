import { gameState } from "@/game-states/game.state";
import { GameObject } from "./game-object";

export const manageUnitsCollision = (units: GameObject[], dt: number) => {

  units.forEach((unit: GameObject) => {

    // Check collisions with other units
    // Retrieve all objects that share nodes with the unit
    const candidates = gameState.collisionTree.retrieve(unit);

    candidates
      .forEach((other: any) => {
        if (other === unit) return;

        var collision = checkCollision(unit, other);
        if (collision.a) {
          adjustPositions(unit, other, collision.b);
          resolveCollision(
            unit,
            other
          );
        }
      });
  });
};


// https://codepen.io/ztyler/pen/LergVR

function checkCollision(unit: GameObject, other: GameObject) {
  var rSum = unit.Radius + other.Radius;
  var dx = other.Position.x - unit.Position.x;
  var dy = other.Position.y - unit.Position.y;
  return {
    a: rSum * rSum > dx * dx + dy * dy,
    b: rSum - Math.sqrt(dx * dx + dy * dy)
  };
}

function adjustPositions(unit: GameObject, other: GameObject, depth: number) {
  const percent = 0.99;
  const slop = 0.9;
  var correction = (Math.max(depth - slop, 0) / (1 / unit.Radius + 1 / other.Radius)) * percent;

  var norm = [other.Position.x - unit.Position.x, other.Position.y - unit.Position.y];
  var mag = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1]);
  norm = [norm[0] / mag, norm[1] / mag];
  let correctionList = [correction * norm[0], correction * norm[1]];
  unit.Position.x -= 1 / unit.Radius * correctionList[0];
  unit.Position.y -= 1 / unit.Radius * correctionList[1];
  other.Position.x += 1 / other.Radius * correctionList[0];
  other.Position.y += 1 / other.Radius * correctionList[1];
}


function resolveCollision(unit: GameObject, other: GameObject) {
  var relVel = [other.Velocity.x - unit.Velocity.x, other.Velocity.y - unit.Velocity.y];
  var norm = [other.Position.x - unit.Position.x, other.Position.y - unit.Position.y];
  var mag = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1]);
  norm = [norm[0] / mag, norm[1] / mag];

  var velAlongNorm = relVel[0] * norm[0] + relVel[1] * norm[1];
  if (velAlongNorm > 0)
    return;

  var bounce = .99;
  var j = -(1 + bounce) * velAlongNorm;
  j /= 1 / unit.Radius + 1 / other.Radius;

  var impulse = [j * norm[0], j * norm[1]];
  unit.Velocity.x -= 1 / unit.Radius * impulse[0];
  unit.Velocity.y -= 1 / unit.Radius * impulse[1];
  other.Velocity.x += 1 / other.Radius * impulse[0];
  other.Velocity.y += 1 / other.Radius * impulse[1];

}


