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
  Material,
  Mesh,
} from "@babylonjs/core";

export default class AntObject extends Mesh {
  public ready: Promise<void>;
  private antAnimationGroup: AnimationGroup;
  private antIndex: number;
  private antMesh: AbstractMesh;
  protected antSpeed: number = 0.5;
  protected scene: Scene;
  navigationPlugin: RecastJSPlugin;
  crowd: ICrowd;
  protected agentParams: IAgentParameters = {
    radius: 0.05,
    height: 0.05,
    maxAcceleration: 4.0,
    maxSpeed: 0.5,
    collisionQueryRange: 0.3,
    pathOptimizationRange: 0.0,
    separationWeight: 1.0,
  };
  // Deklaration der Klassenvariable
  private randomMoveInterval;

  constructor(
    antType: string,
    antSpeed: number,
    startPosition: Vector3,
    assignedScene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd: ICrowd
  ) {
    super(antType, assignedScene);
    this.antSpeed = antSpeed;
    this.agentParams.maxSpeed = this.antSpeed;
    this.navigationPlugin = navigationPlugin;
    this.crowd = crowd;
    this.scene = assignedScene;
    this.position.copyFrom(startPosition);
    this.ready = this.initialize();
  }

  private async initialize() {
    await this.createAntMesh(this.scene);
    this.addAntToCrowd(this.crowd);
    this.showBoundingBox = false;
    this.setBoundingInfo(
      new BoundingInfo(
        new Vector3(-0.25, -0.25, -0.5),
        new Vector3(0.25, 0.25, 0.5)
      )
    );
    this.rotateAntOnMove(this.scene);
    this.animateAntOnMove(this.scene);
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

    // Parent zuweisen
    this.antMesh.parent = this;

    this.antMesh.position = Vector3.Zero();

    // Skalierung einstellen
    this.scaling = new Vector3(0.7, 0.7, 0.7);

    // Optionale Rotation
    this.antMesh.rotate(Vector3.Up(), Math.PI / 2);

    //Animation zuweisen
    if (result.animationGroups.length > 0) {
      this.antAnimationGroup = result.animationGroups[0];
      this.antAnimationGroup.stop(true);
    }
  }

  private addAntToCrowd(crowd: ICrowd) {
    this.antIndex = crowd.addAgent(this.position, this.agentParams, this);
  }

  private rotateAntOnMove(scene: Scene) {
    scene.onBeforeRenderObservable.add(() => {
      if (this.crowd.getAgentVelocity(this.antIndex).length() > 0.2) {
        this.lookAt(
          this.crowd.getAgentVelocity(this.antIndex).add(this.position)
        );
      }
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
    const speed = velocity.length() * 1.3;

    // speedRatio setzen (Multiplizieren Sie ggf. mit einem Faktor zur Anpassung)
    if (this.antAnimationGroup) {
      this.antAnimationGroup.speedRatio = speed; // 0.5 ist ein Beispiel-Faktor
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

  public randomMove(setEnabled: boolean = true) {
    if (setEnabled) {
      if (this.randomMoveInterval) {
        // Falls bereits ein Intervall läuft, nicht erneut starten
        return;
      }
      this.randomMoveInterval = setInterval(() => {
        this.moveAnt(this.createRandomPointOnNavMesh());
      }, Math.random() * 3000 + 4000);
    } else {
      if (this.randomMoveInterval) {
        clearInterval(this.randomMoveInterval);
        this.randomMoveInterval = null;
      }
    }
  }

  public getMaterial(): Material {
    return this.antMesh.material;
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
    let xCoords = Math.random() * 2.5 * (Math.random() > 0.5 ? -1 : 1);
    let zCoords = Math.random() * 5;
    return this.navigationPlugin.getClosestPoint(
      new Vector3(xCoords, 0, zCoords)
    );
  }
}
