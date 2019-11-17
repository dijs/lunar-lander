const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const width = canvas.width;
const height = canvas.height;

let thrust = 0;
let flameLength = 0;
let ticks = 1;
let score = 0;
let level = 1;
let gravity = 0.7;
let maxFuel = 2000;

let lander = {
  x: 0,
  y: 50,
  w: 16,
  h: 16,
  vx: 0.5,
  vy: 0,
  rot: -Math.PI / 2, // 0
  fuel: maxFuel
};

const fps = 1000 / 30;
const timeDelta = 1 / fps;
const keys = {};
const UP = 38;
const LEFT = 37;
const RIGHT = 39;
let over = false;
let win = false;

const maxThrust = 3;
const mass = 1;

function nextLevel() {
  maxFuel *= 0.9;
  gravity += 0.1;
  lander = {
    x: 0,
    y: 50,
    w: 16,
    h: 16,
    vx: 0.5,
    vy: 0,
    rot: -Math.PI / 2,
    fuel: maxFuel
  };
  ticks = 1;
  over = false;
  landing = 60 + Math.random() * (width - 60);
  level++;
}

let landing = 60 + Math.random() * (width - 60);
let platformWidth = 50;
let platformHeight = 10;

function text(str, x, y, s = 10) {
  ctx.font = s + 'px serif';
  ctx.fillText(str, x, y);
}

const stars = Array(512 * 2)
  .fill(0)
  .map(() => Math.max(width, height) * Math.random());

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'white';

  for (let i = 0; i < stars.length; i += 2) {
    ctx.fillRect(stars[i], stars[i + 1], 1, 1);
  }

  ctx.strokeStyle = 'white';
  ctx.beginPath();
  const u = height - 20;
  ctx.rect(10, 10, 20, u);
  const e = u * (lander.fuel / maxFuel);
  ctx.fillRect(10, 10 + u - e, 20, e);
  ctx.stroke();

  ctx.fillRect(
    landing - platformWidth / 2,
    height - platformHeight,
    platformWidth,
    platformHeight
  );

  text(
    `Alt: ${(height - platformHeight - lander.y - lander.h / 2) | 0}`,
    width - 50,
    20,
    10
  );
  text(`Horz: ${(lander.vx * 100) | 0}`, width - 50, 30, 10);
  text(`Vert: ${(lander.vy * 100) | 0}`, width - 50, 40, 10);
  text(`Spin: ${lander.rot}`, width - 50, 50, 10);
  text(`Level: ${level}`, width - 50, 60, 10);

  if (over) {
    text(win ? `Win! (${score} pts)` : 'Fail', width / 2, height / 2, 50);
  }

  ctx.save();

  ctx.translate(lander.x, lander.y);
  ctx.rotate(lander.rot);
  ctx.translate(-lander.x, -lander.y);

  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.rect(lander.x - lander.w / 2, lander.y - lander.h, lander.w, lander.h);
  ctx.moveTo(lander.x - lander.w / 2, lander.y);
  ctx.lineTo(lander.x - lander.w / 2 - 4, lander.y + 8);
  ctx.moveTo(lander.x + lander.w / 2, lander.y);
  ctx.lineTo(lander.x + lander.w / 2 + 4, lander.y + 8);
  ctx.stroke();
  if (thrust > 0) {
    ctx.beginPath();
    ctx.moveTo(lander.x - 4, lander.y);
    ctx.lineTo(lander.x, lander.y + flameLength);
    ctx.lineTo(lander.x + 4, lander.y);
    ctx.fill();
  }

  ctx.restore();
}

const velLimit = 0.11;
const angleLimit = 0.11;
const distLimit = 13;

function update() {
  if (over) return;

  const landed = lander.y + lander.h / 2 >= height - platformHeight;
  if (landed) {
    over = true;

    console.log('vel:', lander.vx + lander.vy);
    console.log('rot:', lander.rot);
    console.log('land:', Math.abs(lander.x - landing));

    const vel = lander.vy + lander.vx;
    const angle = Math.abs(lander.rot);
    const dist = Math.abs(lander.x - landing);

    const slow = vel < velLimit;
    const upright = angle < angleLimit;
    const onPlatform = dist < distLimit;

    win = slow && upright && onPlatform;
    const s = vel / velLimit + angle / angleLimit + dist / distLimit;
    score = Math.round(s * -33.33 + 100) + lander.fuel;

    if (win) {
      nextLevel();
    }
  }

  if (keys[UP] && lander.fuel > 0) {
    thrust = maxThrust;
    flameLength = Math.min(flameLength + 1, 10 + (ticks % 7));
    lander.fuel--;
  } else {
    flameLength = 0;
    thrust = 0;
  }

  const tx = Math.sin(lander.rot) * thrust;
  const ty = Math.cos(lander.rot) * thrust;

  const ax = tx / mass;
  const ay = -ty / mass + gravity;

  const t = (timeDelta * timeDelta) / 2;

  lander.vx += ax * t;
  lander.vy += ay * t;

  lander.x += lander.vx;
  lander.y += lander.vy;

  if (keys[LEFT]) lander.rot -= 0.01;
  if (keys[RIGHT]) lander.rot += 0.01;
}

function gameLoop() {
  update(ticks);
  render(ticks);
  setTimeout(gameLoop);
  ticks++;
}

gameLoop();

document.addEventListener('keydown', e => (keys[e.which] = true));
document.addEventListener('keyup', e => (keys[e.which] = false));
