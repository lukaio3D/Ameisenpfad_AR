import { Material, Vector3 } from "@babylonjs/core";
import AntObject from "./AntObject";
import PlayerAnt from "./PlayerAnt";
import { UIManager } from "../Features/UIManager";

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
    super(antType, startPosition, scene, navigationPlugin, crowd);
    this.playerAnt = playerAnt;
    this.addNonPlayerAntBehaviour();
  }



  public getIsIdentified() {
    return this.isIdentified;
  }

  public setIsIdentified(isIdentified: boolean) {
    this.isIdentified = isIdentified;
  }

  public identifyPlayerAnt() {
    this.playerAnt.setIsBeingIdentified(true);
    this.playerAnt.moveAnt(this.position.add(new Vector3(0, 0, 2)));
    this.moveAnt(this.position);
    console.log("Identifiziere Spielerameise");
  }

  public followPlayerAnt() {
    this.moveAnt(this.playerAnt.position);
    console.log("Folge Spielerameise");
  }

  public changeBehaviourState(behaviourState: string) {
    this.behaviourState = behaviourState;
  }

  private addNonPlayerAntBehaviour() {
    let lastbehaviourState;
    this.scene.registerBeforeRender(() => {
      // Switch case to change the behaviour of the ant
      if (this.behaviourState !== lastbehaviourState) {
        switch (this.behaviourState) {
          case "randomMove":
            this.randomMove();
            break;
          case "followPlayerAnt":
            this.followPlayerAnt();
            break;
          case "identifyPlayerAnt":
            this.identifyPlayerAnt();
            break;
        }
        lastbehaviourState = this.behaviourState;
      }
    });
  }
}
