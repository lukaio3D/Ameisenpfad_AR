import { SceneLoader, AssetContainer, Scene } from "@babylonjs/core";

export class AssetManager {
  private static antAssetContainer: AssetContainer | null = null;
  private static strawberryAssetContainer: AssetContainer | null = null;

  // Lädt den AssetContainer, falls noch nicht geladen, und gibt ihn zurück.
  public static async loadAntAsset(scene: Scene): Promise<AssetContainer> {
    if (!this.antAssetContainer) {
      this.antAssetContainer = await SceneLoader.LoadAssetContainerAsync(
        "../assets/", // Pfad (kann je nach Struktur angepasst werden)
        "240206_AnimatedAnt_final.glb",
        scene
      );
    }
    return this.antAssetContainer;
  }

    // Lädt das Twig-Asset (wird nur einmal geladen)
    public static async loadStrawberryAsset(scene: Scene): Promise<AssetContainer> {
        if (!this.strawberryAssetContainer) {
          this.strawberryAssetContainer = await SceneLoader.LoadAssetContainerAsync(
            "../assets/",
            "Strawberry.glb",
            scene
          );
        }
        return this.strawberryAssetContainer;
      }
}