const CANVAS = {w: 400, h: 400};
const CRadius = [175, 155, 135];
const BRadius:number = 10;
const LWidth:number = 10;
const MinBBGap:number = 9; // deg
const MinBLGap:number = 60;  // deg
const R:number = window.devicePixelRatio;
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const scoreTxt = document.getElementById('current-score');
const highestTxt = document.getElementById('highest-score');

const circle:Circle[] = new Array();
const fadedBall:Ball[] = new Array();
const fadeTime = 500; // ms

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

/* Detect Circle-Circle Collision */
function circleCirlceCollision(x1:number, y1:number, r1:number, x2:number, y2:number, r2:number) {
	return ((r1 + r2 + 2) ** 2 > (x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function removeItem<T>(arr: Array<T>, value: T): Array<T> {
	const index = arr.indexOf(value);
	if (index >= 0)
		arr.splice(index, 1);
	return arr;
}

function randRange(min:number, max:number) {
	return Math.random() * (max - min + 1) + min;
}

class Game {
	static active = false;
	static score = 0;
	static highest = 0;
	static pressed = false;
	constructor() {}
	static start() {
		this.score = 0;
		this.active = true;
		startBtn?.classList.add('hide');
		while (circle.length > 0)
			circle.pop();
		circle.push(new Circle(CRadius[0]));
		circle[0].createLine(0);
		circle[0].spawnBalls();
	}
	static end() {
		this.active = false;
		startBtn?.classList.remove('hide');
	}
	static getScore() {
		this.score += 1;
		if (scoreTxt) {
			scoreTxt.innerText = String(this.score);
			if (this.score > this.highest) {
				this.highest = this.score;
				if (highestTxt)
					highestTxt.innerText = String(this.highest);
			}
		}
	}
}

class Circle {
	public radius:number;
	public line:Line[] = new Array();
	public ball:Ball[] = new Array();
	private clockwise = Boolean(Math.floor(Math.random() * 2));
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
	createLine(degree:number) {
		this.line.push(new Line(this.radius, degree));
	}
	spawnBalls() {
		this.clockwise = !this.clockwise;
		const speed = 0.125;
		const num = Math.floor(randRange(1, 3));
		let degs = new Array();
		if (this.line.length == 1)
			for (let i = 0; i < num; i++) {
				let degree = 0;
				rollLoop: while (true) {
					degree = randRange(MinBBGap/2, 360-MinBBGap/2);
					if (degree < this.line[0].degree + MinBLGap || degree > this.line[0].degree + 360 - MinBLGap)
						continue rollLoop;
					for (let d = 0; d < degs.length; d++)
						if (degree + MinBBGap > degs[d] && degree - MinBBGap < degs[d])
								continue rollLoop;
					break rollLoop;
				}
				degs.push(degree);
				this.ball.push(new Ball(this.radius, degree, speed, this.clockwise));
			}
	}
	detectLineBallCollide() {
		if (this.ball.length == 0) {
			this.spawnBalls();
			return;
		}
		let hasCollide = false;
		for (const l of this.line)
			for (const b of this.ball) {
				if (circleCirlceCollision(l.x, l.y, LWidth / 2, b.x, b.y, BRadius)) {
					b.collideLine.now = true;
					hasCollide = true;
					if (Game.pressed) {
						Game.getScore();
						b.startFade();
						this.ball = removeItem(this.ball, b);
					}
				} else {
					b.collideLine.now = false;
				}
				if (b.collideLine.last && !b.collideLine.now) {
					/* end game */
					Game.end();
				}
				b.collideLine.last = b.collideLine.now;
			}
		if (Game.pressed) {
			if (hasCollide)
				Game.pressed = false;
			else
				Game.end();
		}
	}
	detectBallBallCollide() {
		for (const a of this.ball)
			for (const b of this.ball)
				if (circleCirlceCollision(a.x, a.y, BRadius, b.x, b.y, BRadius)) {
					a.reverseDir();
					b.reverseDir();
				}
	}
}

class Line {
	public radius:number;
	public degree:number;
	public x:number;
	public y:number;
	constructor(radius:number, degree:number) {
		this.radius = radius;
		this.degree = degree;
		this.x = Circle.clockWiseX(radius, degree * Math.PI / 180);
		this.y = Circle.clockWiseY(radius, degree * Math.PI / 180);
	}
	draw() {
		if (!context) return;
		context.beginPath();
		context.rotate((this.degree - 90) * Math.PI / 180);
		const w = LWidth * R, h = BRadius * 2 * R;
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
	private startTime = 0;
	public x = 0;
	public y = 0;
	public collideLine = {now:false, last:false};
	constructor(outRadius:number, startDeg:number, speed:number, cloclwise:boolean) {
		this.outRadius = outRadius;
		this.startDEG = startDeg;
		this.speed = speed;
		this.clockwise = cloclwise;
		this.startTime = performance.now();
		this.updateXY(this.startTime);
	}
	restartRotate() {
		this.startTime = performance.now();
	}
	updateXY(time:number) {
		const rad = (this.startDEG + (this.clockwise ? 1 : -1) * (time - this.startTime) * this.speed) * Math.PI / 180;
		this.x = Circle.clockWiseX(this.outRadius, rad);
		this.y = Circle.clockWiseY(this.outRadius, rad);
	}
	draw(time:number) {
		this.updateXY(time);
		drawCircle(this.x, this.y, BRadius, 'white');
	}
	reverseDir(time:number=performance.now()) {
		const rad = (this.startDEG + (this.clockwise ? 1 : -1) * (time - this.startTime) * this.speed) * Math.PI / 180;
		const x = Circle.clockWiseX(this.outRadius, rad);
		const y = Circle.clockWiseY(this.outRadius, rad);
		const r = Math.acos(-y/this.outRadius) * 180 / Math.PI;
		;this.startDEG = (x >= 0) ? r: 360 - r;
		this.restartRotate();
		this.clockwise = !this.clockwise;
	}

	fade(time:number) {
		const delta = (time - this.startTime) / fadeTime;
		if (delta >= 1)
			removeItem(fadedBall, this);
		else
			drawCircle(this.x, this.y, BRadius * (1 + delta), `rgba(255,255,255,${1 - delta})`);
	}
	startFade() {
		fadedBall.push(this);
		this.startTime = performance.now();
	}
}

window.onload = function () {
	setCanvasSize();
	circle.push(new Circle(CRadius[0]));
	circle[0].createLine(0);
	for (const c of circle) {
		c.draw();
		for (const l of c.line) l.draw();
	}

	if (startBtn) startBtn.onclick = () => Game.start();
	document.onkeydown = () => {Game.pressed = true;};
	document.onmousedown = () => {Game.pressed = true;};
	document.onkeyup = () => {Game.pressed = false;};
	document.onmouseup = () => {Game.pressed = false;};

	animate(performance.now());
}

function animate(time:number) {
	if (Game.active) {
		context?.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
		for (const c of circle) {
			c.draw();
			c.detectBallBallCollide();
			c.detectLineBallCollide();
			for (const l of c.line) l.draw();
			for (const b of c.ball) b.draw(time);
		}
		for (const b of fadedBall)
			b.fade(time);
	}
	requestAnimationFrame(animate);
}