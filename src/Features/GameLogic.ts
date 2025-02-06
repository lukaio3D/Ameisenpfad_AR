import {
  Color3,
  ICrowd,
  RecastJSPlugin,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { UIManager } from "./UIManager";
import PlayerAnt from "../GameObjects/PlayerAnt";
import EnemyAnt from "../GameObjects/EnemyAnt";
import FriendAnt from "../GameObjects/FriendAnt";
import ConstructionTwig from "../GameObjects/ConstructionTwig";
import AntObject from "../GameObjects/AntObject";
import NonPlayerAnt from "../GameObjects/NonPlayerAnt";

// Liste aller in der Szene vorhandenen Ameisen
export const allAnts: AntObject[] = [];

export function GameLogic(
  scene: Scene,
  navigationPlugin: RecastJSPlugin,
  crowd: ICrowd
) {
  const uiManager = UIManager.getInstance();

  // Dialogzeile erstellen
  uiManager.dialogzeile.text = `Sammle die Früchte ein!`;

  // Timer erstellen in Sekunden
  // let countDown: number = 240;

  // let timer = setInterval(() => {
  //   // Game Over
  //   if (countDown === 0) {
  //     uiManager.setOverlayText("Spiel verloren! - Zeit abgelaufen");
  //     clearInterval(timer);
  //   }

  //   // Timer aktualisieren
  //   let minutes: string = Math.floor(countDown / 60).toString();
  //   let seconds: string;

  //   if (countDown % 60 < 10) {
  //     seconds = "0" + (countDown % 60).toString();
  //   } else {
  //     seconds = (countDown % 60).toString();
  //   }
  //   uiManager.timer.text = minutes + ":" + seconds;
  //   countDown = countDown - 1;
  // }, 1000);

  //Player Box
  const playerAnt = new PlayerAnt(
    new Vector3(0, 0, 1),
    scene,
    navigationPlugin,
    crowd
  );

  // Funktion zum zufälligen Spawnen von Ameisen innerhalb eines bestimmten Bereichs
  const spawnAntRandomly = (
    maxEnemyAnts: number = 1,
    maxFriendAnts: number = 1
  ) => {
    const enemyAntCount = allAnts.filter((ant) => ant instanceof EnemyAnt).length;
    const friendAntCount = allAnts.filter((ant) => ant instanceof FriendAnt).length;
    const randomNumber = Math.random();

    // Zufällige x-Koordinate zwischen -2.5 und 2.5
    const spawnX = Math.random() * (2.5 - -2.5) + -2.5;
    const spawnY = 0;
    const spawnZ = 5;
    const spawnPoint = new Vector3(spawnX, spawnY, spawnZ);

    // Feindliche Ameise (EnemyAnt) spawnen, wenn Platz ist
    if (randomNumber > 0.5 && enemyAntCount < maxEnemyAnts) {
      const enemyAnt = new EnemyAnt(
        spawnPoint,
        scene,
        navigationPlugin,
        crowd,
        playerAnt
      );
      allAnts.push(enemyAnt);
    }
    // Freundliche Ameise (FriendAnt) spawnen, wenn Platz ist
    else if (friendAntCount < maxFriendAnts) {
      const friendAnt = new FriendAnt(
        spawnPoint,
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

  function handleAntProximity(ant: NonPlayerAnt) {
    const playerMesh = playerAnt;
    const antMesh = ant;
    const proximityMesh = playerAnt.getCheckProximityMesh();

    if (
      ant.getBehaviourState() === "attackPlayerAnt" ||
      ant.getBehaviourState() === "identifyPlayerAnt"
    ) {
      return;
    }

    // Überprüfen, ob alle benötigten Meshes definiert sind
    if (!playerMesh || !antMesh || !proximityMesh) {
      return;
    }

    // Überprüfen, ob die PlayerAnt das Ant-Mesh schneidet
    if (playerMesh.intersectsMesh(antMesh, false)) {
      handleCloseProximity(ant);
    }
    // Überprüfen, ob das Proximity-Mesh das Ant-Mesh schneidet
    else if (proximityMesh.intersectsMesh(antMesh, false)) {
      handleFarProximity(ant);
    }
  }

  function handleCloseProximity(ant: NonPlayerAnt) {
    if (ant instanceof EnemyAnt) {
      if (!ant.getIsIdentified()) {
        ant.setBehaviourState("identifyPlayerAnt");
      } else if (ant.getBehaviourState() !== "runAway") {
          ant.setBehaviourState("attackPlayerAnt");
      }
    } else if (ant instanceof FriendAnt) {
      if (!ant.getIsIdentified() ) {
        ant.setBehaviourState("identifyPlayerAnt");
      }
      else if(playerAnt.getHealth() < 100 && !ant.getIsFeeding()) {
        console.log("Feeding");
        ant.setBehaviourState("feedPlayerAnt");
      }
    }
  }

  function handleFarProximity(ant: NonPlayerAnt) {
    if (ant instanceof EnemyAnt) {
      ant.setBehaviourState("followPlayerAnt");
    } else if (ant instanceof FriendAnt) {
      if (!ant.getIsIdentified()) {
        ant.setBehaviourState("followPlayerAnt");
      }
    }
  }

  // Start Spawner
  let twigsCollected: number = 0;
  const twigsToCollect: number = 10;
  // spawnAntRandomly();

  let twig: ConstructionTwig = spawnConstructionTwig();

  // Kollisionen verwalten
  scene.onAfterRenderObservable.add(() => {
    // Kollisionen zwischen PlayerAnt und NonPlayerAnts verwalten
    allAnts.forEach((ant) => {
      if (ant instanceof NonPlayerAnt) {
        handleAntProximity(ant);
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
        // clearInterval(timer);
      }
    }
    // Game Over bei Health 0
    if (playerAnt.getHealth() <= 0) {
      uiManager.setOverlayText("Spiel verloren! - Kein Leben mehr");
      // clearInterval(timer);
    }
  });
}
