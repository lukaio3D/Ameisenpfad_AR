import {
  RecastJSPlugin,
  Scene,
  Vector3,
  IAgentParameters,
  ICrowd,
  StandardMaterial,
  Color3,
  BoundingInfo,
  SceneLoader,
  AbstractMesh,
  AnimationGroup,
  TransformNode,
  PBRBaseMaterial,
  Material,
} from "@babylonjs/core";

export default class AntObject {
  public ready: Promise<void>;
  private antMesh: AbstractMesh;
  private antTransformNode: TransformNode;
  private antAnimationGroup: AnimationGroup;
  private antIndex: number;
  private antMaterial: Material;
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

  constructor(
    startPosition: Vector3,
    scene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd: ICrowd
  ) {
    this.navigationPlugin = navigationPlugin;
    this.crowd = crowd;
    this.ready = this.initialize(startPosition, scene);
  }

  private async initialize(startPosition: Vector3, scene: Scene) {
    await this.createAntMesh(scene);
    this.setPosition(startPosition);
    this.addAntToCrowd(this.crowd);
    this.antMesh.showBoundingBox = false;
    this.antMesh.setBoundingInfo(
      new BoundingInfo(
        new Vector3(-0.5, -0.25, -0.5),
        new Vector3(0.5, 0.25, 0.5)
      )
    );
    this.rotateAntOnMove(scene);
    this.animateAntOnMove(scene);
  }

  private async createAntMesh(scene: Scene) {
    //Box erstellen
    const result = await SceneLoader.ImportMeshAsync(
      null,
      "assets/",
      "240920_AntAnim.glb",
      scene
    );
    this.antMesh = result.meshes[0];
    this.antTransformNode = new TransformNode("antTransformNode", scene);
    this.antMesh.parent = this.antTransformNode;

    // Skalierung einstellen
    // this.antMesh.scaling = new Vector3(2, 2, 2);

    // Optionale Rotation
    this.antMesh.rotate(Vector3.Up(), Math.PI / 2);

    //Animation zuweisen
    if (result.animationGroups.length > 0) {
      this.antAnimationGroup = result.animationGroups[0];
      this.antAnimationGroup.stop(true);
    }
    //Material zuweisen
    this.antMaterial = this.antMesh.material as PBRBaseMaterial;
  }

  private addAntToCrowd(crowd: ICrowd) {
    this.antIndex = crowd.addAgent(
      this.antTransformNode.position,
      this.agentParams,
      this.antTransformNode
    );
  }

  private rotateAntOnMove(scene: Scene) {
    scene.onBeforeRenderObservable.add(() => {
      this.antTransformNode.lookAt(
        this.crowd
          .getAgentVelocity(this.antIndex)
          .add(this.antTransformNode.position)
      );
    });
  }

  private animateAntOnMove(scene: Scene) {
    scene.onBeforeRenderObservable.add(() => {
      this.antAnimationGroup.start(true);
      this.antAnimationGroup.loopAnimation = true;
      this.updateAnimationSpeed();
    });
  }

  private updateAnimationSpeed() {
    // Agentengeschwindigkeit abrufen
    const velocity = this.crowd.getAgentVelocity(this.antIndex);

    // Geschwindigkeit berechnen (Betrag des Vektors)
    const speed = velocity.length() * 1.5;

    // speedRatio setzen (Multiplizieren Sie ggf. mit einem Faktor zur Anpassung)
    if (this.antAnimationGroup) {
      this.antAnimationGroup.speedRatio = speed * 0.5; // 0.5 ist ein Beispiel-Faktor
    }
  }

  public getPosition(): Vector3 {
    return this.antTransformNode.position;
  }

  public setPosition(newPosition: Vector3) {
    if (this.antMesh) {
      this.antTransformNode.position = newPosition;
    }
  }

  public getMesh(): AbstractMesh {
    return this.antMesh;
  }

  public moveAnt(pointToMoveTo: Vector3) {
    this.crowd.agentGoto(
      this.antIndex,
      this.navigationPlugin.getClosestPoint(pointToMoveTo)
    );
  }

  public randomMove() {
    setInterval(() => {
      this.moveAnt(this.createRandomPointOnNavMesh());
    }, Math.random() * 3000 + 4000);
  }

  public getMaterial(): Material {
    return this.antMaterial;
  }

  public changeColor(newColor: Color3) {
    // Neues Material erstellen
    const newAntMaterial = new StandardMaterial(
      "newAntMaterial",
      this.antMesh.getScene()
    );
    newAntMaterial.diffuseColor = newColor;

    // Alle untergeordneten Meshes abrufen und Material setzen
    const allMeshes = this.antMesh.getChildMeshes();

    allMeshes.forEach((mesh) => {
      mesh.material = newAntMaterial;
    });
  }

  public changeMaterial(newMaterial: Material) {
    // Alle untergeordneten Meshes abrufen und Material setzen
    const allMeshes = this.antMesh.getChildMeshes();

    allMeshes.forEach((mesh) => {
      mesh.material = newMaterial;
    });
  }

  public createRandomPointOnNavMesh() {
    let xCoords = Math.random() * 5 * (Math.random() > 0.5 ? -1 : 1);
    let zCoords = Math.random() * 5 * (Math.random() > 0.5 ? -1 : 1);
    return this.navigationPlugin.getClosestPoint(
      new Vector3(xCoords, 0, zCoords)
    );
  }
}
