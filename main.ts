/**
 * CIRCLES
 * repo: https://github.com/C-W-Z/circles
 * copyright (c) 2023 C-W-Z
 * CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)
 */
const CANVAS_SIZE = 400;
const CRadius = [175, 155, 135, 115, 95, 75, 55, 35, 15];
const BRadius:number = 10;
const LWidth:number = 10;
const MinBBGap:number = 9; // deg
const MinBLGap:number = 45;  // deg
const R:number = window.devicePixelRatio;
const canvasBack = <HTMLCanvasElement>document.getElementById('canvas-back');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const canvasFront = <HTMLCanvasElement>document.getElementById('canvas-front');
const contextBack = canvasBack.getContext('2d');
const context = canvas.getContext('2d');
const contextFront = canvasFront.getContext('2d');
const expTxt = document.getElementById('explain');
const startBtns = document.getElementById('btns');
const startBtn = {
    easy: document.getElementById('easy-btn'),
    normal: document.getElementById('normal-btn'),
    hard: document.getElementById('hard-btn'),
    insane: document.getElementById('insane-btn'),
}
const scoreTxt = document.getElementById('current-score');
const highestTxt = document.getElementById('highest-score');

let circle:Circle[] = new Array();
const collideBall:Ball[] = new Array();
const fadingBall:Ball[] = new Array();
const fadeTime = 400; // ms

let auto = false;

function setCanvasSize() {
    canvasFront.width = canvasBack.width = canvas.width = CANVAS_SIZE * R;
    canvasFront.height = canvasBack.height = canvas.height = CANVAS_SIZE * R;
    context?.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
    contextBack?.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
    contextFront?.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
}

function drawCirclePath(ctx:CanvasRenderingContext2D|null, x:number, y:number, r:number) {
    if (!ctx) return;
    ctx.moveTo(x * R, y * R);
    ctx.arc(x * R, y * R, r * R, 0, 2 * Math.PI);
    ctx.closePath();
}

function drawCircle(ctx:CanvasRenderingContext2D|null, x:number, y:number, r:number, fillStyle:string='white') {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(x * R, y * R, r * R, 0, 2 * Math.PI);
    ctx.fillStyle = fillStyle;
    ctx.fill();
}

/* Detect Circle-Circle Collision */
function circleCirlceCollision(x1:number, y1:number, r1:number, x2:number, y2:number, r2:number) {
    return ((r1 + r2) ** 2 > (x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function removeItem<T>(arr: Array<T>, value: T) {
    const index = arr.indexOf(value);
    if (index >= 0)
        arr.splice(index, 1);
}

function randRange(min:number, max:number) {
    return Math.random() * (max - min + 1) + min;
}

enum LV {
    easy,
    normal,
    hard,
    insane
}

class Game {
    static active = false;
    static score = 0;
    static highest = 0;
    static passedBall = 0;
    static level = LV.easy;
    static stage = 0;
    static stageBall = [10,25,45,65,85,100,120,140,160,180,Infinity];
    // circleNum[level][stage]
    static circleNum = [
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,2,2,2,3,3,3,4],
        [1,1,1,2,2,2,3,3,3,4,5],
        [2,2,3,3,4,4,5,5,6,6,6]
    ];
    // circleDeg[circleNum][circleID]
    static circleDeg(circleNum:number,i:number) {
        return 360 * i / circleNum;
    }
    // maxBall[level][stage][circleID]
    static maxBall = [
        [[1],[2],[3],[4],[4],[5],[5],[6],[6],[7],[7]],
        [[2],[3],[5],[6],[2,1],[3,2],[4,3],[2,2,1],[3,2,2],[3,3,3],[4,3,2,1]],
        [[3],[4],[5],[2,2],[3,2],[4,3],[3,2,1],[3,3,3],[4,4,3],[4,3,2,1],[5,4,3,2,1]],
        [[3,2],[4,2],[4,3,2],[5,3,3],[5,4,3,1],[6,4,3,2],[5,4,3,2,1],[5,4,3,2,1],[6,5,4,3,2,1],[6,5,4,3,2,1],[7,6,5,4,3,2]]
    ];
    // speeds[level][stage][circleID]
    static speeds = [
        [[5],[7.5],[9],[11],[13],[14],[15],[16],[17],[18],[20]],
        [[7],[9],[12],[15],[6,4],[6.5,5],[7,6],[5,4,3],[6,5,4],[7,6,5],[7,6,5,4]],
        [[9],[11],[15],[7,5],[8,6],[9,7],[7,5,4],[8,6,5],[9,7,6.5],[8,7,6,5],[9,7.5,6.5,5.5,5]],
        [[5,4],[7,6],[7.5,7,6],[7,6.5,6],[8,7.5,7,6.5],[8.5,8,8.5,7],[9,8.5,8,7.5,7],[10,9,8,7,6],[9,8,7,6,5,4],[10,9,8,7,6,5],[10,9,8,7,6,5]]
    ];
    static start(lvl:LV) {
        Game.active = true;
        startBtns?.classList.add('hide');
        expTxt?.classList.remove('hide');
        if (scoreTxt) scoreTxt.innerText = '0';

        Game.level = lvl;
        Game.passedBall = 0;
        Game.score = 0;
        Game.stage = -1;

        Game.nextStage();
        animate(performance.now());
    }
    static nextStage() {
        if (Game.stage >= Game.stageBall.length - 1)
            return;
        Game.stage += 1;
        circle = new Array(Game.circleNum[Game.level][Game.stage]);
        for (let i = 0; i < Game.circleNum[Game.level][Game.stage]; i++) {
            circle[i] = new Circle(CRadius[i], Game.speeds[Game.level][Game.stage][i], Game.maxBall[Game.level][Game.stage][i]);
            circle[i].createLine(Game.circleDeg(Game.circleNum[Game.level][Game.stage], i));
            circle[i].spawnBalls();
        }
        contextBack?.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
        for (const c of circle) {
            c.draw();
            c.line?.draw();
        }
    }
    static end() {
        Game.active = false;
        localStorage.setItem('Highest', String(Game.highest));
        setTimeout(() => {
            startBtns?.classList.remove('hide');
            expTxt?.classList.add('hide');
        }, 500);
    }
    static checkNextStage() {
        if (Game.passedBall >= Game.stageBall[Game.stage]) {
            for (const c of circle)
                if (c.ball.length > 0)
                    return;
            Game.nextStage();
        }
    }
    static scoreFunc() {
        let res = 1;
        for (const c of circle) 
            res *= Math.max(c.ball.length, 1);
        return res * circle.length * (Game.stage + 1);
    }
    static getScore() {
        Game.passedBall += 1;
        Game.score += Game.scoreFunc();
        if (scoreTxt) {
            scoreTxt.innerText = String(Game.score);
            if (Game.score > Game.highest) {
                Game.highest = Game.score;
                if (highestTxt)
                    highestTxt.innerText = String(Game.highest);
                localStorage.setItem('Highest', String(Game.highest));
            }
        }
    }
}

class Circle {
    public radius:number;
    public line:Line|null=null;
    public ball:Ball[] = new Array();
    public speed = 0.05;
    public maxBall = 2;
    private clockwise = Boolean(Math.floor(Math.random() * 2));
    constructor(radius:number, speed:number=0.05, maxBall:number=2) {
        this.radius = radius;
        this.speed = speed / 100;
        this.maxBall = maxBall;
    }
    draw() {
        if (!contextBack) return;
        contextBack.lineWidth = 2;
        contextBack.strokeStyle = 'white';
        contextBack.beginPath();
        contextBack.arc(0, 0, (this.radius + BRadius) * R, 0, 2 * Math.PI);
        contextBack.stroke();
        contextBack.beginPath();
        contextBack.arc(0, 0, (this.radius - BRadius) * R, 0, 2 * Math.PI);
        contextBack.stroke();
    }
    static clockWiseX(radius:number, rad:number) {
        return Math.sin(rad) * radius;
    }
    static clockWiseY(radius:number, rad:number) {
        return -Math.cos(rad) * radius;
    }
    createLine(degree:number) {
        this.line = new Line(this.radius, degree);
    }
    spawnBalls() {
        if (this.line === null) return;
        this.clockwise = !this.clockwise;
        const num = Math.floor(randRange(1, this.maxBall));
        let degs = new Array();
        spawnLoop:
        for (let i = 0; i < num; i++) {
            let degree = 0;
            let time = 0;
            rollLoop: while (true) {
                time++;
                if (time > 10) break spawnLoop;
                degree = randRange(this.line.degree + MinBLGap, this.line.degree + 360 - MinBLGap) % 360;
                for (let d = 0; d < degs.length; d++)
                    if (degree + (MinBBGap + this.speed * 50) > degs[d] && degree - (MinBBGap + this.speed * 50) < degs[d])
                            continue rollLoop;
                break rollLoop;
            }
            degs.push(degree);
            this.ball.push(new Ball(this.radius, degree, this.speed, this.clockwise));
        }
    }
    detectLineBallCollide() {
        if (this.line === null) return;
        for (const b of this.ball) {
            if (circleCirlceCollision(this.line.x, this.line.y, LWidth / 2 + 4, b.x, b.y, BRadius)) {
                if (!b.fading && !b.collideLine.now) {
					b.collideLine.now = true;
					collideBall.push(b);
					setTimeout(() => {
						removeItem(this.ball, b);
						removeItem(collideBall, b);
					}, fadeTime);
				}
            } else
                b.collideLine.now = false;
            if (!b.fading && b.collideLine.last && !b.collideLine.now) {
                Game.end();
                b.drawRed();
            }
            b.collideLine.last = b.collideLine.now;
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
        if (!contextBack) return;
        contextBack.beginPath();
        contextBack.rotate((this.degree - 90) * Math.PI / 180);
        const w = LWidth * R, h = BRadius * 2 * R;
        contextBack.rect(this.radius * R - h/2, -w/2, h, w);
        contextBack.fillStyle = 'white';
        contextBack.fill();
        contextBack.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
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
    public fading = false;
    constructor(outRadius:number, startDeg:number, speed:number, cloclwise:boolean) {
        this.outRadius = outRadius;
        this.startDEG = startDeg;
        this.speed = speed;
        this.clockwise = cloclwise;
        this.startTime = performance.now();
        this.updateXY(this.startTime);
    }
    updateXY(time:number) {
        const rad = (this.startDEG + (this.clockwise ? 1 : -1) * (time - this.startTime) * this.speed) * Math.PI / 180;
        this.x = Circle.clockWiseX(this.outRadius, rad);
        this.y = Circle.clockWiseY(this.outRadius, rad);
    }
    drawPath(time:number) {
        if (this.fading) return;
        this.updateXY(time);
        drawCirclePath(context, this.x, this.y, BRadius);
    }
    reverseDir(time:number=performance.now()) {
        const rad = (this.startDEG + (this.clockwise ? 1 : -1) * (time - this.startTime) * this.speed) * Math.PI / 180;
        const x = Circle.clockWiseX(this.outRadius, rad);
        const y = Circle.clockWiseY(this.outRadius, rad);
        const r = Math.acos(-y/this.outRadius) * 180 / Math.PI;
        this.startDEG = (x >= 0) ? r: 360 - r;
        this.startTime = performance.now();
        this.clockwise = !this.clockwise;
    }
    fade(time:number) {
        const delta = (time - this.startTime) / fadeTime;
        if (delta >= 1)
            removeItem(fadingBall, this);
        else
            drawCircle(contextFront, this.x, this.y, BRadius * (1 + delta), `rgba(255,255,255,${1 - delta})`);
    }
    startFade() {
        this.fading = true;
        fadingBall.push(this);
        this.startTime = performance.now();
    }
    drawRed() {
        if (!this.fading)
        	requestAnimationFrame(()=>drawCircle(contextFront, this.x, this.y, BRadius, 'red'));
    }
}

window.onload = function () {
    setCanvasSize();
    circle.push(new Circle(CRadius[0]));
    circle[0].createLine(0);
    for (const c of circle) {
        c.draw();
        c.line?.draw();
    }
    setControl();
    Game.highest = Number(localStorage.getItem('Highest'));
    if (highestTxt) highestTxt.innerText = String(Game.highest);
}

function animate(time:number) {
    if (Game.active && context && contextFront) {
        context.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
        contextFront.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
        context.beginPath();
        for (const c of circle) {
            if (c.ball.length == 0 && Game.passedBall < Game.stageBall[Game.stage])
                c.spawnBalls();
            else c.detectLineBallCollide();
            // c.detectBallBallCollide();
            for (const b of c.ball)
                b.drawPath(time);
        }
        for (const b of fadingBall)
            b.fade(time);
        Game.checkNextStage();
        context.fillStyle = 'white';
        context.fill();
        requestAnimationFrame(animate);
    }
}

const canTouch = ('ontouchstart' in window);
let touching = false;
function setControl() {
    if (startBtn.easy)   startBtn.easy.onclick   = () => Game.start(LV.easy);
    if (startBtn.normal) startBtn.normal.onclick = () => Game.start(LV.normal);
    if (startBtn.hard)   startBtn.hard.onclick   = () => Game.start(LV.hard);
    if (startBtn.insane) startBtn.insane.onclick = () => Game.start(LV.insane);

    if (canTouch) {
        window.ontouchstart = () => {
            if (touching) return;
            touching = true;
            console.log('touch');
            pressFunc();
        };
        window.ontouchend = () => {
            touching = false;
        };
        window.onmousedown = ()=>{console.log('mouse')};
    } else {
        window.onmousedown = ()=>{pressFunc(), console.log('mouse')};
    }
    window.onkeydown = pressFunc;

    console.log('ontouchstart', 'ontouchstart' in window);
    console.log('onmousedown', 'onmousedown' in window);
    console.log('onkeydown', 'onkeydown' in window);
    console.log('navigator.maxTouchPoints', navigator.maxTouchPoints);
}

function pressFunc() {
    if (!Game.active) return;
    if (collideBall.length == 0) {
        Game.end();
        for (const c of circle)
            for (const b of c.ball)
                b.drawRed();
    } else {
        for (const b of collideBall) {
            if (!b.fading) {
                Game.getScore();
                b.startFade();
            }
        }
        collideBall.shift();
    }
}