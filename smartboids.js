class AutoBoid {
  constructor(x, y, gene, btype,parent1id,parent2id) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector(0, 0);

    this.maxSteerForce = 0.5;
    if (Array.isArray(gene)) {
      this.gene = [];
      for (let i = 0; i < gene.length; i++) {
        this.gene[i] = gene[i];
      }
    } else if (gene == undefined) {
      this.gene = [];
      this.gene[0] = float(nf(random(-1, 1), 0, 2)); //seek good food
      this.gene[1] = float(nf(random(-1, 1), 0, 2)); //seek bad food
      this.gene[2] = int(random(32, 128)); // good food radius
      this.gene[3] = int(random(32, 128)); //bad food radius
      this.gene[4] = int(random(32, 128)); //procreate radius
      //if(random(1)<0.5){this.gene[5]=int(random(2,4))}else{this.gene[5]=int(random(5,8))} //90% small 10% big
      this.gene[5] = int(random(2, 8)); //size
    } else {
      this.gene = gene;
    }
    if (btype == undefined) {
      this.btype = "random";
    } else {
      this.btype = btype;
    }
    //this.id = str(this.gene[0]) + ":" + str(this.gene[1]) + ":" + str(this.gene[2]) + ":" + str(this.gene[3]) + ":" + str(this.gene[4]) + ":" + str(this.gene[5]);

    this.id =
      "#" +
      this.gene
        .map((value) => {
          if (Number.isInteger(value)) {
            // Convert integers to hexadecimal format
            return value.toString(16).toUpperCase();
          } else {
            // Convert floating-point numbers to hexadecimal format
            return int(value * 255)
              .toString(16)
              .toUpperCase();
          }
        })
        .join(" : ") + " : " + this.btype;
    this.pid="";
    if(parent1id!=undefined&&parent2id!=undefined){
      this.pid+=" : "+parent1id+" : "+parent2id;
    }else{
      this.pid=" : "+"None"+" : "+"None";
    }
    this.goodFactor    = this.gene[0];
    this.badFactor     = this.gene[1];
    this.goodRadius    = this.gene[2];
    this.badRadius     = this.gene[3];
    this.partnerRadius = this.gene[4];
    this.r             = this.gene[5];

    this.m = this.r / 2;
    this.maxSpeed = map(this.r, 2, 8, 16, 2);

    this.minFoodRad = 16;
    this.maxFoodRad = 200;
    this.minPartnerRad = 32;
    this.maxPartnerRad = 200;

    this.avoidEdgeRadius = 64;
    this.lifeSpan = 1000//this.gene[5] * 100;
    //this.lifeCost=this.r;
    this.life = this.lifeSpan;
    this.mutationRate = 0.1;
  }
  //applyforce based on mass (this.m)
  applyForce(force) {
    let f = force.copy();
    if (this.m) {
      f = p5.Vector.div(force, this.m);
    }
    this.acc.add(f);
  }
  //update velocity and position
  update() {
    // if(this.life<0){
    //     addFood(this.pos.x,this.pos.y);
    //     //this.pos = createVector(random(buffer,width-buffer),random(buffer,height-buffer));
    //     //this.life = this.lifeSpan;
    // }

    if (this.life > this.lifeSpan) {
      this.life = this.lifeSpan;
    }

    let rand=createVector(random(-1,1),random(-1,1));
    rand.normalize();
    rand.mult(0.3);
    this.applyForce(rand);

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.vel.limit(this.maxSpeed);
    this.vel.mult(1-FRICTION);
    this.acc.mult(0);

    this.life -= 1;
  }
  //draw a triangle
  show() {
    let theta = this.vel.heading() + PI / 2;
    //lerp color based on life
    if (this.btype == "random") {
      let col = lerpColor(
        color(255, 0, 0),
        color(0, 255, 0),
        this.life / this.lifeSpan
      );
      fill(col);
      stroke(col);
    } else if (this.btype == "ideal") {
      let col = lerpColor(color(0), color(255), this.life / this.lifeSpan);
      fill(col);
      stroke(col);
    }
    push();
    translate(this.pos.x, this.pos.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
    if (debug) {
      this.drawDebugInfo();
    }
  }

  drawDebugInfo() {
    // Draw debug info
    let theta = this.vel.heading() + PI / 2;
    noFill();
    stroke(0, 255, 0, 100);
    ellipse(this.pos.x, this.pos.y, this.goodRadius * 2, this.goodRadius * 2);
    stroke(255, 0, 0, 100);
    ellipse(this.pos.x, this.pos.y, this.badRadius * 2, this.badRadius * 2);
    stroke(0, 0, 255, 100);
    ellipse(
      this.pos.x,
      this.pos.y,
      this.partnerRadius * 2,
      this.partnerRadius * 2
    );
    push();
    translate(this.pos.x, this.pos.y);
    rotate(theta);
    stroke(0, 255, 0);
    line(0, 0, 0, -this.goodFactor * 25);
    stroke(255, 0, 0);
    line(0, 0, 0, -this.badFactor * 25);

    pop();
  }

  avoidEdges() {
    let desired = null;
    if (this.pos.x < this.avoidEdgeRadius) {
      desired = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > width - this.avoidEdgeRadius) {
      desired = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < this.avoidEdgeRadius) {
      desired = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > height - this.avoidEdgeRadius) {
      desired = createVector(this.vel.x, -this.maxSpeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxSteerForce);
      this.applyForce(steer);
    }
  }

  seekFood(food) {
    let desired = p5.Vector.sub(food.pos, this.pos);
    let d = desired.mag();

    if (food.type == "good" && d < this.goodRadius) {
      // Calculate a steering force based on distance
      let scaleFactor = map(d, 0, this.goodRadius, 0.8, 0.08);
      scaleFactor *= this.goodFactor;
      desired.mult(scaleFactor);
      desired.limit(this.maxSteerForce);

      this.applyForce(desired);
    } else if (food.type == "bad" && d < this.badRadius) {
      // Calculate a steering force based on distance
      let scaleFactor = map(d, 0, this.badRadius, 0.8, 0.08);
      scaleFactor *= this.badFactor;
      desired.mult(scaleFactor);
      desired.limit(this.maxSteerForce);

      this.applyForce(desired);
    }
  }

  steerTowards(desired, factor) {
    desired.normalize();
    desired.mult(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxSteerForce);
    steer.mult(factor);
    this.applyForce(steer);
  }

  eat(food) {
    return p5.Vector.dist(this.pos, food.pos) < (food.r*2)+10//this.r
  }

  clone() {
    let childGene = [];
    for (let i = 0; i < this.gene.length; i++) {
      childGene[i] = this.gene[i];
    }
    return new AutoBoid(this.pos.x, this.pos.y, childGene, this.btype);
  }

  mutate() {
    let mutationRate = this.mutationRate;

    if (random(1) < mutationRate){
      this.gene[0] = limitThis(
        this.gene[0] + float(nf(random(-1, 1), 0, 2)),
        -1,
        1
      );
      console.log("mutated good factor gene[0] : " + this.gene[0]);
    }
    if (random(1) < mutationRate){
      this.gene[1] = limitThis(
        this.gene[1] + float(nf(random(-1, 1), 0, 2)),
        -1,
        1
      );
        console.log("mutated bad factor gene[1] : " + this.gene[1]);
      }
    if (random(1) < mutationRate){
      this.gene[2] = limitThis(
        this.gene[2] + int(random(-100, 100)),
        this.minFoodRad,
        this.maxFoodRad
      );
        console.log("mutated good radius gene[2] : " + this.gene[2]);
      }

    if (random(1) < mutationRate){
      this.gene[3] = limitThis(
        this.gene[3] + int(random(-100, 100)),
        this.minFoodRad,
        this.maxFoodRad
      );
        console.log("mutated bad radius gene[3] : " + this.gene[3]);
      }
    if (random(1) < mutationRate){
      this.gene[4] = limitThis(
        this.gene[4] + int(random(-100, 100)),
        this.minPartnerRad,
        this.maxPartnerRad
      );
        console.log("mutated partner radius gene[4] : " + this.gene[4]);
      }
    if (random(1) < mutationRate){
      this.gene[5] = limitThis(this.gene[5] + int(random(-5, 5)), 2, 8);
        console.log("mutated size gene[5] : " + this.gene[5]);
    }
  }

  //   mutate() {
  //     let mutationRate = this.mutationRate;
  //     for (let i = 0; i < this.gene.length; i++) {
  //       if (random(1) < mutationRate) {
  //         if (i % 2 == 0) {
  //           this.gene[i] = limitThis(
  //             this.gene[i] + float(nf(random(-1, 1), 0, 2)),
  //             -1,
  //             1
  //           );
  //         } else {
  //           this.gene[i] = limitThis(
  //             this.gene[i] + int(random(10, 100)),
  //             this.minFoodRad,
  //             this.maxFoodRad
  //           );
  //         }
  //       }
  //     }
  //   }

  crossover(partner) {
    let childGene = [];
    let mid = int(random(this.gene.length));
    let childbtype = this.btype;
    //if(partner.btype=="ideal"){childbtype="ideal"}

    for (let i = 0; i < this.gene.length; i++) {
      if (i > mid) {
        childGene[i] = this.gene[i];
      } else {
        childGene[i] = partner.gene[i];
      }
    }
    console.log("in cross over parent 1 Gene : " + this.gene);
    console.log("in cross over parent 2 Gene : " + partner.gene);
    console.log("in cross over child Gene    : " + childGene);
    //console.log("%cchild pid is      : " + this.pid,color)
    //console.log("child btype is      : " + childbtype);
    let child = new AutoBoid(this.pos.x, this.pos.y, childGene, childbtype,this.id,partner.id);
    console.log("child pid is : " + child.pid)
    //child.vel.setMag(child.maxSpeed);
    return child;
  }
  procreate(partner) {
    //console.log(partner)
    let d = p5.Vector.dist(this.pos, partner.pos);
    if (d < this.partnerRadius && !((this.btype=="ideal")&&(partner.btype=="ideal"))) {
      let child = this.crossover(partner);
      child.mutate();
      console.log("after mutation child Gene   : " + child.gene);
      console.log("-------------------------------------------------------")
      return child;
    } else {
      return null;
    }
  }
}
