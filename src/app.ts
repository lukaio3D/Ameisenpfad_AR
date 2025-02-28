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

    // Klick-Event für den Start-Button:
    startButton.addEventListener("click", async () => {
      // Erst jetzt Szene/Camera laden
      this.initialize();
      startScreen.remove();
    });

    // Prüfen, ob AR unterstützt wird und Button sichtbar machen:
    if (await WebXRSessionManager.IsSessionSupportedAsync("immersive-ar")) {
      startARButton.style.display = "block";
      startARButton.addEventListener("click", async () => {
        // AR-Features starten:
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

    // Speichere die erstellte Szene in der Klassenvariable:
    this.scene = scene;

    const uiManager = UIManager.getInstance();
    await createAntCommunicationScene(canvas, scene);

    window.addEventListener("resize", () => engine.resize());
    engine.runRenderLoop(() => scene.render());
  }
}

// Nur App erstellen, wenn die DeviceOrientation-Anfrage (sofern erforderlich) erteilt wird:
(async () => {
  let permissionGranted = true;

  // Prüfen, ob device orientation explizit angefordert werden muss
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as any).requestPermission === "function"
  ) {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      permissionGranted = permission === "granted";
      if (!permissionGranted) {
        console.error("DeviceOrientation-Berechtigung nicht erteilt");
        // Hier kannst du optional eine Meldung anzeigen oder einen alternativen Ablauf definieren.
        return;
      }
    } catch (error) {
      console.error("Fehler bei der DeviceOrientation-Berechtigung:", error);
      return;
    }
  }

  // Falls die Berechtigung erteilt wurde, App erstellen und initialisieren:
  const app = new App();
  await app.initialize();
})();
