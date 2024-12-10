import {
  Vector3,
  Mesh,
  Scene,
  SceneLoader,
  RecastJSPlugin,
  PBRMaterial,
  Color3,
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
      "Strawberry.glb",
      this.getScene()
    );

    loadedMeshes.then((result) => {
      let mesh = result.meshes[0];
      mesh.parent = this;
    
      mesh.scaling = new Vector3(2, 2, 2);
    });

      // Materialien der geladenen Meshes anpassen
      loadedMeshes.then((result) => {
        result.meshes.forEach((childMesh) => {
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
