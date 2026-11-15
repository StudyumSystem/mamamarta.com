// MM-GAME-04 The Art of Moving: her world and her run, without any drawing (the game draws it; a check page runs it
// on its own to measure where a jump can end).

// World in Figma units: her MM-G04-03 play card is 635 x 726 (here 660 x 755 units, the same shape).
export const H0 = 755;
// Her MM-G04-03 Gameplay has the figure's picture 348 x 490 in the 635 x 726 card: 510 units here, and her own
// height in it 87% of that (the walk clip's figure), 444 units.
export const FH = 510;
export const BODY_U = 0.87 * FH;
// Her feet against the bricks (12 Nov, Marta: "she must stand on the bricks"): she stands while her middle is over
// a brick and drops the moment it passes the edge; coming down she lands when either foot is over a brick's top
// (her back foot only on the way down from a jump), and a brick's side stops her: with her feet below its top she
// can't pass through it, she slides down it.
export const FOOT_FRONT = 45; // her front foot ahead of her middle
export const FOOT_BACK = 30; // her back foot behind it
export const WALL_FRONT = 20; // her front ahead of her middle, against a brick's side
export const BODY_W = 115;
export const BODY_H = 0.88 * FH;
export const PLAT_H = 37;
export const COIN_R = 23.4; // her badge, 45 of 635 px
export const APEX = 150; // jump height
export const AIR = 0.78; // time in the air on level ground
export const V0 = (4 * APEX) / AIR;
export const G = (2 * V0) / AIR;
// Platform tops: hers run 562 to 682 here; with her taller figure the highest sit at 600, so the head stays
// inside the frame at the top of a jump.
export const Y_MIN = 600;
export const Y_MAX = 700;
export const Y_START = 640;
export const SPEED0 = 280;
export const SPEED_MAX = 470;
const ACCEL = 5; // speed gained per second of running
export const COYOTE = 0.09; // a jump still counts this long after her middle passes a brick's edge (s)
export const BUFFER = 0.12; // a press this long before she lands jumps as she lands (s)
// 12 Nov (Marta: "when I start jumping, I lose straight away"): her feet may come down this far below a brick's top
// in one step and still land on it (a landing that is a hair late is a landing, not a slide down the wall).
export const GRACE = 14;
// Her first bricks are easy: level or a small step down, the gap just wider than her foot, so no press anywhere on
// them (and no missed press) can end her run; the route gets harder after them.
export const EASY = 5;
const GAP_MIN = 70;
export const FALL_T = 0.6; // the last fall until the score (s)
// 15 Nov (Marta: "when the figure collects many coins in a row … you collected three coins in a row, so you get
// extra MM-stars because you collected them quickly in a row and didn't miss one"): coins in a row without missing
// one; a coin is missed once her back has passed it untaken. Every third coin in a row adds a bonus.
export const STREAK = 3;
export const STREAK_BONUS = 10; // MM✦ added by every third coin in a row
export const POP_T = 1.6; // how long the bonus's "+10" stays near her (s)

export const rand = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Time from take-off until landing on a platform `rise` units higher (negative = lower).
export const airTime = (rise) => (V0 + Math.sqrt(Math.max(0, V0 * V0 - 2 * G * rise))) / G;
export const speedAt = (t) => (t < 0.8 ? SPEED0 * (0.35 + 0.65 * (t / 0.8)) : Math.min(SPEED_MAX, SPEED0 + ACCEL * (t - 0.8)));

// A new random route. `reach` is how far her middle travels in the air when she takes off at the very edge.
// Every gap is wider than her foot (so a gap reads as a gap) and at most 70% of the reach, so a jump from the
// edge always clears it with room to spare; every brick is long enough that a jump from the edge lands on it,
// never past it. At the top speed that leaves her about a quarter of a second to choose the moment.
export function addPlatform(g) {
  const last = g.plats[g.plats.length - 1];
  const speed = speedAt(g.genT + 1);
  let y, gap, w;
  if (g.made < g.opt.easy) {
    // level, then now and then a small step down; a level gap of at most 70 is crossed even by walking off the
    // edge (she is at most 9 units under the top when her front foot reaches the brick: the grace catches her),
    // and a jump that comes down short lands on her back foot at the edge
    y = clamp(last.y + (g.made < 2 || Math.random() < 0.5 ? 0 : rand(12, 28)), Y_MIN, Y_MAX);
    gap = rand(64, 70);
    w = rand(260, 340);
  } else {
    // after her easy bricks the steps grow to their full size over 10 s (opt.easy 0: the rules before 12 Nov)
    const hard = Math.min(1, (g.opt.easy ? g.genT - g.easyT : g.genT) / 40);
    y = clamp(last.y + rand(-80, 100) * (g.opt.easy ? 0.5 + 0.5 * Math.min(1, hard * 4) : 1), Y_MIN, Y_MAX);
    const reach = speed * airTime(last.y - y);
    gap = Math.max(GAP_MIN, rand(0.3, 0.5 + 0.2 * hard) * reach);
    w = Math.max(rand(0.55, 0.95 - 0.25 * hard) * reach, reach - gap + 60, 150);
  }
  const p = { x: last.x + last.w + gap, y, w };
  g.plats.push(p);
  g.made += 1;
  g.genT += (gap + w) / speed;
  if (g.made === g.opt.easy) g.easyT = g.genT;
  // Coins: in the gap at jump height (taken on the way over), or high above a long platform (needs a jump).
  const roll = Math.random();
  if (roll < 0.35) g.coins.push({ x: last.x + last.w + gap / 2, y: Math.min(last.y, y) - 200, taken: 0 });
  else if (roll < 0.6 && w > 220) g.coins.push({ x: p.x + w * rand(0.35, 0.65), y: y - (BODY_H + COIN_R + 20), taken: 0 });
}

// One small step of her run (h seconds at `speed`): "off" when she leaves a brick's edge, "land" when she
// lands, "fall" when she is gone below the bricks.
export function move(g, h, speed) {
  const p = g.p;
  const o = g.opt;
  p.x += speed * h;
  let ev = null;
  if (p.ground && p.x > p.ground.x + p.ground.w) { p.ground = null; p.offAt = g.clock; ev = "off"; }
  if (p.ground) return ev;
  const prevY = p.y;
  p.vy += G * h;
  p.y += p.vy * h;
  if (p.vy > 0) {
    const back = p.jumped ? o.back : 0;
    for (const plat of g.plats) {
      // feet at or just under the top (within the grace), coming down, a foot over the brick
      if (p.y >= plat.y && (prevY <= plat.y || p.y - plat.y <= o.grace) && p.x + FOOT_FRONT >= plat.x && p.x - back <= plat.x + plat.w) {
        // 15 Nov (Marta: smoother): how far under the top her feet were, so the game can ease her up those few
        // units instead of popping her up in one frame (only the drawing; she stands on the top straight away)
        p.sink = p.y - plat.y;
        p.y = plat.y; p.vy = 0; p.ground = plat; p.jumped = false;
        return "land";
      }
    }
  }
  for (const plat of g.plats) {
    if (p.y > plat.y && p.y - BODY_H < plat.y + PLAT_H && p.x + WALL_FRONT > plat.x && p.x < plat.x + plat.w) p.x = plat.x - WALL_FRONT;
  }
  return p.y > Y_MAX + 60 ? "fall" : ev;
}

// opt (for the check page): easy = how many easy bricks, grace, back = her back foot on landing (0, 0, 0 = the
// rules before 12 Nov).
export function newWorld(opt) {
  const first = { x: -115, y: Y_START, w: 520 };
  const g = {
    opt: { easy: EASY, grace: GRACE, back: FOOT_BACK, ...opt },
    plats: [first],
    coins: [],
    genT: 1.6,
    easyT: 1.6,
    made: 0,
    p: { x: 0, y: Y_START, vy: 0, ground: first, offAt: -9, jumped: false, landAt: -9, sink: 0 },
    mode: "countdown", // countdown | play | fall | over
    t: 0, // running time
    clock: 0,
    speed: 0,
    anchor: 0.5, // player position across the frame: centred for the countdown, then 30% from the left
    fade: 1,
    fallT: 0,
    buffer: -9,
    coinsTaken: 0,
    // 15 Nov (Marta): jumps = jumps begun (a press, or one remembered for the landing), for the jump's sound;
    // streak = coins in a row without a miss; bonus = MM✦ from every third in a row; pops = the "+10" shown for it
    jumps: 0,
    streak: 0,
    bonus: 0,
    pops: [],
  };
  for (let i = 0; i < 6; i++) addPlatform(g);
  return g;
}

// One press: a jump from a brick (or just after leaving one), else remembered for a landing just after.
export function pressJump(g) {
  const p = g.p;
  if (g.mode !== "play") return false;
  const coyote = !p.ground && !p.jumped && g.clock - p.offAt < COYOTE;
  if (!p.ground && !coyote) { g.buffer = g.clock; return false; }
  p.vy = -V0; p.ground = null; p.jumped = true; g.buffer = -9;
  g.jumps += 1;
  return true;
}

// One step of the run (h s); viewW = how much of the world the frame shows. Returns
// { ev: "land" | "off" | "fall" | "over" | null, got: coins taken in this step, missed: coins she passed untaken,
// bonus: bonuses earned (15 Nov) }.
export function runStep(g, h, viewW) {
  g.clock += h;
  const p = g.p;
  let ev = null, got = 0, missed = 0, bonus = 0;
  if (g.mode === "play") {
    g.t += h;
    const speed = speedAt(g.t);
    g.speed = speed;
    g.anchor = 0.5 - 0.2 * (1 - Math.pow(1 - Math.min(1, g.t / 0.7), 3));
    ev = move(g, h, speed);
    if (ev === "land") {
      p.landAt = g.clock;
      if (g.clock - g.buffer < BUFFER) pressJump(g); // pressed just before landing: still counts
    } else if (ev === "fall") { g.mode = "fall"; g.fallT = 0; }
    for (const c of g.coins) {
      if (c.taken || c.missed) continue;
      // 15 Nov (Marta): a coin wholly behind her, not taken, is missed and ends the coins in a row
      if (c.x + COIN_R < p.x - BODY_W / 2) { c.missed = true; missed += 1; g.streak = 0; continue; }
      if (Math.abs(c.x - p.x) < BODY_W / 2 + COIN_R && c.y + COIN_R > p.y - BODY_H && c.y - COIN_R < p.y) {
        c.taken = g.clock;
        g.coinsTaken += 1;
        got += 1;
        g.streak += 1;
        if (g.streak % STREAK === 0) {
          // every third coin in a row: the bonus, and its "+10" at the coin's height, beside her
          g.bonus += STREAK_BONUS;
          bonus += 1;
          g.pops.push({ at: g.clock, y: c.y });
        }
      }
    }
    if (g.pops.length && g.clock - g.pops[0].at > POP_T) g.pops.shift();
    const camX = p.x - g.anchor * viewW;
    while (g.plats[g.plats.length - 1].x < camX + viewW + 600) addPlatform(g);
    while (g.plats.length > 2 && g.plats[0].x + g.plats[0].w < camX - 300) g.plats.shift();
    while (g.coins.length && g.coins[0].x < camX - 300) g.coins.shift();
  } else if (g.mode === "fall") {
    g.fallT += h;
    p.vy += G * h;
    p.y += p.vy * h;
    g.fade = Math.max(0, 1 - g.fallT / (FALL_T - 0.05));
    if (g.fallT >= FALL_T) { g.mode = "over"; ev = "over"; }
  }
  return { ev, got, missed, bonus };
}
