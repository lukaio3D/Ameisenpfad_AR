import { SceneLoader, AssetContainer, Scene } from "@babylonjs/core";
import antModel from "../assets/240206_AnimatedAnt_final.glb";
import strawberryModel from "../assets/Strawberry.glb";

export class AssetManager {
  private static antAssetContainer: AssetContainer | null = null;
  private static strawberryAssetContainer: AssetContainer | null = null;

  // Lädt den AssetContainer, falls noch nicht geladen, und gibt ihn zurück.
  public static async loadAntAsset(scene: Scene): Promise<AssetContainer> {
    if (!this.antAssetContainer) {
      this.antAssetContainer = await SceneLoader.LoadAssetContainerAsync(
        "", // Pfad (kann je nach Struktur angepasst werden)
        antModel,
        scene
      );
    }
    return this.antAssetContainer;
  }

    // Lädt das Twig-Asset (wird nur einmal geladen)
    public static async loadStrawberryAsset(scene: Scene): Promise<AssetContainer> {
        if (!this.strawberryAssetContainer) {
          this.strawberryAssetContainer = await SceneLoader.LoadAssetContainerAsync(
            "",
            strawberryModel,
            scene
          );
        }
        return this.strawberryAssetContainer;
      }
}