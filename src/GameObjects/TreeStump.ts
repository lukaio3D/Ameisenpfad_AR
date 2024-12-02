import { Mesh, RecastJSPlugin, Scene, SceneLoader, Vector3 } from "@babylonjs/core";

export default class TreeStump extends Mesh {


  constructor(scene: Scene, startPosition: Vector3, navigationPlugin: RecastJSPlugin,) {
    super("treeStump", scene);
    this.loadMesh();
    this.position = startPosition;
    navigationPlugin.addCylinderObstacle(this.position.subtract(new Vector3(0, 1, 0)), 0.8, 2);
  }

  private loadMesh(){
    let loadedMeshes = SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      "TreeStump.glb",
      this.getScene(),
    );

    loadedMeshes.then((result) => {
      let mesh = result.meshes[0];
      mesh.parent = this;
    });
  }

}
