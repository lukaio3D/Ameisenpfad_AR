import {
  Scene,
  Vector3,
  AnimationGroup,
  TransformNode,
  SceneLoader,
  StandardMaterial,
  PBRMaterial,
  Color3,
  IAgentParameters,
  RecastJSPlugin,
  RecastJSCrowd,
  MeshBuilder,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export default class Ant {
  private scene: Scene;
  private antTransformNode: TransformNode;
  private antAnimationGroup: AnimationGroup;
  private antMaterial: StandardMaterial;
  private navigationPlugin: RecastJSPlugin;
  private crowd: RecastJSCrowd;
  private agentIndex: number;

  constructor(
    scene: Scene,
    position: Vector3,
    navigationPlugin: RecastJSPlugin,
    crowd: RecastJSCrowd
  ) {
    this.scene = scene;
    this.navigationPlugin = navigationPlugin;
    this.crowd = crowd;
    this.loadModel(position);
  }

  public getTransformNode(): TransformNode {
    return this.antTransformNode;
  }

  public getAnimationGroup(): AnimationGroup {
    return this.antAnimationGroup;
  }

  private async loadModel(position: Vector3) {
    // Modell laden
    const container = await SceneLoader.LoadAssetContainerAsync(
      "assets/",
      "240920_AntAnim.glb",
      this.scene
    );

    // TransformNode erstellen und Meshes anhängen
    this.antTransformNode = new TransformNode("antTransformNode", this.scene);
    container.meshes.forEach((mesh) => {
      if (mesh.name !== "__root__") {
        mesh.setParent(this.antTransformNode);
      }
    });

    // Position und Skalierung einstellen
    this.antTransformNode.position = position;
    this.antTransformNode.scaling = new Vector3(2, 2, 2);

    // Optionale Rotation
    this.antTransformNode.rotate(Vector3.Up(), -Math.PI / 2);

    // Animation abrufen und starten
    if (container.animationGroups.length > 0) {
      this.antAnimationGroup = container.animationGroups[0];
      this.antAnimationGroup.stop(true);
    }

    // Assets zur Szene hinzufügen
    container.addAllToScene();

    // Agent zur Crowd hinzufügen
    this.addToCrowd();
  }

  private addToCrowd() {
    const agentParams: IAgentParameters = {
      radius: 1,
      height: 1,
      maxAcceleration: 8.0,
      maxSpeed: 1.0,
      collisionQueryRange: 0.5,
      pathOptimizationRange: 0.0,
      separationWeight: 1.0,
    };

    // Agent hinzufügen und Index speichern
    this.agentIndex = this.crowd.addAgent(
      this.antTransformNode.position,
      agentParams,
      this.antTransformNode
    );
  }

  // Methode zum Bewegen der Ameise über das NavMesh
  public moveAntToPosition(targetPosition: Vector3) {
    if (this.navigationPlugin) {
      const destination = this.navigationPlugin.getClosestPoint(targetPosition);
      this.crowd.agentGoto(this.agentIndex, destination);
      console.log(this.navigationPlugin);
      console.log(this.crowd);
    } else {
      console.error("Navigationsplugin ist nicht verfügbar.");
    }
  }

  public changeMaterial(newMaterial: StandardMaterial) {
    this.antMaterial = newMaterial;
  }

  // Methode zum Anpassen des Materials
  public async setMaterialColor(color: Color3) {
    if (this.antMaterial) {
      this.antMaterial.diffuseColor = color;
    }
  }
}
