import { map, radians, sin, cos, CENTER, constrain, random } from "./utils";

export interface IPlayer {
  id: string;
  name?: string;
}

export interface IPaddleView {
  player: IPlayer;
  fill: [number];
  rectMode: "center";
  rect: [number, number, number, number];
}

export interface IPuckView {
  fill: [number];
  ellipse: [number, number, number];
}
export interface IPongView {
  puck: IPuckView;
  left: IPaddleView;
  right: IPaddleView;
  leftScore: { text: [number, number, number] };
  rightScore: { text: [number, number, number] };
}

export class Paddle {
  rectMode(rectMode: any) {
    throw new Error("Method not implemented.");
  }
  score = 0;
  w = 20;
  h = 100;
  ychange = 0;
  x: number;
  y: number;
  fill: any;
  rect: any;

  constructor(
    isLeft: boolean,
    public readonly player: IPlayer,
    private readonly canvasWidth: number,
    private readonly canvasHeight: number
  ) {
    this.y = this.canvasHeight / 2;

    if (isLeft) {
      this.x = this.w;
    } else {
      this.x = this.canvasWidth - this.w;
    }
  }

  update() {
    this.y += this.ychange;
    this.y = constrain(this.y, this.h / 2, this.canvasHeight - this.h / 2);
  }

  move(steps: number) {
    this.ychange = steps;
  }

  show(): IPaddleView {
    return {
      player: this.player,
      fill: [255],
      rectMode: CENTER,
      rect: [this.x, this.y, this.w, this.h]
    };
  }
}

export class Puck {
  private x: number;
  private y: number;
  private xspeed = 0;
  private yspeed = 0;
  private r = 12;
  fill: any;
  ellipse: any;

  constructor(
    private readonly canvasWidth: number,
    private readonly canvasHeight: number
  ) {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2;

    this.reset();
  }

  checkPaddleLeft(p: Paddle) {
    if (
      this.y - this.r < p.y + p.h / 2 &&
      this.y + this.r > p.y - p.h / 2 &&
      this.x - this.r < p.x + p.w / 2
    ) {
      if (this.x > p.x) {
        let diff = this.y - (p.y - p.h / 2);
        let rad = radians(45);
        let angle = map(diff, 0, p.h, -rad, rad);
        this.xspeed = 5 * cos(angle);
        this.yspeed = 5 * sin(angle);
        this.x = p.x + p.w / 2 + this.r;
      }
    }
  }
  checkPaddleRight(p: Paddle) {
    if (
      this.y - this.r < p.y + p.h / 2 &&
      this.y + this.r > p.y - p.h / 2 &&
      this.x + this.r > p.x - p.w / 2
    ) {
      if (this.x < p.x) {
        let diff = this.y - (p.y - p.h / 2);
        let angle = map(diff, 0, p.h, radians(225), radians(135));
        this.xspeed = 5 * cos(angle);
        this.yspeed = 5 * sin(angle);
        this.x = p.x - p.w / 2 - this.r;
      }
    }
  }

  update() {
    this.x += this.xspeed;
    this.y += this.yspeed;
    return { fill: [255], ellipse: [this.x, this.y, this.r * 2] };
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2;
    let angle = random(-Math.PI / 4, Math.PI / 4);
    this.xspeed = 5 * Math.cos(angle);
    this.yspeed = 5 * Math.sin(angle);
    const rand = random(0, 1);

    if (rand > 0.5) {
      this.xspeed *= -1;
    }
  }

  edges(left: Paddle, right: Paddle) {
    if (this.y < 0 || this.y > this.canvasHeight) {
      this.yspeed *= -1;
    }

    if (this.x - this.r > this.canvasWidth) {
      left.score++;
      this.reset();
    }

    if (this.x + this.r < 0) {
      right.score++;
      this.reset();
    }
  }

  show(): IPuckView {
    return {
      fill: [255],
      ellipse: [this.x, this.y, this.r * 2]
    };
  }
}

export class Pong {
  readonly puck: Puck;
  readonly left: Paddle;
  readonly right: Paddle;
  leftScore: any;
  rightScore: any;

  constructor(
    private readonly canvasWidth: number,
    private readonly canvasHeight: number,
    firstPlayer: IPlayer,
    secondPlayer: IPlayer
  ) {
    this.puck = new Puck(this.canvasWidth, this.canvasHeight);
    this.left = new Paddle(
      true,
      firstPlayer,
      this.canvasWidth,
      this.canvasHeight
    );
    this.right = new Paddle(
      false,
      secondPlayer,
      this.canvasWidth,
      this.canvasHeight
    );
  }
  player(id: string): Paddle {
    if (this.left.player.id === id) {
      return this.left;
    } else if (this.right.player.id === id) {
      return this.right;
    } else {
      return undefined;
    }
  }

  update() {
    this.puck.checkPaddleRight(this.right);
    this.puck.checkPaddleLeft(this.left);
    this.puck.update();
    this.puck.edges(this.left, this.right);
    this.left.update();
    this.right.update();
  }

  show(): IPongView {
    return {
      puck: this.puck.show(),
      left: this.left.show(),
      right: this.right.show(),
      leftScore: { text: [this.left.score, 32, 40] },
      rightScore: {
        text: [this.right.score, this.canvasWidth - 64, 40]
      }
    };
  }
}
