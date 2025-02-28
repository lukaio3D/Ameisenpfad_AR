import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import createAntCommunicationScene from "./Scenes/9_AntCommunication_Scene";
import { Color4, Engine, Scene, WebXRSessionManager } from "@babylonjs/core";
import { UIManager } from "./Features/UIManager";
import createCamera from "./Features/Camera";
import createARFeatures from "./Features/ARFeatures";

class App {
  private scene: Scene;

  constructor() {
    this.createStartButton();
  }

  async createStartButton() {
    const startScreen = document.getElementById("startScreen");
    const startButton = document.getElementById("startButton");
    const startARButton = document.getElementById("startARButton");

    // Klick-Event für den Start-Button:
    startButton.addEventListener("click", async () => {
      // Wenn device orientation angefragt werden muss, holen wir die Berechtigung ab:
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission !== "granted") {
            console.error("DeviceOrientation-Berechtigung nicht erteilt");
            return;
          }
        } catch (error) {
          console.error("Fehler bei der DeviceOrientation-Berechtigung:", error);
          return;
        }
      }
      
      // Berechtigung erteilt oder nicht erforderlich: Fenster schließen und Szene laden.
      await this.initialize();
      startScreen.remove();
    });

    // Prüfen, ob AR unterstützt wird und Button sichtbar machen:
    if (await WebXRSessionManager.IsSessionSupportedAsync("immersive-ar")) {
      startARButton.style.display = "flex";
    }
  }

  async initialize() {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);
    canvas.style.userSelect = "none";

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.95, 0.95, 0.95, 1);
    this.scene = scene;

    const uiManager = UIManager.getInstance();
    await createAntCommunicationScene(canvas, scene);

    window.addEventListener("resize", () => engine.resize());
    engine.runRenderLoop(() => scene.render());
  }
}

// App wird hier über den Start-Button initialisiert – keine automatische Initialisierung mehr.
new App();
