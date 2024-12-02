import {
  Vector3,
  Mesh,
  Scene,
  SceneLoader,
  RecastJSPlugin,
} from "@babylonjs/core";

export default class ConstructionTwig extends Mesh {
  constructor(scene: Scene, startPosition: Vector3, startRotation: Vector3) {
    super("ConstructionTwig", scene);
    this.loadMesh();
    this.scaling = new Vector3(0.25, 0.25, 0.25);
    this.position = startPosition;
    this.rotationQuaternion = startRotation.toQuaternion();
  }

  private loadMesh() {
    let loadedMeshes = SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      "Twig1.glb",
      this.getScene()
    );

    loadedMeshes.then((result) => {
      let mesh = result.meshes[0];
      mesh.parent = this;
    });
  }

  public getPosition(): Vector3 {
    return this.position;
  }

  public getRotation(): Vector3 {
    return this.rotationQuaternion.toEulerAngles();
  }

  public setPosition(newPosition: Vector3) {
    this.position = newPosition;
  }

  
}
