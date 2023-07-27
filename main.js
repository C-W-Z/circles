const CANVAS = {w: 400, h: 400};
const R = window.devicePixelRatio;
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
document.onkeydown = function (e) {

};

window.onload = function () {
	setCanvasSize();
	drawCircle(canvas.width/2, canvas.height/2, 160, null, 'white', 2);
	drawCircle(canvas.width/2, canvas.height/2, 140, null, 'white', 2);
}

function setCanvasSize() {
	canvas.width = CANVAS.w * R;
	canvas.height = CANVAS.h * R;
	canvas.style.width = CANVAS.w + 'px';
	canvas.style.height = CANVAS.h + 'px';
}

const radius = 350;
function drawCircle(x, y, r, fillStyle=null, strokeStyle=null, strokeWidth=2) {
	context.beginPath();
	context.arc(x, y, r * R, 0, 2 * Math.PI);
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