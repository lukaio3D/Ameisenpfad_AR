import {
  Color3,
  ICrowd,
  PointerEventTypes,
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
import PlayerController from "./PlayerController";

// Liste aller in der Szene vorhandenen Ameisen
export const allAnts: AntObject[] = [];

// Fügen Sie oben im File (außerhalb von Event-Handlern) eine Map zum Speichern der Klickdaten hinzu:
const enemyAntClickCount = new Map<
  string,
  { count: number; lastClick: number }
>();

export function GameLogic(
  scene: Scene,
  navigationPlugin: RecastJSPlugin,
  crowd: ICrowd
) {
  const uiManager = UIManager.getInstance();

  // Dialogzeile erstellen
  uiManager.displayMessage("Sammle 8 Früchte ein um das Spiel zu gewinnen");

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
    const enemyAntCount = allAnts.filter(
      (ant) => ant instanceof EnemyAnt
    ).length;
    const friendAntCount = allAnts.filter(
      (ant) => ant instanceof FriendAnt
    ).length;
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
      handleAntProximity(enemyAnt);
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
      handleAntProximity(friendAnt);
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
    scene.onAfterRenderObservable.add(() => {
      const playerMesh = playerAnt;
      const antMesh = ant;
      const proximityMesh = playerAnt.getCheckProximityMesh();

      if (
        playerAnt.getActionIsFired() ||
        ant.getActionIsFired() ||
        ant.getBehaviourState() === "runAway"
      ) {
        return;
      }

      // Überprüfen, ob alle benötigten Meshes definiert sind
      else if (!playerMesh || !antMesh || !proximityMesh) {
        return;
      }

      // Überprüfen, ob die PlayerAnt das Ant-Mesh schneidet
      else if (playerMesh.intersectsMesh(antMesh, false)) {
        handleCloseProximity(ant);
        return;
      }
      // Überprüfen, ob das Proximity-Mesh das Ant-Mesh schneidet
      else if (proximityMesh.intersectsMesh(antMesh, false)) {
        handleFarProximity(ant);
        return;
      }
    });
  }

  function handleCloseProximity(ant: NonPlayerAnt) {
    if (ant instanceof EnemyAnt) {
      if (!ant.getIsIdentified()) {
        ant.setBehaviourState("identifyPlayerAnt");
        return;
      } else if (ant.getBehaviourState() !== "runAway") {
        ant.setBehaviourState("attackPlayerAnt");
      }
      return;
    } else if (ant instanceof FriendAnt) {
      if (!ant.getIsIdentified()) {
        ant.setBehaviourState("identifyPlayerAnt");
        return;
      } else if (playerAnt.getHealth() < 100 && !ant.getIsFeeding()) {
        ant.setBehaviourState("feedPlayerAnt");
        return;
      }
    }
  }

  function handleFarProximity(ant: NonPlayerAnt) {
    if (ant instanceof EnemyAnt) {
      ant.setBehaviourState("followPlayerAnt");
      return;
    } else if (ant instanceof FriendAnt) {
      if (!ant.getIsIdentified()) {
        ant.setBehaviourState("followPlayerAnt");
        return;
      }
    }
  }

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === PointerEventTypes.POINTERPICK) {
      const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
      if (!pickedMesh) return;

      if (pickedMesh.name === "Clone of Ant.006") {
        const pickedAnt = allAnts.find((ant) =>
          ant?.getChildMeshes().includes(pickedMesh)
        );
        // Prüfen, ob die Ameise existiert und vom Typ EnemyAnt ist
        if (pickedAnt instanceof EnemyAnt) {
          // Klick-Logik: 3 schnelle Klicks nötig
          const antId = pickedAnt.id; // Annahme: jede Ameise hat eine eindeutige id
          const now = Date.now();
          const clickData = enemyAntClickCount.get(antId) || {
            count: 0,
            lastClick: now,
          };

          // Wenn die Zeit seit dem letzten Klick unter 500ms liegt, erhöhen wir den Zähler, sonst resetten wir ihn
          if (now - clickData.lastClick < 500) {
            // 500ms Schwelle
            clickData.count = clickData.count + 1;
          } else {
            clickData.count = 1;
          }
          clickData.lastClick = now;
          enemyAntClickCount.set(antId, clickData);

          // Nur auslösen, wenn 3 schnelle Klicks vorliegen und die Ameise identifiziert ist
          if (clickData.count >= 2 && pickedAnt.getIsIdentified()) {
            // Zurücksetzen der Klickdaten
            enemyAntClickCount.set(antId, { count: 0, lastClick: now });

            playerAnt.moveAnt(playerAnt.position);
            // Observer, der playerAnt jeden Frame auf pickedAnt schauen lässt
            const lookAtObserver = scene.onBeforeRenderObservable.add(() => {
              playerAnt.lookAt(pickedAnt.position);
            });

            playerAnt.fireAntAction("defend");
            uiManager.displayMessage("Deine Ameise verteidigt sich mit Ameisensäure!");
            PlayerController(scene, playerAnt).disableControl();

            setTimeout(() => {
              pickedAnt.substractEnemyHealth(50);
            }, 5000);

            // Sobald die Aktion beendet ist, entfernen wir den Observer und aktivieren PlayerControls wieder
            playerAnt.onActionFinishedObservable.addOnce(() => {
              scene.onBeforeRenderObservable.remove(lookAtObserver);
              PlayerController(scene, playerAnt).enableControl();
              uiManager.displayMessage("Sammle weiter Früchte ein.");

              // Entferne die angeklickte Ameise aus dem allAnts Array
              if (pickedAnt.getEnemyHealth() <= 0) {
                const index = allAnts.indexOf(pickedAnt);
                if (index > -1) {
                  allAnts.splice(index, 1);
                }
              }
            });
          }
        } else if (pickedAnt instanceof FriendAnt) {
          if (playerAnt.getHealth() < 100) {
            pickedAnt.setBehaviourState("followPlayerAnt");
          }
        }
      }
    }
  });

  // Start Spawner
  let twigsCollected: number = 0;
  const twigsToCollect: number = 10;
  // spawnAntRandomly();

  let twig: ConstructionTwig = spawnConstructionTwig();

  // Kollisionen verwalten
  scene.onAfterRenderObservable.add(() => {
    // Kollisionen zwischen PlayerAnt und Bauzweigen verwalten
    if (twig.intersectsMesh(playerAnt, true)) {
      twigsCollected++;
      uiManager.collectBar.value = (twigsCollected / twigsToCollect) * 100;
      twig.dispose();
      twig = spawnConstructionTwig();
      spawnAntRandomly();
      if (twigsCollected === twigsToCollect) {
        uiManager.toogleWinnerScreen();
        // clearInterval(timer);
      }
    }
    // Game Over bei Health 0
    if (playerAnt.getHealth() <= 0) {
      uiManager.toogleLoserScreen();
      // clearInterval(timer);
    }
  });
}
