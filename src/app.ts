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
    const bottomLine = document.getElementById("bottomLine");
    const startButton = document.getElementById("startButton");
    const startARButton = document.getElementById("startARButton");

    // Klick-Event für den Start-Button
    startButton.addEventListener("click", async () => {
      // Erst jetzt Szene/Camera laden
      this.initialize();
      startScreen.remove();
    });

    // Prüfen, ob AR unterstützt wird und Button sichtbar machen
    if (await WebXRSessionManager.IsSessionSupportedAsync("immersive-ar")) {
      startARButton.style.display = "block";
      startARButton.addEventListener("click", async () => {
        // AR-Features starten
        await createARFeatures(this.scene);
      });
    }
  }

  async initialize() {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);
    canvas.style.userSelect = "none"; // Deaktiviert Textauswahl

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.95, 0.95, 0.95, 1);

    const uiManager = UIManager.getInstance();
    await createAntCommunicationScene(canvas, scene);

    //scene.debugLayer.show();

    window.addEventListener("resize", () => engine.resize());
    engine.runRenderLoop(() => scene.render());
  }
}

// Beim Laden der Seite direkt DeviceOrientation-Berechtigung anfragen und Szene laden
(async () => {
  // Sensor-Berechtigung anfragen (falls möglich)
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as any).requestPermission === "function"
  ) {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission !== "granted") {
        console.error("DeviceOrientation-Berechtigung nicht erteilt");
      }
    } catch (error) {
      console.error("Fehler bei der DeviceOrientation-Berechtigung:", error);
    }
  }

  // Szene im Hintergrund laden
  const app = new App();
  await app.initialize();
})();
