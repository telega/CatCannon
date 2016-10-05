//Sketch Variables
var cannon, cat, gravity, cannonOffset, textColor, tweetMessage;
var cats = [];
var removes = []; // track which offscreen cats to remove
var smokeRemoves = [];
var puffs = [];
// socket
var socket = io();

function preload(){
	cannonImage = loadImage('img/cannon.png');
	catImage = loadImage('img/cat.png')
	smokeImage = loadImage('img/smoke.png')
}
function Smoke(location){
	var l = location.copy();
	var opacity = 255;

	this.display = function(){
		tint(255,opacity);
		image(smokeImage,l.x-84,l.y);
		tint(255,255);
		opacity -= 10;
	}

	this.getOpacity = function(){
		return opacity;
	}
}
 
function Cat(blast){

	var location = cannon.getLocation().add(cannonOffset);
	var velocity = createVector(0,0);
	var acceleration = createVector(0,0);
	var angle = 0;
	var aVelocity = 0;
	var aAcceleration = 0;
	var remove = false;
	
	this.update = function(){
		velocity.add(acceleration);
		location.add(velocity);

		aAcceleration = acceleration.y/300;
		aVelocity += aAcceleration;
		angle += aVelocity;

		acceleration.mult(0);
		this.checkBounds();
		this.applyForce(gravity);
	};

	this.getRemove = function(){
		return remove;
	}

	this.checkBounds = function(){
		if (location.x > width) {
			smoke = new Smoke(location);
			puffs.push(smoke);
			location.x = width;
			velocity.x *= -1;
		}
		if (location.y > height) {
			remove = true;
		}
	};

	this.applyForce = function(force){
		acceleration.add(force);
	};

	this.display = function(){
		push();
		translate(location.x,location.y)
		rotate(angle);
		imageMode(CENTER);
		image(catImage,0,0)
		pop();
	};

	this.applyForce(blast);
}

function Cannon(){

	this.setLocation = function(){
		var x = width/6;
		var y = 2 * (height / 3)
		return createVector(x,y);
	}
	
	var location = this.setLocation();

	this.getLocation = function(){
		return location;
	}

	var smokeOpacity = 0;
	var smokeLocation = this.getLocation().add(cannonOffset);
 
	this.display = function(){
		location = this.setLocation();
		image(cannonImage,location.x,location.y);
		imageMode(CENTER);
		tint(255,smokeOpacity);
		image(smokeImage,smokeLocation.x,smokeLocation.y);  
		imageMode(CORNER);
		tint(255,255);
		smokeOpacity-=10;
	};

	this.updateLocation = function(){
		location = this.setLocation();
		smokeLocation = this.getLocation().add(cannonOffset);
	}

	this.fire = function(message){
		cat = new Cat(createVector(random(10,20),random(-4,-2)));
		cats.push(cat);
		smokeOpacity = 255;
		noStroke();
		fill(255);
		rect(0,0,width,200);
		textColor = 0;
		tweetMessage = message;
	};

}

function formatMessage(st){
  if (50 < st.length){
   var bp = st.indexOf(' ', 50);
   if(bp!= -1){
   	return newstr =  st.slice(0,bp) + '\n' +	formatMessage(st.slice(bp+1));
	}
	else{
		return st
	}	   	
  }
  else{ 
  	return st;
  }
}

function displayMessage(){
	fill(textColor);
	text(tweetMessage,width/4,100);
}

function setup() {
	canvas = createCanvas(windowWidth,windowHeight);
	canvas.parent('myCanvas');
	cannonOffset = createVector(300,14);
	background(255);
	textSize(20);
	cannon = new Cannon();
	cannon.setLocation();
	gravity = createVector(0,0.2);
	tweet = '';
	typing = false;
	textColor = 0;
	tweetMessage = '';
	//socket
	socket.on('fire', function(message){
		cannon.fire(formatMessage(message));
	});

}

function draw() {
	fill(255)
	noStroke();
	rect(0,0,width,height);
	cannon.display();
	for (cat in cats){
		cats[cat].display();
		cats[cat].update();
		cats[cat].checkBounds();
		if(cats[cat].getRemove() === true){
			removes.push(cats.indexOf(cat));
		}
	}
	for (r in removes){
		cats.splice(r,1);
	}
	for (smoke in puffs){
		puffs[smoke].display();
		if (smoke.getOpacity <= 0){
			smokeRemoves.push(puffs.indexOf(smoke));
		}
	}

	for (r in smokeRemoves){
		puffs.splice(r,1);
	}
	
	removes = [];
	smokeRemoves = [];
	displayMessage();

	if(textColor != 255){
		textColor++;
	}

}

function windowResized() {
	resizeCanvas(window.innerWidth,window.innerHeight);
	cannon.updateLocation();
}



