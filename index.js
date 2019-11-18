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
let gravity = 2;
let maxFuel = 200 + height / 7; // proportionate to screen height

console.log('Height', height);
console.log('Max Fuel', maxFuel);

function rand(min, max) {
  return Math.floor((max - min) * Math.random()) + min;
}

const avg = (a, b) => ((a + b) / 2) | 0;

function segment(data, start, end, rmin = 0, rmax = 2) {
  if (end - start <= 1) return;
  const min = data[start];
  const max = data[end];
  const val = avg(min, max) + rand(rmin, rmax);
  const mid = avg(start, end);
  data[mid] += val;
  segment(data, start, mid, rmin, rmax);
  segment(data, mid, end, rmin, rmax);
}

function buildHeightmap(size = 1, left = 0, right = 0, rmin, rmax) {
  const heightmap = Array(size).fill(0);
  heightmap[0] = left;
  heightmap[size - 1] = right;
  segment(heightmap, 0, heightmap.length - 1, rmin, rmax);
  return heightmap;
}

const landscape = buildHeightmap(32, 64, 64, -8, 16);

let lander = {
  x: 0,
  y: 50,
  w: 16,
  h: 16,
  vx: 5,
  vy: 0,
  rot: -Math.PI / 2, // 0
  fuel: maxFuel
};

const fps = 1000 / 30;
const timeDelta = 0.1;
const keys = {};
const UP = 38;
const LEFT = 37;
const RIGHT = 39;
const rotationDelta = 0.03;

let over = false;
let win = false;

const maxThrust = 10;
const mass = 1;

function getRandomLanding() {
  return 40 + Math.random() * (width - 40);
}

function nextLevel() {
  maxFuel *= 0.95;
  gravity += 0.2;
  lander = {
    x: 0,
    y: 50,
    w: 16,
    h: 16,
    vx: 5,
    vy: 0,
    rot: -Math.PI / 2,
    fuel: maxFuel
  };
  ticks = 1;
  over = false;
  landing = getRandomLanding();
  level++;
}

let landing = getRandomLanding();
let platformWidth = 50;
let platformHeight = 10;

function reset() {
  lander = {
    x: 0,
    y: 50,
    w: 16,
    h: 16,
    vx: 5,
    vy: 0,
    rot: -Math.PI / 2, // 0
    fuel: maxFuel
  };
  over = false;
  win = false;
  landing = getRandomLanding();
  thrust = 0;
  flameLength = 0;
  ticks = 1;
  score = 0;
}

function text(str, x, y, s = 10) {
  ctx.font = s + 'px serif';
  ctx.fillText(str, x, y);
}

const stars = Array(512 * 2)
  .fill(0)
  .map(() => Math.max(width, height) * Math.random());

function isLevel() {
  return Math.abs(lander.rot) < angleLimit;
}

function getVelocityDeltaAt(time, thrustOmega = 1) {
  const forceX = Math.sin(lander.rot) * thrust * thrustOmega;
  const forceY = Math.cos(lander.rot) * thrust * thrustOmega;

  const accX = forceX / mass;
  const accY = -forceY / mass + gravity;

  const t = time ** 2 / 2;

  return {
    vx: accX * t,
    vy: accY * t
  };
}

function getPositionAt() {}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'white';

  for (let i = 0; i < stars.length; i += 2) {
    ctx.fillRect(stars[i], stars[i + 1], 1, 1);
  }

  text(
    `Alt: ${(height - platformHeight - lander.y - lander.h / 2) | 0}`,
    width - 50,
    20,
    10
  );
  text(`Horz: ${(lander.vx * 100) | 0}`, width - 50, 30, 10);
  text(`Vert: ${(lander.vy * 100) | 0}`, width - 50, 40, 10);
  text(`Spin: ${lander.rot}`, width - 50, 50, 10);
  text(`Difficulty: ${level}`, width - 50, 60, 10);

  if (over) {
    text(win ? `Win!` : 'Fail', width / 2, height / 2, 50);
  }

  // Draw landscape
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'black';
  ctx.beginPath();
  const spacing = width / landscape.length;
  ctx.moveTo(0, height - landscape[0]);
  for (let i = 1; i < landscape.length; i++) {
    ctx.lineTo(spacing * i, height - landscape[i]);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();
  ctx.stroke();

  // Draw fuel
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.beginPath();
  const u = height - 20;
  ctx.rect(10, 10, 20, u);
  const e = u * (lander.fuel / maxFuel);
  ctx.fillRect(10, 10 + u - e, 20, e);
  ctx.stroke();

  // Draw ship
  ctx.save();

  ctx.translate(lander.x, lander.y);
  ctx.rotate(lander.rot);
  ctx.translate(-lander.x, -lander.y);

  ctx.strokeStyle = isLevel() ? 'green' : 'white';
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

  if (level === 1) {
    // Draw projection
    let x = lander.x;
    let y = lander.y;
    let vx = lander.vx;
    let vy = lander.vy;
    for (let frame = 0; frame < 500; frame++) {
      const delta = getVelocityDeltaAt(timeDelta, 0.01);
      vx += delta.vx;
      vy += delta.vy;
      x += vx;
      y += vy;
      if (frame % 7 === 0) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  ctx.fillStyle = 'white';
  ctx.fillRect(
    landing - platformWidth / 2,
    height - platformHeight,
    platformWidth,
    platformHeight
  );
}

function getSlopeDelta() {
  const delta = getVelocityDeltaAt(timeDelta, 0.01);
  const nx = lander.x + lander.vx + delta.vx;
  const ny = lander.y + lander.vy + delta.vy;
  const currentSlope = (lander.y - ny) / (lander.x - nx);
  const targetSlope =
    (lander.y - (height - platformHeight)) / (lander.x - landing);
  return Math.sqrt(Math.pow(currentSlope - targetSlope, 2));
}

function distanceFromPlatform() {
  const dx = lander.x - landing;
  const dy = lander.y - (height - platformHeight);
  return Math.sqrt(dx ** 2, dy ** 2);
}

const velLimit = 0.5;
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

    // console.log('vel:', lander.vx + lander.vy);
    // console.log('rot:', lander.rot);
    // console.log('land:', Math.abs(lander.x - landing));

    const vel = lander.vy + lander.vx;
    const dist = Math.abs(lander.x - landing);

    const slow = vel < velLimit;
    const onPlatform = dist < distLimit;

    win = slow && isLevel() && onPlatform;
    // const s = vel / velLimit + angle / angleLimit + dist / distLimit;
    // score = Math.round(s * -33.33 + 100) + lander.fuel;

    if (win) {
      nextLevel();
    }
  }

  if (keys[UP] && lander.fuel > 0) {
    thrust = maxThrust;
    flameLength = Math.min(flameLength + 1, 10 + (ticks % 5));
    lander.fuel--;
  } else {
    flameLength = 0;
    thrust = 0;
  }

  const { vx, vy } = getVelocityDeltaAt(timeDelta);

  lander.vx += vx;
  lander.vy += vy;

  lander.x += lander.vx;
  lander.y += lander.vy;

  if (keys[LEFT]) lander.rot -= rotationDelta;
  if (keys[RIGHT]) lander.rot += rotationDelta;
}

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
  keys[RIGHT] = false;
}

function rotateRight() {
  keys[RIGHT] = true;
  keys[LEFT] = false;
}

function doNothing() {
  keys[RIGHT] = false;
  keys[UP] = false;
  keys[LEFT] = false;
}

const actions = {
  0: engageThruster,
  1: disengageThruster,
  2: rotateLeft,
  3: rotateRight,
  4: doNothing
};

// agent.fromJSON(JSON.parse(data));

function getState() {
  return [
    lander.rot / (Math.PI * 2),
    lander.x / width,
    lander.y / height,
    lander.fuel / maxFuel,
    // lander.vx,
    // lander.vy,
    landing / width
    // (height - platformHeight) /
  ];
}

// create an environment object
const env = {};
env.getNumStates = function() {
  return 5;
};
env.getMaxNumActions = function() {
  return 5;
};

let prevPlatformDist = 0;
let prevLevelDist = 0;

const agent = new RL.DQNAgent(env);

function getReward() {
  const platformDist = distanceFromPlatform();
  const levelDist = Math.abs(lander.rot);

  const r1 = Math.sign(prevPlatformDist - platformDist);
  const r2 = 0; //-Math.sign(levelDist - prevLevelDist);
  const reward = (r1 + r2) * 0.1;

  prevPlatformDist = platformDist;
  prevLevelDist = levelDist;

  return reward;
}

let rewardSum = 0;
let rewardCount = 0;

function gameLoop() {
  // AI  acts
  actions[agent.act(getState())]();

  update(ticks);

  // Teach AI
  if (over) {
    if (!win) {
      agent.learn(-10);
    }
    console.log('Average Reward', rewardSum / rewardCount);

    rewardSum = 0;
    rewardCount = 0;
    reset();
  } else {
    const reward = getReward();
    rewardSum += reward;
    rewardCount++;
    agent.learn(reward);
  }

  render(ticks);
  requestAnimationFrame(gameLoop);
  ticks++;
}

gameLoop();
