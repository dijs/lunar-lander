const width = 600;
const height = 400;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const maxFuel = 800;

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

const maxThrust = 3; // 3

let thrust = 0;
let flameLength = 0;
let ticks = 1;
let score = 0;

const mass = 1;
const gravity = 0.5; //0.5

let landing = 60 + Math.random() * (width - 60);
let platformWidth = 50;
let platformHeight = 10;

function reset() {
  lander = {
    x: 0,
    y: 50,
    w: 16,
    h: 16,
    vx: 0.5,
    vy: 0,
    rot: -Math.PI / 2, // 0
    fuel: maxFuel
  };
  over = false;
  win = false;
  landing = 60 + Math.random() * (width - 60);
  thrust = 0;
  flameLength = 0;
  ticks = 1;
  score = 0;
}

function text(str, x, y, s = 10) {
  ctx.font = s + 'px serif';
  ctx.fillText(str, x, y);
}

const big = 179424673 + Math.random() * 776531401;

function random(seed) {
  return (big * seed ** seed) % 1;
}

function render(ticks) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'white';

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const u = x * height + y;
      if (u % 23 === 0 && random(x / width) > 0.9 && random(y / height) > 0.9) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
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

  if (lander.x < 0 || lander.x > canvas.width || lander.y < 0) {
    over = true;
    win = false;
  }

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
  }

  if (keys[UP] && lander.fuel > 0) {
    thrust = maxThrust;
    flameLength = Math.min(flameLength + 1, 13 + (ticks % 7));
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

// Actions for AI

function engageThruster() {
  keys[UP] = true;
}

function disengageThruster() {
  keys[UP] = false;
}

function rotateLeft() {
  keys[LEFT] = true;
}

function rotateRight() {
  keys[RIGHT] = true;
}

function stopRotating() {
  keys[LEFT] = false;
  keys[RIGHT] = false;
}

const actions = {
  0: engageThruster,
  1: disengageThruster,
  2: rotateLeft,
  3: rotateRight,
  4: stopRotating
};

// create an environment object
var env = {};
env.getNumStates = function() {
  return 7;
};
env.getMaxNumActions = function() {
  return 5;
};

let prevScore = 0;

// create the DQN agent
var spec = { alpha: 0.01 }; // see full options on DQN page
agent = new RL.DQNAgent(env, spec);

// agent.fromJSON(JSON.parse(data));

setInterval(function() {
  // start the learning loop
  var action = agent.act([
    lander.rot,
    lander.x,
    lander.y,
    lander.fuel,
    lander.vx,
    lander.vy,
    landing
  ]);

  actions[action]();

  const vel = lander.vy + lander.vx;
  const angle = Math.abs(lander.rot);
  const dist = Math.abs(lander.x - landing);

  const a = vel - velLimit;
  const b = angle - angleLimit;
  const c = dist - distLimit;

  const score = Math.sqrt(a * a + b * b + c * c);

  const reward = Math.sign(score - prevScore) * 0.1;

  console.log(reward);

  prevScore = score;

  agent.learn(reward);

  if (over) {
    reset();
  }
}, 100);
