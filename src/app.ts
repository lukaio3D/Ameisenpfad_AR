import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import createAntCommunicationScene from "./Scenes/9_AntCommunication_Scene";
import { Color4, Engine, Scene } from "@babylonjs/core";
import { UIManager } from "./Features/UIManager";
import createCamera from "./Features/Camera";

class App {
  constructor() {
    this.createStartButton();
  }

  createStartButton() {
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
    startButton.innerText = "Start";
    startButton.style.display = "block";
    startButton.style.margin = "20px auto";
    startButton.style.padding = "10px 20px";
    startButton.style.fontSize = "20px";
    startScreen.appendChild(startButton);

    this.initialize();

    // Klick-Event für den Start-Button
    startButton.addEventListener("click", async () => {
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
