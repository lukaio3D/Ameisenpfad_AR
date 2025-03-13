import {
  Vector3,
  Mesh,
  Scene,
  SceneLoader,
  RecastJSPlugin,
  PBRMaterial,
  Color3,
} from "@babylonjs/core";

import strawberry from "../assets/Strawberry.glb";
import { AssetManager } from "../Features/AssetsManager";

export default class ConstructionTwig extends Mesh {
  constructor(scene: Scene, startPosition: Vector3, startRotation: Vector3) {
    super("ConstructionTwig", scene);
    this.loadMesh(scene);
    this.scaling = new Vector3(0.25, 0.25, 0.25);
    this.position = startPosition;
    this.rotationQuaternion = startRotation.toQuaternion();
  }

  private async loadMesh(scene: Scene) {
    const container = await AssetManager.loadStrawberryAsset(scene);
    const instance = container.instantiateModelsToScene();
    const loadedMesh = instance.rootNodes[0] as Mesh;

    loadedMesh.parent = this;
    loadedMesh.scaling = new Vector3(2, 2, 2);

    container.materials.forEach((material) => {
      const pbrMaterial = material as PBRMaterial;
      if (pbrMaterial) {
        // Emissive Farbe auf Weiß setzen
        pbrMaterial.emissiveColor = new Color3(1, 1, 1);
        // Optional: Falls vorhanden, Albedo-Textur als Emissive-Textur verwenden
        if (pbrMaterial.albedoTexture) {
          pbrMaterial.emissiveTexture = pbrMaterial.albedoTexture;
        }
      }
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
