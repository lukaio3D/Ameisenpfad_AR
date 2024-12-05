import { Vector3 } from "@babylonjs/core";
import AntObject from "./AntObject";
import PlayerAnt from "./PlayerAnt";

export default class NonPlayerAnt extends AntObject {
  protected playerAnt: PlayerAnt;
  protected isColliding: boolean = false;
  protected isIdentified: boolean = false;
  private behaviourState: string = "randomMove";

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

  public getBehaviourState() {
    return this.behaviourState;
  }

  public setBehaviourState(behaviourState: string) {
    this.behaviourState = behaviourState;
  }

  public identifyPlayerAnt() {
    // Bewegen Sie die Ameise zur festen Position in der Nähe der Spielerameise
    const targetPosition = this.playerAnt.position.add(new Vector3(2, 0, 0)); // Beispielversatz
    this.moveAnt(targetPosition);

    // Drehen Sie die Ameise zur Spielerameise
    this.lookAt(this.playerAnt.position);

    // Animation abspielen (falls vorhanden)
    // if (this.antAnimationGroup) {
    //   this.antAnimationGroup.play(true);
    // }

    // Nach Abschluss der Identifikation den Zustand ändern
    setTimeout(() => {
      this.setBehaviourState("randomMove");
      this.isIdentified = true;
    }, 5000); // Wechselt nach 5 Sekunden zurück zu "randomMove"
  }

  public followPlayerAnt() {
    this.moveAnt(this.playerAnt.position);
  }

  public changeBehaviourState(behaviourState: string) {
    this.behaviourState = behaviourState;
  }

  public addNonPlayerAntBehaviour() {
    let isRandomMoving = false;
    let isIdentifying = false;

    this.scene.registerBeforeRender(() => {
      switch (this.behaviourState) {
        case "randomMove":
          if (!isRandomMoving) {
            console.log("Random Move");
            this.randomMove();
            isRandomMoving = true;
            isIdentifying = false;
          }
          break;

        case "followPlayerAnt":
          // Position der Spielerameise bei jedem Frame aktualisieren
          this.moveAnt(this.playerAnt.position);
          isRandomMoving = false;
          isIdentifying = false;
          break;

        case "identifyPlayerAnt":
          if (!isIdentifying) {
            console.log("Identify Player Ant");
            this.identifyPlayerAnt();
            isIdentifying = true;
            isRandomMoving = false;
          }
          // Optional: Zusätzliche Animationen oder Bewegungen einfügen
          break;

        default:
          // Standardverhalten oder Fehlerbehandlung
          break;
      }
    });
  }
}
