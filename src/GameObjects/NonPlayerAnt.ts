import { Color3, Nullable, Observer, Scene, Vector3 } from "@babylonjs/core";
import AntObject from "./AntObject";
import PlayerAnt from "./PlayerAnt";
import PlayerController from "../Features/PlayerController";
import { UIManager } from "../Features/UIManager";

export default class NonPlayerAnt extends AntObject {
  protected playerAnt: PlayerAnt;
  protected isColliding: boolean = false;
  protected isIdentified: boolean = false;
  protected identifierColor: Color3;
  private behaviourState: string = "randomMove";
  private isRandomMoving: boolean = false;
  private isRunningAway: boolean = false;
  private isIdentifying: boolean = false;
  private isAttacking: boolean = false;
  private isFeeding: boolean = false;
  private uiManager = UIManager.getInstance();
  public antHealth: number = 100;

  constructor(
    antType: string = "NonPlayerAnt",
    startPosition,
    scene,
    navigationPlugin,
    crowd,
    playerAnt: PlayerAnt
  ) {
    super(antType, 0.5, startPosition, scene, navigationPlugin, crowd);
    this.playerAnt = playerAnt;
    this.addNonPlayerAntBehaviour();
  }

  public getIsIdentified() {
    return this.isIdentified;
  }

  public setIsIdentified(isIdentified: boolean) {
    this.isIdentified = isIdentified;
  }

  public getIsIdefitying() {
    return this.isIdentifying;
  }

  public setIsIdentifying(isIdentifying: boolean) {
    this.isIdentifying = isIdentifying;
  }

  public getBehaviourState() {
    return this.behaviourState;
  }

  public setBehaviourState(behaviourState: string) {
    this.behaviourState = behaviourState;
  }

  public getIsAttacking() {
    return this.isAttacking;
  }

  public setIsAttacking(isAttacking: boolean) {
    this.isAttacking = isAttacking;
  }

  public getIsFeeding() {
    return this.isFeeding;
  }

  public identifyPlayerAnt() {
    // Bewegen Sie die Ameise zur festen Position in der Nähe der Spielerameise
    this.uiManager.displayMessage(
      "Über das Betrillern identifizieren sich Ameisen."
    );
    PlayerController(this.scene, this.playerAnt).disableControl();
    this.fireAntAction("betrillernNPC");
    this.playerAnt.fireAntAction("betrillernPlayer");

    // Position the NonPlayerAnt directly in front of the PlayerAnt
    const directionToPlayer = this.playerAnt.position
      .subtract(this.position)
      .normalize();
    const offsetDistance = 0.4; // Adjust as needed
    const newPosition = this.playerAnt.position.subtract(
      directionToPlayer.scale(offsetDistance)
    );
    this.moveAnt(newPosition);
    this.lookAt(this.playerAnt.position);

    // Rotate the PlayerAnt to face the NonPlayerAnt
    this.playerAnt.moveAnt(this.playerAnt.position);
    this.playerAnt.lookAt(this.position);
    this.isIdentifying = true;

    setTimeout(() => {
      this.changeColor(this.identifierColor);
      if (this.identifierColor.r === 1) {
        this.uiManager.displayMessage("Es ist eine feindliche Ameise");
      } else {
        this.uiManager.displayMessage("Es ist eine freundliche Ameise");
      }
    }, 8000); // Farbe ändern

    // Nach Ablauf der Zeit den Zustand ändern
    setTimeout(() => {
      this.setBehaviourState("runAway");
      this.uiManager.displayMessage("Sammle weiter Früchte ein.");
      PlayerController(this.scene, this.playerAnt).enableControl();
      this.isIdentified = true;
      this.isIdentifying = false;
    }, 11500); // Wechselt nach 3,5 Sekunden zu "runAway"
  }

  public followPlayerAnt() {
    this.moveAnt(this.playerAnt.position);
  }

  public changeBehaviourState(behaviourState: string) {
    this.behaviourState = behaviourState;
  }

  public runAwayFromPlayerAnt() {
    let randomPosition = this.createRandomPointOnNavMesh();
    this.moveAnt(randomPosition);

    // Nach 5 Sekunden wird der Zustand zurückgesetzt
    setTimeout(() => {
      this.changeBehaviourState("randomMove");
      this.isAttacking = false;
      this.isFeeding = false;
      this.isRunningAway = false;
    }, 5000);
  }

  public healPlayerAnt() {
    // Ihre Heilungslogik
    this.uiManager.displayMessage("Die freundliche Ameise übergibt Nahrung.");
    PlayerController(this.scene, this.playerAnt).disableControl();
    this.isFeeding = true;
    this.fireAntAction("feeding");
    this.playerAnt.fireAntAction("receiveFood");
    // Position the NonPlayerAnt directly in front of the PlayerAnt
    const directionToPlayer = this.playerAnt.position
      .subtract(this.position)
      .normalize();
    const offsetDistance = 0.37; // Adjust as needed
    const newPosition = this.playerAnt.position.subtract(
      directionToPlayer.scale(offsetDistance)
    );
    this.moveAnt(newPosition);
    this.lookAt(this.playerAnt.position);

    // Rotate the PlayerAnt to face the NonPlayerAnt
    this.playerAnt.moveAnt(this.playerAnt.position);
    this.playerAnt.lookAt(this.position);

    // After the stand duration, change to "runAway" state
    setTimeout(() => {
      // Apply damage and update the health bar
      if (this.playerAnt.getHealth() < 60) {
        this.playerAnt.setHealth(this.playerAnt.getHealth() + 40);
      } else {
        this.playerAnt.setHealth(100);
      }
      UIManager.getInstance().setHealthBar(this.playerAnt.getHealth());
      this.changeBehaviourState("runAway");
      this.uiManager.displayMessage("Sammle weiter Früchte ein.");
      PlayerController(this.scene, this.playerAnt).enableControl();
    }, 10500);
  }

  public attackPlayerAnt() {
    if (!this.isAttacking) {
      // Füge hier einen Observer hinzu, der jeden Frame die feindliche Ameise den PlayerAnt anblicken lässt
      const lookAtObserver = this.scene.onBeforeRenderObservable.add(() => {
        this.lookAt(this.playerAnt.position);
      });
      this.fireAntAction("attack");
      this.uiManager.displayMessage("Die feindliche Ameise greift an.");
      // Bewegung einfrieren
      this.moveAnt(this.playerAnt.position);
      this.isAttacking = true;

      // Sobald die Aktion beendet ist, entferne den Observer
      this.onActionFinishedObservable.addOnce(() => {
        this.scene.onBeforeRenderObservable.remove(lookAtObserver);
        this.isAttacking = false;
        this.playerAnt.setHealth(this.playerAnt.getHealth() - 34);
        UIManager.getInstance().setHealthBar(this.playerAnt.getHealth());
        this.changeBehaviourState("runAway");
        this.uiManager.displayMessage("Sammle weiter Früchte ein.");
      });
    }
  }

  public deleteAnt() {
    this.dispose();
    this.scene.unregisterBeforeRender(this.renderLoopBehaviour);
    this.setBehaviourState("randomMove");
  }

  private previousBehaviourState: string = "";

  private renderLoopBehaviour = () => {
    if (this.antHealth >= 0) {
      switch (this.behaviourState) {
        case "randomMove":
          // randomMove sollte nur einmal gestartet werden
          if (!this.isRandomMoving) {
            this.randomMove(true);
            this.isRandomMoving = true;
          }
          break;

        case "followPlayerAnt":
          // Muss bei jedem Frame aktualisiert werden
          this.followPlayerAnt();
          this.randomMove(false); // Falls nötig
          this.isRandomMoving = false; // Falls nötig
          break;

        case "identifyPlayerAnt":
          // Kann einmalig sein, je nach Implementierung
          if (!this.isIdentifying) {
            this.identifyPlayerAnt();
            this.randomMove(false); // Falls nötig
          }
          break;

        case "runAway":
          // Muss bei jedem Frame aktualisiert werden
          if (!this.isRunningAway) {
            this.isRunningAway = true;
            this.runAwayFromPlayerAnt();
          }
          this.randomMove(false); // Falls nötig
          this.isRandomMoving = false; // Falls nötig
          break;

        case "attackPlayerAnt":
          // Soll nur einmal ausgeführt werden, wenn der Zustand auf "attackPlayerAnt" geändert wird
          if (!this.isAttacking) {
            this.attackPlayerAnt();
            this.randomMove(false); // Falls nötig
            this.isRandomMoving = false; // Falls nötig
          }
          break;

        case "feedPlayerAnt":
          if (!this.isFeeding) {
            this.healPlayerAnt();
            this.randomMove(false); // Falls nötig
            this.isRandomMoving = false; // Falls nötig
          }
          break;

        default:
          // Standardverhalten oder Fehlerbehandlung
          break;
      }
    }
  };

  public addNonPlayerAntBehaviour() {
    this.scene.registerBeforeRender(this.renderLoopBehaviour);
  }
}
