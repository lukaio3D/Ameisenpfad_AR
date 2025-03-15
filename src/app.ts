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

    // Falls DeviceOrientation nicht unterstützt wird oder keine Erlaubnisabfrage nötig ist,
    // laden wir die Szene direkt:
    if (
      typeof DeviceOrientationEvent === "undefined" ||
      typeof (DeviceOrientationEvent as any).requestPermission !== "function"
    ) {
      await this.initialize();
    }

    // Klick-Event für den Start-Button:
    startButton.addEventListener("click", async () => {
      // Falls DeviceOrientation abgefragt werden muss, holen wir zuerst die Berechtigung ab:
      // Berechtigung erteilt: Szene laden und Startscreen entfernen.
      startScreen.remove();
      try {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permission !== "granted") {
          console.error("DeviceOrientation-Berechtigung nicht erteilt");
          return;
        }
        await this.initialize();
      } catch (error) {
        console.error("Fehler bei der DeviceOrientation-Berechtigung:", error);
        return;
      }
    });
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

    //scene.debugLayer.show();

    const uiManager = UIManager.getInstance();
    await createAntCommunicationScene(canvas, scene);

    window.addEventListener("resize", () => engine.resize());
    engine.runRenderLoop(() => scene.render());
  }
}

new App();
