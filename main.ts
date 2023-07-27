const CANVAS = {w: 400, h: 400};
const CRadius = 175;
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
}

function drawCircle(x:number, y:number, r:number, fillStyle:string|null=null, strokeStyle:string|null=null, strokeWidth:number=2) {
	if (!context) return;
	context?.beginPath();
	context?.arc(x, y, r * R, 0, 2 * Math.PI);
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


class GAME {
	private active:boolean = false;
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
	static drawBigCircle() {
		drawCircle(canvas.width/2, canvas.height/2, CRadius + BRadius, null, 'white');
		drawCircle(canvas.width/2, canvas.height/2, CRadius - BRadius, null, 'white');
	}
}

class BALL {
	private radius = BRadius;
	public startDEG = 0;
	public speed = 0.1;
	public clockwise = true;
	public startTime = 0;
	constructor() {}
	static XOnCircleClockWise(rad:number) {
		return canvas.width/2 + Math.sin(rad) * CRadius * R;
	}
	static YOnCircleClockWise(rad:number) {
		return canvas.height/2 - Math.cos(rad) * CRadius * R;
	}
	startRotate() {
		this.startTime = performance.now();
	}
	draw(time:number) {
		const rad = (this.startDEG + (this.clockwise ? 1 : -1) * (time - this.startTime) * this.speed) * Math.PI / 180;
		drawCircle(BALL.XOnCircleClockWise(rad), BALL.YOnCircleClockWise(rad), this.radius, 'white');
	}
	reverseDir(time:number=performance.now()) {
		const rad = (this.startDEG + (this.clockwise ? 1 : -1) * (time - this.startTime) * this.speed) * Math.PI / 180;
		const x = BALL.XOnCircleClockWise(rad) - (canvas.width / 2);
		const y = BALL.YOnCircleClockWise(rad) - (canvas.height / 2);
		const r = Math.acos(-y/CRadius/R) * 180 / Math.PI;
		;this.startDEG = (x >= 0) ? r: 360 - r;
		this.startRotate();
		this.clockwise = !this.clockwise;
	}
}

let ball = new Array();
window.onload = function () {
	setCanvasSize();
	GAME.drawBigCircle();
	ball.push(new BALL());

	if (startBtn) startBtn.onclick = startGame;
	document.onkeydown = press;
}

function animate(time:number) {
	context?.clearRect(0, 0, canvas.width, canvas.height);
	GAME.drawBigCircle();
	for (let i = 0; i < ball.length; i++)
		ball[i].draw(time);
	requestAnimationFrame(animate);
}

function startGame() {
	startBtn?.classList.add('hide');
	for (let i = 0; i < ball.length; i++)
		ball[i].startRotate();
	animate(performance.now());
}

function press() {
	
}