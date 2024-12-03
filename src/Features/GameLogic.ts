import { ICrowd, RecastJSPlugin, Scene, Vector3 } from "@babylonjs/core";
import { UIManager } from "./UIManager";
import PlayerAnt from "../GameObjects/PlayerAnt";
import EnemyAnt from "../GameObjects/EnemyAnt";
import FriendAnt from "../GameObjects/FriendAnt";
import ConstructionTwig from "../GameObjects/ConstructionTwig";

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
  let countDown: number = 120;

  let timer = setInterval(() => {
    // Game Over
    if (countDown === 0) {
      uiManager.setOverlayText("Spiel verloren! - Zeit abgelaufen");
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

  // Funktion zum zufälligen Spawnen von Ameisen
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

  // Funktion zum Spawnen von Bauzweigen
  const spawnConstructionTwig = () => {
    return new ConstructionTwig(
      scene,
      playerAnt.createRandomPointOnNavMesh(),
      new Vector3(0, Math.random() * 360, 0)
    );
  };

  // Start Spawner
  let twigsCollected: number = 0;
  const twigsToCollect: number = 10;

  let twig = spawnConstructionTwig();
  spawnAntRandomly();

  scene.onAfterRenderObservable.add(() => {
    if (playerAnt.getHealth() <= 0) {
      uiManager.setOverlayText("Spiel verloren! - Kein Leben mehr");
      clearInterval(timer);
    }
    if (twig.intersectsMesh(playerAnt.getMesh(), true)) {
      twigsCollected++;
      uiManager.collectBar.value = (twigsCollected / twigsToCollect) * 100;
      twig.dispose();
      twig = spawnConstructionTwig();
      spawnAntRandomly();
      if (twigsCollected === twigsToCollect) {
        uiManager.setOverlayText("Spiel gewonnen!");
        clearInterval(timer);
      }
    }
  });
}
