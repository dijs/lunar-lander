const width = 600;
const height = 400;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Score

const maxFuel = 800;

const lander = {
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

let thrust = 0;
const mass = 1;
const gravity = 0.5; // 1.62

let landing = 60 + Math.random() * (width - 60);
let platformWidth = 50;
let platformHeight = 10;

function text(str, x, y, s = 10) {
  ctx.font = s + 'px serif';
  ctx.fillText(str, x, y);
}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.fillStyle = 'white';
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

  text(`Alt: ${(height - platformHeight - lander.y) | 0}`, width - 50, 20, 10);
  text(`Horz: ${(lander.vx * 100) | 0}`, width - 50, 30, 10);
  text(`Vert: ${(lander.vy * 100) | 0}`, width - 50, 40, 10);
  text(`Spin: ${lander.rot}`, width - 50, 50, 10);

  if (over) {
    text(win ? 'Win!' : 'Fail', width / 2, height / 2, 50);
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
    ctx.lineTo(lander.x, lander.y + 6);
    ctx.lineTo(lander.x + 4, lander.y);
    ctx.fill();
  }

  ctx.restore();
}

function update() {
  if (over) return;

  if (lander.y + lander.h / 2 >= height - platformHeight) {
    over = true;
    console.log('vel:', lander.vx + lander.vy);
    console.log('rot:', lander.rot);
    console.log('land:', Math.abs(lander.x - landing));
    const slow = lander.vy + lander.vx < 0.1;
    const upright = Math.abs(lander.rot) < 0.1;
    const onPlatform = Math.abs(lander.x - landing) < 13;
    win = slow && upright && onPlatform;
  }

  if (keys[UP] && lander.fuel > 0) {
    thrust = maxThrust;
    lander.fuel--;
  } else {
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
  update();
  render();
  setTimeout(gameLoop);
}

gameLoop();

document.addEventListener('keydown', e => (keys[e.which] = true));
document.addEventListener('keyup', e => (keys[e.which] = false));
