import { io } from "socket.io-client";
import P5 from "p5";
import "p5/lib/addons/p5.dom";
import "./styles.scss";
import { IPongView } from "./types";

const players: HTMLDivElement = document.querySelector("#players");
const name: HTMLInputElement = document.querySelector(
  "input[name=player_name]"
);

let game: IPongView;

const socket = io("https://7oz8uf-3000.preview.csb.app/");
socket.on("connect", async () => {
  console.log("connection established");
});
socket.on("reconnect", () => {
  console.log("reconnecting...");
  socket.emit("pong.join", name.value);
});
socket.on("pong.cast", (data: IPongView) => {
  game = data;
});
socket.on("pong.members", (members) => {
  console.log("members", members);
  if (members.length === 0) {
    game = null;
  }
  players.innerHTML = members
    .map((m) => {
      const style =
        m.id === socket.id ? ' style="font-weight: bold; color: red" ' : "";
      return `<p ${style}>${m.name}</p>`;
    })
    .join("\n");
});

const joinBtn: HTMLButtonElement = document.querySelector("#join");
joinBtn.addEventListener("click", () => {
  if (!name.value) {
    console.error("Please enter your name");
  } else {
    socket.emit("pong.join", name.value);
    name.setAttribute("readonly", "true");
    joinBtn.setAttribute("disabled", "true");
  }
});

// Creating the sketch itself
const sketch = (p5: P5) => {
  p5.setup = () => {
    // Creating and positioning the canvas
    const canvas = p5.createCanvas(600, 400);
    canvas.parent("app");
    p5.background("black");
  };

  p5.draw = () => {
    p5.background(0);
    if (game) {
      // left paddle
      if (game.left.player.id === socket.id) {
        p5.fill(...([128, 0, 0] as const));
      } else {
        p5.fill(...game.left.fill);
      }
      p5.rectMode(game.left.rectMode);
      p5.rect(...game.left.rect);
      // right paddle
      if (game.right.player.id === socket.id) {
        p5.fill(...([128, 0, 0] as const));
      } else {
        p5.fill(...game.right.fill);
      }
      p5.rectMode(game.right.rectMode);
      p5.rect(...game.right.rect);
      // puck
      p5.fill(...game.puck.fill);
      p5.ellipse(...game.puck.ellipse);
      // score
      p5.fill(255);
      p5.textSize(32);
      p5.text(...game.leftScore.text);
      p5.text(...game.rightScore.text);
    }
  };

  p5.keyReleased = () => {
    if (
      game &&
      (game.left.player.id === socket.id || game.right.player.id === socket.id)
    ) {
      socket.emit("pong.move", null);
    }
  };
  p5.keyPressed = () => {
    if (
      game &&
      ["ArrowUp", "ArrowDown"].includes(p5.key) &&
      (game.left.player.id === socket.id || game.right.player.id === socket.id)
    ) {
      socket.emit("pong.move", p5.key);
    }
  };
};

new P5(sketch);
