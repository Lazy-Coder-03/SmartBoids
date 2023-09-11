class Boid {
  constructor(x, y, r, m, gene) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector(0, 0);
    this.r = r;
    this.m = m;

    this.gene = gene;
    this.maxSpeed = 5;
    this.maxSteerForce = 0.1;
    this.seekingFactor = 1;
    this.seekingRadius = 100;
    this.maxAvoidingForce = 0.5;
    this.avoidingFactor = 1;
    this.avoidRadius = 50;
    //this.steer = createVector(0, 0);
  }

  applyForce(force) {
    // Apply force divided by mass
    let f = p5.Vector.div(force, this.m);
    this.acc.add(f);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show() {
    //make a triangle and heading is same as velocity
    let theta = this.vel.heading() + PI / 2;
    fill(255);
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }

  

  seekTarget(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();

    // Calculate a scaling factor based on distance (quadratic falloff)
    let scaleFactor = map(d, 0, this.seekingRadius, 1, 0.1); // Adjust the range as needed

    desired.setMag(this.maxSpeed * scaleFactor);
    if (d < this.seekingRadius) {
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxSteerForce);
      this.applyForce(steer);
    }
  }

  avoidObstacle(obstacle) {
    let desired = p5.Vector.sub(this.pos, obstacle);
    let d = desired.mag();

    // Calculate a scaling factor based on distance (quadratic falloff)
    let scaleFactor = map(d, 0, this.avoidRadius, 0.1, 1); // Adjust the range as needed

    desired.setMag(this.maxSpeed * scaleFactor);

    if (d < this.avoidRadius) {
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxAvoidingForce);
      this.applyForce(steer);
    }
  }

  avoidObstacles(obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
      this.avoidObstacle(obstacles[i]);
    }
  }

  avoidEdge() {
    let desired = null;
    let edgeBuffer = 50; // Adjust this value to control how close to the edge the Boid slows down

    if (this.pos.x < this.r + edgeBuffer) {
      desired = createVector(this.maxSpeed * 0.5, this.vel.y);
    } else if (this.pos.x > width - this.r - edgeBuffer) {
      desired = createVector(-this.maxSpeed * 0.5, this.vel.y);
    }

    if (this.pos.y < this.r + edgeBuffer) {
      desired = createVector(this.vel.x, this.maxSpeed * 0.5);
    } else if (this.pos.y > height - this.r - edgeBuffer) {
      desired = createVector(this.vel.x, -this.maxSpeed * 0.5);
    }

    if (desired) {
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxSteerForce);
      this.applyForce(steer);
    }
  }

  drawDebugInfo() {
    if (debug) {
      // Draw a line showing velocity
      push();
      stroke(255, 0, 0);
      line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.vel.x * 10,
        this.pos.y + this.vel.y * 10
      );

      // Draw a line showing acceleration
      stroke(0, 255, 0);
      line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.acc.x * 100,
        this.pos.y + this.acc.y * 100
      );

      // Draw a line showing steering force


      // Draw a circle showing seeking radius
      noFill();
      stroke(0, 255, 0,100);
      ellipse(this.pos.x, this.pos.y, this.seekingRadius * 2);

      // Draw a circle showing avoiding radius
      stroke(255, 0, 0,100);
      ellipse(this.pos.x, this.pos.y, this.avoidRadius * 2);

      pop();

    }
  }
}
