import { Color3, ICrowd, RecastJSPlugin, Scene, Vector3 } from "@babylonjs/core";
import { UIManager } from "./UIManager";
import PlayerAnt from "../GameObjects/PlayerAnt";
import EnemyAnt from "../GameObjects/EnemyAnt";
import FriendAnt from "../GameObjects/FriendAnt";
import ConstructionTwig from "../GameObjects/ConstructionTwig";
import AntObject from "../GameObjects/AntObject";

// Liste aller in der Szene vorhandenen Ameisen
export const allAnts: AntObject[] = [];

export function GameLogic(
  scene: Scene,
  navigationPlugin: RecastJSPlugin,
  crowd: ICrowd
) {
  const uiManager = UIManager.getInstance();

  // Dialogzeile erstellen
  uiManager.dialogzeile.text = `Ich bin ein Textblock`;

  // Timer erstellen in Sekunden
  let countDown: number = 240;

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

  //Player Box
  const playerAnt = new PlayerAnt(
    new Vector3(0, 0, 1),
    scene,
    navigationPlugin,
    crowd
  );

  // Funktion zum zufälligen Spawnen von Ameisen
  const spawnAntRandomly = () => {
    let randomNumber = Math.random();
    if (randomNumber > 0.5) {
      const enemyAnt = new EnemyAnt(
        playerAnt.createRandomPointOnNavMesh(),
        scene,
        navigationPlugin,
        crowd,
        playerAnt
      );
      allAnts.push(enemyAnt);
    } else {
      const friendAnt = new FriendAnt(
        playerAnt.createRandomPointOnNavMesh(),
        scene,
        navigationPlugin,
        crowd,
        playerAnt
      );
      allAnts.push(friendAnt);
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
  setTimeout(() => {
    spawnAntRandomly();
  }, 1000);

  scene.onAfterRenderObservable.add(() => {
    // Kollisionen zwischen PlayerAnt und NonPlayerAnts verwalten
    allAnts.forEach((ant) => {

      // Kollision in Zone 2
      if (playerAnt.intersectsMesh(ant, false)) {
        // Kollision mit Feindlicher Ameise in Zone 2
        if (ant instanceof EnemyAnt) {
          console.log("Feindliche Ameise in Zone 2");
          // Farbe ändern, wenn noch nicht identifiziert
          if(!ant.getIsIdentified()) {
          ant.changeColor(new Color3(1, 0, 0));
          ant.setIsIdentified(true);
        }
        }
        // Kollision mit Freundlicher Ameise in Zone 2
        else if (ant instanceof FriendAnt) {
          console.log("Freundliche Ameise in Zone 2");
          // Farbe ändern, wenn noch nicht identifiziert
          if(!ant.getIsIdentified()) {
          ant.changeColor(new Color3(0, 1, 0));
          ant.setIsIdentified(true);
          }
        }
      }
      // Kollision in Zone 1
      else if (playerAnt.getCheckProximityMesh().intersectsMesh(ant, false)) {
        if (ant instanceof EnemyAnt) {
          console.log("Feindliche Ameise in Zone 1");
        } else if (ant instanceof FriendAnt) {
          console.log("Freundliche Ameise in Zone 1");
        }
      }
    });

    // Kollisionen zwischen PlayerAnt und Bauzweigen verwalten
    if (twig.intersectsMesh(playerAnt, true)) {
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
    // Game Over bei Health 0
    if (playerAnt.getHealth() <= 0) {
      uiManager.setOverlayText("Spiel verloren! - Kein Leben mehr");
      clearInterval(timer);
    }
  });
}
