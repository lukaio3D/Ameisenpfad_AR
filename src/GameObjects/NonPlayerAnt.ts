import { Color3, Vector3 } from "@babylonjs/core";
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
  private isIdentifying: boolean = false;
  private isAttacking: boolean = false;

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

  public identifyPlayerAnt() {
    // Bewegen Sie die Ameise zur festen Position in der Nähe der Spielerameise
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
    }, 4300); // Farbe ändern

    // Nach Ablauf der Zeit den Zustand ändern
    setTimeout(() => {
      this.setBehaviourState("runAway");
      PlayerController(this.scene, this.playerAnt).enableControl();
      this.isIdentified = true;
      this.isIdentifying = false;
    }, 5000); // Wechselt nach 3,5 Sekunden zu "runAway"
  }

  public followPlayerAnt() {
    this.moveAnt(this.playerAnt.position);
  }

  public changeBehaviourState(behaviourState: string) {
    this.behaviourState = behaviourState;
  }

  public runAwayFromPlayerAnt() {
    // Richtung von der Spielerameise weg berechnen

    const directionAway = this.position
      .subtract(this.playerAnt.position)
      .normalize();
    // Zielposition bestimmen, die außerhalb der Proximity-Zone liegt
    const escapeDistance = 10; // Distanz zum Weglaufen
    const targetPosition = this.position.add(
      directionAway.scale(escapeDistance)
    );
    this.moveAnt(targetPosition);
    setTimeout(() => {
      this.changeBehaviourState("randomMove");
      this.isAttacking = false;
    }, 5000); // Dauer des Weglaufens
  }

  public healPlayerAnt() {
    // Ihre Heilungslogik
    if (this.playerAnt.getHealth() < 80) {
      this.playerAnt.setHealth(this.playerAnt.getHealth() + 20);
    } else {
      this.playerAnt.setHealth(100);
    }
    UIManager.getInstance().setHealthBar(this.playerAnt.getHealth());
  }

  public attackPlayerAnt() {
    if (!this.isAttacking) {
      this.fireAntAction("attack");
      this.playerAnt.setHealth(this.playerAnt.getHealth() - 20);
      UIManager.getInstance().setHealthBar(this.playerAnt.getHealth());
    }
    this.isAttacking = true;
    // Ihre bestehende Angriffslogik

    // Nach dem Angriff zum "runAway"-Zustand wechseln
    setTimeout(() => {
      this.changeBehaviourState("runAway"), 1000;
    });
  }

  private previousBehaviourState: string = "";

  public addNonPlayerAntBehaviour() {
    this.scene.registerBeforeRender(() => {
      console.log(this.behaviourState);
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
          this.runAwayFromPlayerAnt();
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

        default:
          // Standardverhalten oder Fehlerbehandlung
          break;
      }
    });
  }
}
