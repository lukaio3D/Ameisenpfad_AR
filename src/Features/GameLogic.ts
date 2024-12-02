import { ICrowd, RecastJSPlugin, Scene, Vector3 } from "@babylonjs/core";
import { UIManager } from "./UIManager";
import PlayerAnt from "../GameObjects/PlayerAnt";
import EnemyAnt from "../GameObjects/EnemyAnt";
import FriendAnt from "../GameObjects/FriendAnt";
import ConstructionTwig from "../GameObjects/ConstructionTwig";
import TreeStump from "../GameObjects/TreeStump";

export function GameLogic(
  playerAnt: PlayerAnt,
  scene: Scene,
  navigationPlugin: RecastJSPlugin,
  crowd: ICrowd
) {
  const uiManager = UIManager.getInstance();

  // Dialogzeile erstellen
  uiManager.dialogzeile.text = `Ich bin ein Textblock`;

  // Timer erstellen in Sekunden
  let countDown: number = 600;

  let timer = setInterval(() => {
    // Game Over
    if (countDown === 0) {
      uiManager.dialogzeile.text = `Game Over`;
      clearInterval(timer);
    }

    // Timer aktualisieren
    let minutes: string = Math.floor(countDown / 60).toString();
    let seconds: string;

    if (countDown % 60 < 10) {
      seconds = "0" + (countDown % 60).toString();
    } else {
      seconds = (countDown % 60).toString();
    }
    uiManager.timer.text = minutes + ":" + seconds;
    countDown = countDown - 1;
  }, 1000);

  const spawnAntRandomly = () => {
    let randomNumber = Math.random();
    if (randomNumber > 0.5) {
      new EnemyAnt(
        playerAnt.createRandomPointOnNavMesh(),
        scene,
        navigationPlugin,
        crowd,
        playerAnt
      );
    } else {
      new FriendAnt(
        playerAnt.createRandomPointOnNavMesh(),
        scene,
        navigationPlugin,
        crowd,
        playerAnt
      );
    }
  };

  const spawnConstructionTwig = () => {
    new ConstructionTwig(
      scene,
      playerAnt.createRandomPointOnNavMesh(),
      new Vector3(0, Math.random() * 360, 0)
    );
  };

  // Ants spawnen
  scene.registerBeforeRender(() => {
  if (countDown % 60 === 0) {
    spawnAntRandomly();
    spawnConstructionTwig();
  }});
}
