import {
  Mesh,
  MeshBuilder,
  RecastJSPlugin,
  Scene,
  TransformNode,
  Vector3,
  IAgentParameters,
  ICrowd,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

export default class BoxObject {
  private box: Mesh;
  private boxNode: TransformNode;
  private boxIndex: number;
  private boxMaterial: StandardMaterial;
  readonly navigationPlugin: RecastJSPlugin;
  readonly crowd: ICrowd;
  readonly agentParams: IAgentParameters = {
    radius: 0.2,
    height: 0.2,
    maxAcceleration: 4.0,
    maxSpeed: 1.0,
    collisionQueryRange: 0.8,
    pathOptimizationRange: 0.0,
    separationWeight: 1.0,
  };

  constructor(scene: Scene, navigationPlugin: RecastJSPlugin, crowd: ICrowd) {
    this.navigationPlugin = navigationPlugin;
    this.crowd = crowd;
    this.createBox(scene);
    this.createBoxParent(scene, this.box);
    this.addBoxToCrowd(crowd);
    this.box.material = this.boxMaterial;
  }

  private createBox(scene: Scene) {
    //Box erstellen
    this.box = MeshBuilder.CreateBox("box", { size: 0.5 }, scene); 
  }

  private createBoxParent(scene: Scene, box: Mesh) {
    //Box Parent erstellen
    this.boxNode = new TransformNode("boxNode", scene);
    this.boxNode.position = new Vector3(0, 0.25, 0);
    this.box.parent = this.boxNode;
  }

  private addBoxToCrowd(crowd: ICrowd) {
    this.boxIndex = crowd.addAgent(
      this.box.position,
      this.agentParams,
      this.boxNode
    );
  }

  public getPosition(): Vector3 {
    return this.box.position;
  }

  public moveBox(pointToMoveTo: Vector3) {
    this.crowd.agentGoto(
      this.boxIndex,
      this.navigationPlugin.getClosestPoint(pointToMoveTo)
    );
  }

  public changeColor(newColor: Color3) {
    this.boxMaterial = new StandardMaterial("boxMaterial", this.box.getScene());
    this.boxMaterial.diffuseColor = newColor;
    this.box.material = this.boxMaterial;
  }

}
