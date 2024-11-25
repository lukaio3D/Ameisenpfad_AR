import {
  Scene,
  Vector3,
  AnimationGroup,
  TransformNode,
  SceneLoader,
  PBRMaterial,
  StandardMaterial,
  Color3,
  ICrowd,
  RecastJSPlugin,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export default class Ant {
  private scene: Scene;
  private antTransformNode: TransformNode;
  private antAnimationGroup: AnimationGroup;

  constructor(scene: Scene, position: Vector3) {
    this.scene = scene;
    this.loadModel(position);
  }

  public getTransformNode(): TransformNode {
    return this.antTransformNode;
  }

  public getAnimationGroup(): AnimationGroup {
    return this.antAnimationGroup;
  }

  private async loadModel(position: Vector3) {
    // Laden des Modells
    const container = await SceneLoader.LoadAssetContainerAsync(
      "assets/",
      "240920_AntAnim.glb",
      this.scene
    );

    // Wurzelknoten erstellen und die geladenen Meshes anhängen
    this.antTransformNode = new TransformNode("antTransformNode", this.scene);
    container.meshes.forEach((mesh) => {
      if (mesh.name !== "__root__") {
        mesh.parent = this.antTransformNode;
      }
    });

    // Position und Skalierung einstellen
    this.antTransformNode.position = position;
    this.antTransformNode.scaling = new Vector3(2, 2, 2);

    // Optionale Rotation
    this.antTransformNode.rotate(Vector3.Up(), -Math.PI / 2);

    // Animation abrufen und abspielen
    if (container.animationGroups.length > 0) {
      this.antAnimationGroup = container.animationGroups[0];
      this.antAnimationGroup.pause();
    }

    // Hinzufügen der geladenen Assets zur Szene
    container.addAllToScene();
  }

  // Methode zum Anpassen des Materials
  public async setMaterialColor(color: Color3) {
    const newMaterial = new StandardMaterial("newAntMaterial", this.scene);
    newMaterial.diffuseColor = color;

    // Neues Material den Meshes zuweisen
    this.antTransformNode.getChildMeshes().forEach((mesh) => {
      mesh.material = newMaterial;
    });
    console.log("Material angepasst");
  }
}
