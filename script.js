let flock = [];
let debug = true;
let foods = {
  good: [],
  bad: [],
};
let buffer = 0;
const POPULATION = 200;
const reproductionChance = 0.001;
const FOODBUFF = 200;
const POISONNERF=-400
const FRICTION = 0.00;
let r;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  //let idealGene = [0.5, 150, -1, 20, 150, 4];
  flock.push(new AutoBoid(width / 2, height / 2, [1, -0.5, 128 , 32, 150, 8],"ideal"));
  for (let i = 0; i < POPULATION; i++) {
    flock.push(
      new AutoBoid(
        random(buffer, width - buffer),
        random(buffer, height - buffer)
      )
    );
  }
  for (let j = 0; j < 2 * POPULATION; j++) {
    foods.good.push(
      new Food(
        random(buffer, width - buffer),
        random(buffer, height - buffer),
        "good"
      )
    );
  }

  for (let j = 0; j < POPULATION; j++) {
    foods.bad.push(
      new Food(
        random(buffer, width - buffer),
        random(buffer, height - buffer),
        "bad"
      )
    );
  }
}

function draw() {
  background(0);
  for (let boid of flock) {
    if (boid.life < 0) {
      addFood(boid.pos.x, boid.pos.y);
      let index = flock.indexOf(boid);
      flock.splice(index, 1);
    } else {
      r = random(1);
      boid.avoidEdges();
      boid.update();
      boid.show();

      // Find the closest food
      let closestFood = null;
      let closestFoodDistance = Infinity;

      for (let type in foods) {
        for (let food of foods[type]) {
          let d = p5.Vector.dist(boid.pos, food.pos);

          if (d < closestFoodDistance) {
            closestFoodDistance = d;
            closestFood = food;
          }
        }
      }

      if (closestFood !== null) {
        boid.seekFood(closestFood);
        if (boid.eat(closestFood)) {
          boid.life += closestFood.type === "good" ? FOODBUFF : POISONNERF;
          let index = foods[closestFood.type].indexOf(closestFood);
          foods[closestFood.type].splice(index, 1);
        }
      }
    }
    for (let j = 0; j < flock.length; j++) {
      //if(flock.length<POPULATION/2&&boid != flock[j] && r<reproductionChance && boid.life>boid.lifeSpan/2 && flock[j].life>flock[j].lifeSpan/2){
      if (
        flock.length < POPULATION &&
        boid != flock[j] &&
        r < reproductionChance &&
        boid.life > boid.lifeSpan * 0.9 &&
        flock[j].life > flock[j].lifeSpan * 0.9
      ) {
        let child = boid.procreate(flock[j]);
        if (child) {
          //console.log("boid born with gene : " + child.gene);
          flock.push(child);
          break;
        }
      }
    }
  }

  if (foods.good.length < POPULATION) {
    foods.good.push(
      new Food(
        random(buffer, width - buffer),
        random(buffer, height - buffer),
        "good"
      )
    );
  }
  if (foods.bad.length < POPULATION /5) {
    foods.bad.push(
      new Food(
        random(buffer, width - buffer),
        random(buffer, height - buffer),
        "bad"
      )
    );
  }

  for (let type in foods) {
    for (let food of foods[type]) {
      food.show();
    }
  }
  if(flock.length<=1){
    flock.push(new AutoBoid(width / 2, height / 2));
    let clone=flock[1].clone();
    clone.mutate();
    flock.push(clone);
  }


}

function addFood(x, y) {
  if (random(1) < 1) {
    foods.good.push(new Food(x, y, "good"));
  } else {
    foods.bad.push(new Food(x, y, "bad"));
  }
}

function limitThis(x, min, max) {
  if (x <= min) {
    return min;
  }
  if (x > max) {
    return max;
  }
  return x;
}
