class Food{

    constructor(x,y,type){
        this.pos = createVector(x,y);
        this.r = 3;
        this.type = type;

    }

    show(){
        if(this.type == "good"){
            stroke(0,255,0)
            fill(0,255,0);
        }
        else if(this.type == "bad"){
            stroke(255,0,0);
            fill(255,0,0);
        }
        ellipse(this.pos.x,this.pos.y,this.r*2,this.r*2);
    }
}