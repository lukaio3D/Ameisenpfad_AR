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
    // Vollbild-DIV als Startscreen
    const startScreen = document.createElement("div");
    startScreen.style.position = "absolute";
    startScreen.style.top = "0";
    startScreen.style.left = "0";
    startScreen.style.width = "100%";
    startScreen.style.height = "100%";
    startScreen.style.backgroundColor = "black";
    startScreen.style.zIndex = "100";
    document.body.appendChild(startScreen);

    // Titel (H1)
    const title = document.createElement("h2");
    title.innerText = "Ameisenpfad AR";
    title.style.color = "white";
    title.style.fontFamily = "sans-serif";
    title.style.textAlign = "center";
    title.style.marginTop = "20%";
    startScreen.appendChild(title);

    // Start-Button
    const startButton = document.createElement("button");
    startButton.id = "startButton";
    startButton.innerText = "Start";
    startButton.style.display = "block";
    startButton.style.margin = "20px auto";
    startButton.style.padding = "10px 20px";
    startButton.style.fontSize = "20px";
    startScreen.appendChild(startButton);

    // Start-AR-Button
    const startARButton = document.createElement("button");
    startARButton.id = "startARButton";
    startARButton.innerText = "Start AR";
    startARButton.style.display = "none";
    startARButton.style.margin = "20px auto";
    startARButton.style.padding = "10px 20px";
    startARButton.style.fontSize = "20px";
    startScreen.appendChild(startARButton);

    // Intro Text (P)
    // const introText = document.createElement("p");
    // introText.style.color = "white";
    // introText.style.fontFamily = "sans-serif";
    // introText.style.textAlign = "center";
    // introText.style.marginTop = "20px";
    // introText.style.overflow = "auto";
    // introText.style.maxWidth = "40%";
    // introText.innerText =
    //   "Klicke auf „Start“, und das Spiel wählt automatisch den passenden Modus für dein Gerät. Steuere deine Ameise, indem du auf den Boden tippst: Sie läuft dorthin, wo du geklickt hast. Je nach Modus kannst du dich entweder durch Drehen des Geräts umsehen oder in AR sogar frei im Raum bewegen. Sammle Früchte, um fremde Ameisen anzulocken und erlebe ihr reales „Betriller“-Verhalten: Kommt deine Ameise nahe genug heran, werden sie als Freund (grün) oder Feind (rot) identifiziert. Rote Ameisen ziehen dir Lebenspunkte ab, grüne füttern dich und füllen dein Leben wieder auf. Viel Spaß beim Entdecken und Sammeln!";

    // DeviceOrientation-Berechtigung erfragen
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permission = await(
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permission !== "granted") {
          console.error("DeviceOrientation-Berechtigung nicht erteilt");
          return;
        }
      } catch (error) {
        console.error("Fehler bei der DeviceOrientation-Berechtigung:", error);
        return;
      }
    }

    // Klick-Event für den Start-Button
    startButton.addEventListener("click", async () => {
      // Erst jetzt Szene/Camera laden
      console.log("Starte Spiel...");
      this.initialize();
      startScreen.remove();
    });
  }

  async initialize() {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

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

new App();
