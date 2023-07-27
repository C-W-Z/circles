const CANVAS = {w: 400, h: 400};
const CRadius = [175, 155, 135];
const BRadius = 10;
const R = window.devicePixelRatio;
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const scoreTxt = document.getElementById('current-score');
const highestTxt = document.getElementById('highest-score');

function setCanvasSize() {
	canvas.width = CANVAS.w * R;
	canvas.height = CANVAS.h * R;
	canvas.style.width = CANVAS.w + 'px';
	canvas.style.height = CANVAS.h + 'px';
	context?.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
}

function drawCircle(x:number, y:number, r:number, fillStyle:string|null=null, strokeStyle:string|null=null, strokeWidth:number=2) {
	if (!context) return;
	context?.beginPath();
	context?.arc(x * R, y * R, r * R, 0, 2 * Math.PI);
	if (fillStyle) {
		context.fillStyle = fillStyle;
		context.fill();
	}
	if (strokeStyle) {
		context.lineWidth = strokeWidth;
		context.strokeStyle = strokeStyle;
		context.stroke();
	}
}


class Game {
	public active:boolean = false;
	public score:number = 0;
	public highest:number = 0;
	constructor() {}
	reset() {
		this.active = false;
		this.score = 0;
	}
	start() {
		this.active = true;
	}
	getScore() {
		this.score += 1;
		if (scoreTxt) scoreTxt.innerText = String(this.score);
	}
}

class Circle {
	public radius:number;
	public ball:Ball[] = new Array();
	constructor(radius:number) {
		this.radius = radius;
	}
	draw() {
		drawCircle(0, 0, this.radius + BRadius, null, 'white');
		drawCircle(0, 0, this.radius - BRadius, null, 'white');
	}
	static clockWiseX(radius:number, rad:number) {
		return Math.sin(rad) * radius;
	}
	static clockWiseY(radius:number, rad:number) {
		return -Math.cos(rad) * radius;
	}
}

class Line {
	public radius:number;
	public degree:number;
	constructor(radius:number, degree:number) {
		this.radius = radius;
		this.degree = degree;
	}
	draw() {
		if (!context) return;
		context.beginPath();
		context.rotate((this.degree - 90) * Math.PI / 180);
		const w = BRadius * R, h = BRadius * 2 * R;
		context.rect(this.radius * R - h/2, -w/2, h, w);
		context.fillStyle = 'white';
		context.fill();
		context.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
	}
}

class Ball {
	public outRadius:number;
	public startDEG = 0;
	public speed = 0.1;
	public clockwise = true;
	public startTime = 0;
	constructor(radius:number, startDeg:number, speed:number, cloclwise:boolean) {
		this.outRadius = radius;
		this.startDEG = startDeg;
		this.speed = speed;
		this.clockwise = cloclwise;
	}
	startRotate() {
		this.startTime = performance.now();
	}
	draw(time:number) {
		const rad = (this.startDEG + (this.clockwise ? 1 : -1) * (time - this.startTime) * this.speed) * Math.PI / 180;
		drawCircle(Circle.clockWiseX(this.outRadius, rad), Circle.clockWiseY(this.outRadius, rad), BRadius, 'white');
	}
	reverseDir(time:number=performance.now()) {
		const rad = (this.startDEG + (this.clockwise ? 1 : -1) * (time - this.startTime) * this.speed) * Math.PI / 180;
		const x = Circle.clockWiseX(this.outRadius, rad);
		const y = Circle.clockWiseY(this.outRadius, rad);
		const r = Math.acos(-y/this.outRadius) * 180 / Math.PI;
		;this.startDEG = (x >= 0) ? r: 360 - r;
		this.startRotate();
		this.clockwise = !this.clockwise;
	}
}

const game = new Game();
const circle = new Array();
const line = new Array();
const ball = new Array();
window.onload = function () {
	setCanvasSize();
	circle.push(new Circle(CRadius[0]));
	line.push(new Line(CRadius[0], 0));
	ball.push(new Ball(CRadius[0], Math.random() * 360, 0.2, true));
	circle.push(new Circle(CRadius[1]));
	ball.push(new Ball(CRadius[1], Math.random() * 360, 0.15, false));
	circle.push(new Circle(CRadius[2]));
	ball.push(new Ball(CRadius[2], Math.random() * 360, 0.1, true));
	for (let i = 0; i < circle.length; i++)
		circle[i].draw();

	if (startBtn) startBtn.onclick = startGame;
	document.onkeydown = press;

	animate(performance.now());
}

function animate(time:number) {
	if (game.active) {
		context?.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
		for (let i = 0; i < circle.length; i++)
			circle[i].draw();
		for (let i = 0; i < line.length; i++)
			line[i].draw();
		for (let i = 0; i < ball.length; i++)
			ball[i].draw(time);
	}
	requestAnimationFrame(animate);
}

function startGame() {
	startBtn?.classList.add('hide');
	for (let i = 0; i < ball.length; i++)
		ball[i].startRotate();
	game.start();
}

function press() {
	
}