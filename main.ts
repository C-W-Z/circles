const CANVAS = {w: 400, h: 400};
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
}

function drawBigCircle() {
	drawCircle(canvas.width/2, canvas.height/2, 160, null, 'white');
	drawCircle(canvas.width/2, canvas.height/2, 140, null, 'white');
}

window.onload = function () {
	setCanvasSize();
	drawBigCircle();

	if (startBtn) startBtn.onclick = function (e) {
	
	}

	document.onkeydown = function (e) {

	};
}