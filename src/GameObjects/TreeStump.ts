import {
  Mesh,
  RecastJSPlugin,
  Scene,
  SceneLoader,
  Vector3,
  Color3,
  PBRMaterial,
} from "@babylonjs/core";

export default class TreeStump extends Mesh {
  constructor(
    scene: Scene,
    startPosition: Vector3,
    navigationPlugin: RecastJSPlugin
  ) {
    super("treeStump", scene);
    this.position = startPosition;
    this.scaling = new Vector3(0.5, 0.5, 0.5);
    this.loadMesh();
    navigationPlugin.addCylinderObstacle(
      this.position.subtract(new Vector3(0, 1, 0)),
      0.8,
      2
    );
  }

  private loadMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "assets/",
      "TreeStump.glb",
      this.getScene()
    ).then((result) => {
      let mesh = result.meshes[0];
      mesh.parent = this;

      // Materialien der geladenen Meshes anpassen
      mesh.getChildMeshes().forEach((childMesh) => {
        if (childMesh.material) {
          // Prüfen, ob das Material ein PBRMaterial ist (typisch für .glb-Dateien)
          let pbrMaterial = childMesh.material as PBRMaterial;
          if (pbrMaterial) {
            // Emissive Farbe auf Weiß setzen
            pbrMaterial.emissiveColor = new Color3(1, 1, 1);
            // Optional: Emissive Textur auf die Albedo-Textur setzen, um die vorhandene Textur zum Leuchten zu bringen
            if (pbrMaterial.albedoTexture) {
              pbrMaterial.emissiveTexture = pbrMaterial.albedoTexture;
            }
          }
        }
      });
    });
  }
}
