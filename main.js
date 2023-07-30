/**
 * CIRCLES
 * repo: https://github.com/C-W-Z/circles
 * copyright (c) 2023 C-W-Z
 * CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)
 */
"use strict";const CANVAS_SIZE=400,CRadius=[175,155,135,115,95,75,55,35,15],BRadius=10,LWidth=10,MinBBGap=9,MinBLGap=45,R=window.devicePixelRatio,canvasBack=document.getElementById("canvas-back"),canvas=document.getElementById("canvas"),canvasFront=document.getElementById("canvas-front"),contextBack=canvasBack.getContext("2d"),context=canvas.getContext("2d"),contextFront=canvasFront.getContext("2d"),expTxt=document.getElementById("explain"),startBtns=document.getElementById("btns"),startBtn={easy:document.getElementById("easy-btn"),normal:document.getElementById("normal-btn"),hard:document.getElementById("hard-btn"),insane:document.getElementById("insane-btn")},scoreTxt=document.getElementById("current-score"),highestTxt=document.getElementById("highest-score");let circle=[];const collideBall=[],fadingBall=[],fadeTime=400;let auto=!1;function setCanvasSize(){canvasFront.width=canvasBack.width=canvas.width=CANVAS_SIZE*R,canvasFront.height=canvasBack.height=canvas.height=CANVAS_SIZE*R,null==context||context.setTransform(1,0,0,1,canvas.width/2,canvas.height/2),null==contextBack||contextBack.setTransform(1,0,0,1,canvas.width/2,canvas.height/2),null==contextFront||contextFront.setTransform(1,0,0,1,canvas.width/2,canvas.height/2)}function drawCirclePath(e,t,a,s){e&&(e.moveTo(t*R,a*R),e.arc(t*R,a*R,s*R,0,2*Math.PI),e.closePath())}function drawCircle(e,t,a,s,n="white"){e&&(e.beginPath(),e.arc(t*R,a*R,s*R,0,2*Math.PI),e.fillStyle=n,e.fill())}function circleCirlceCollision(e,t,a,s,n,i){return(a+i)**2>(e-s)**2+(t-n)**2}function removeItem(e,t){const a=e.indexOf(t);a>=0&&e.splice(a,1)}function randRange(e,t){return Math.random()*(t-e+1)+e}var LV;!function(e){e[e.easy=0]="easy",e[e.normal=1]="normal",e[e.hard=2]="hard",e[e.insane=3]="insane"}(LV||(LV={}));class Game{static circleDeg(e,t){return 360*t/e}static start(e){Game.active=!0,null==startBtns||startBtns.classList.add("hide"),null==expTxt||expTxt.classList.remove("hide"),scoreTxt&&(scoreTxt.innerText="0"),Game.level=e,Game.passedBall=0,Game.score=0,Game.stage=-1,Game.nextStage(),animate(performance.now())}static nextStage(){var e;if(!(Game.stage>=Game.stageBall.length-1)){Game.stage+=1,circle=Array(Game.circleNum[Game.level][Game.stage]);for(let e=0;e<Game.circleNum[Game.level][Game.stage];e++)circle[e]=new Circle(CRadius[e],Game.speeds[Game.level][Game.stage][e],Game.maxBall[Game.level][Game.stage][e]),circle[e].createLine(Game.circleDeg(Game.circleNum[Game.level][Game.stage],e)),circle[e].spawnBalls();null==contextBack||contextBack.clearRect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height);for(const t of circle)t.draw(),null===(e=t.line)||void 0===e||e.draw()}}static end(){Game.active=!1,localStorage.setItem("Highest",Game.highest+""),setTimeout(()=>{null==startBtns||startBtns.classList.remove("hide"),null==expTxt||expTxt.classList.add("hide")},500)}static checkNextStage(){if(Game.passedBall>=Game.stageBall[Game.stage]){for(const e of circle)if(e.ball.length>0)return;Game.nextStage()}}static scoreFunc(){let e=1;for(const t of circle)e*=Math.max(t.ball.length,1);return e*circle.length*(Game.stage+1)}static getScore(){Game.passedBall+=1,Game.score+=Game.scoreFunc(),scoreTxt&&(scoreTxt.innerText=Game.score+"",Game.score>Game.highest&&(Game.highest=Game.score,highestTxt&&(highestTxt.innerText=Game.highest+""),localStorage.setItem("Highest",Game.highest+"")))}}Game.active=!1,Game.score=0,Game.highest=0,Game.passedBall=0,Game.level=LV.easy,Game.stage=0,Game.stageBall=[10,25,45,65,85,100,120,140,160,180,1/0],Game.circleNum=[[1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,2,2,2,3,3,3,4],[1,1,1,2,2,2,3,3,3,4,5],[2,2,3,3,4,4,5,5,6,6,6]],Game.maxBall=[[[1],[2],[3],[4],[4],[5],[5],[6],[6],[7],[7]],[[2],[3],[5],[6],[2,1],[3,2],[4,3],[2,2,1],[3,2,2],[3,3,3],[4,3,2,1]],[[3],[4],[5],[2,2],[3,2],[4,3],[3,2,1],[3,3,3],[4,4,3],[4,3,2,1],[5,4,3,2,1]],[[3,2],[4,2],[4,3,2],[5,3,3],[5,4,3,1],[6,4,3,2],[5,4,3,2,1],[5,4,3,2,1],[6,5,4,3,2,1],[6,5,4,3,2,1],[7,6,5,4,3,2]]],Game.speeds=[[[5],[7.5],[9],[11],[13],[14],[15],[16],[17],[18],[20]],[[7],[9],[12],[15],[6,4],[6.5,5],[7,6],[5,4,3],[6,5,4],[7,6,5],[7,6,5,4]],[[9],[11],[15],[7,5],[8,6],[9,7],[7,5,4],[8,6,5],[9,7,6.5],[8,7,6,5],[9,7.5,6.5,5.5,5]],[[5,4],[7,6],[7.5,7,6],[7,6.5,6],[8,7.5,7,6.5],[8.5,8,8.5,7],[9,8.5,8,7.5,7],[10,9,8,7,6],[9,8,7,6,5,4],[10,9,8,7,6,5],[10,9,8,7,6,5]]];class Circle{constructor(e,t=.05,a=2){this.line=null,this.ball=[],this.speed=.05,this.maxBall=2,this.clockwise=!!Math.floor(2*Math.random()),this.radius=e,this.speed=t/100,this.maxBall=a}draw(){contextBack&&(contextBack.lineWidth=2,contextBack.strokeStyle="white",contextBack.beginPath(),contextBack.arc(0,0,(this.radius+BRadius)*R,0,2*Math.PI),contextBack.stroke(),contextBack.beginPath(),contextBack.arc(0,0,(this.radius-BRadius)*R,0,2*Math.PI),contextBack.stroke())}static clockWiseX(e,t){return Math.sin(t)*e}static clockWiseY(e,t){return-Math.cos(t)*e}createLine(e){this.line=new Line(this.radius,e)}spawnBalls(){if(null===this.line)return;this.clockwise=!this.clockwise;const e=Math.floor(randRange(1,this.maxBall));let t=[];e:for(let a=0;a<e;a++){let e=0,a=0;t:for(;;){if(++a>10)break e;e=randRange(this.line.degree+MinBLGap,this.line.degree+360-MinBLGap)%360;for(let a=0;a<t.length;a++)if(e+(MinBBGap+50*this.speed)>t[a]&&e-(MinBBGap+50*this.speed)<t[a])continue t;break t}t.push(e),this.ball.push(new Ball(this.radius,e,this.speed,this.clockwise))}}detectLineBallCollide(){if(null!==this.line)for(const e of this.ball)circleCirlceCollision(this.line.x,this.line.y,LWidth/2+4,e.x,e.y,BRadius)?e.fading||e.collideLine.now||(e.collideLine.now=!0,collideBall.push(e),setTimeout(()=>{removeItem(this.ball,e),removeItem(collideBall,e)},fadeTime)):e.collideLine.now=!1,e.fading||!e.collideLine.last||e.collideLine.now||(Game.end(),e.drawRed()),e.collideLine.last=e.collideLine.now}detectBallBallCollide(){for(const e of this.ball)for(const t of this.ball)circleCirlceCollision(e.x,e.y,BRadius,t.x,t.y,BRadius)&&(e.reverseDir(),t.reverseDir())}}class Line{constructor(e,t){this.radius=e,this.degree=t,this.x=Circle.clockWiseX(e,t*Math.PI/180),this.y=Circle.clockWiseY(e,t*Math.PI/180)}draw(){if(!contextBack)return;contextBack.beginPath(),contextBack.rotate((this.degree-90)*Math.PI/180);const e=LWidth*R,t=2*BRadius*R;contextBack.rect(this.radius*R-t/2,-e/2,t,e),contextBack.fillStyle="white",contextBack.fill(),contextBack.setTransform(1,0,0,1,canvas.width/2,canvas.height/2)}}class Ball{constructor(e,t,a,s){this.startDEG=0,this.speed=.1,this.clockwise=!0,this.startTime=0,this.x=0,this.y=0,this.collideLine={now:!1,last:!1},this.fading=!1,this.outRadius=e,this.startDEG=t,this.speed=a,this.clockwise=s,this.startTime=performance.now(),this.updateXY(this.startTime)}updateXY(e){const t=(this.startDEG+(this.clockwise?1:-1)*(e-this.startTime)*this.speed)*Math.PI/180;this.x=Circle.clockWiseX(this.outRadius,t),this.y=Circle.clockWiseY(this.outRadius,t)}drawPath(e){this.fading||(this.updateXY(e),drawCirclePath(context,this.x,this.y,BRadius))}reverseDir(e=performance.now()){const t=(this.startDEG+(this.clockwise?1:-1)*(e-this.startTime)*this.speed)*Math.PI/180,a=Circle.clockWiseX(this.outRadius,t),s=Circle.clockWiseY(this.outRadius,t),n=180*Math.acos(-s/this.outRadius)/Math.PI;this.startDEG=a>=0?n:360-n,this.startTime=performance.now(),this.clockwise=!this.clockwise}fade(e){const t=(e-this.startTime)/fadeTime;t>=1?removeItem(fadingBall,this):drawCircle(contextFront,this.x,this.y,BRadius*(1+t),`rgba(255,255,255,${1-t})`)}startFade(){this.fading=!0,fadingBall.push(this),this.startTime=performance.now()}drawRed(){this.fading||requestAnimationFrame(()=>drawCircle(contextFront,this.x,this.y,BRadius,"red"))}}function animate(e){if(Game.active&&context&&contextFront){context.clearRect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height),contextFront.clearRect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height),context.beginPath();for(const t of circle){0==t.ball.length&&Game.passedBall<Game.stageBall[Game.stage]?t.spawnBalls():t.detectLineBallCollide();for(const a of t.ball)a.drawPath(e)}for(const t of fadingBall)t.fade(e);Game.checkNextStage(),context.fillStyle="white",context.fill(),requestAnimationFrame(animate)}}window.onload=function(){var e;setCanvasSize(),circle.push(new Circle(CRadius[0])),circle[0].createLine(0);for(const t of circle)t.draw(),null===(e=t.line)||void 0===e||e.draw();setControl(),Game.highest=+localStorage.getItem("Highest"),highestTxt&&(highestTxt.innerText=Game.highest+"")};const canTouch="ontouchstart"in window;let touching=!1;function setControl(){startBtn.easy&&(startBtn.easy.onclick=(()=>Game.start(LV.easy))),startBtn.normal&&(startBtn.normal.onclick=(()=>Game.start(LV.normal))),startBtn.hard&&(startBtn.hard.onclick=(()=>Game.start(LV.hard))),startBtn.insane&&(startBtn.insane.onclick=(()=>Game.start(LV.insane))),canTouch?(window.ontouchstart=(()=>{touching||(touching=!0,console.log("touch"),pressFunc())}),window.ontouchend=(()=>{touching=!1}),window.onmousedown=(()=>{console.log("ontouchstart","ontouchstart"in window),console.log("onmousedown","onmousedown"in window),console.log("onkeydown","onkeydown"in window),console.log("navigator.maxTouchPoints",navigator.maxTouchPoints)})):window.onmousedown=(()=>{pressFunc(),console.log("mouse")}),window.onkeydown=pressFunc,console.log("ontouchstart","ontouchstart"in window),console.log("onmousedown","onmousedown"in window),console.log("onkeydown","onkeydown"in window),console.log("navigator.maxTouchPoints",navigator.maxTouchPoints)}function pressFunc(){if(Game.active)if(0==collideBall.length){Game.end();for(const e of circle)for(const t of e.ball)t.drawRed()}else{for(const e of collideBall)e.fading||(Game.getScore(),e.startFade());collideBall.shift()}}