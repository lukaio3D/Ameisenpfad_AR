import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/loaders/glTF";
import createAntCommunicationScene from "./Scenes/9_AntCommunication_Scene";
import { Color4, Engine, Scene } from "@babylonjs/core";
import { UIManager } from "./Features/UIManager";
import createCamera from "./Features/Camera";

class App {
  constructor() {
    this.createStartButton();
  }

  createStartButton() {
    // create the start button
    var startButton = document.createElement("button");
    startButton.innerText = "Start";
    startButton.style.position = "absolute";
    startButton.style.top = "50%";
    startButton.style.left = "50%";
    startButton.style.transform = "translate(-50%, -50%)";
    startButton.style.padding = "10px 20px";
    startButton.style.fontSize = "20px";
    document.body.appendChild(startButton);

    // add event listener to the start button
    startButton.addEventListener("click", async () => {
      // remove the start button
      startButton.remove();

      // initialize the application
      await this.initialize();
    });
  }

  async initialize() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    var engine = new Engine(canvas, true);
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new Scene(engine);

    // Hintergrundfarbe
    scene.clearColor = new Color4(0.95, 0.95, 0.95, 1);

    // UIManager initialisieren
    const uiManager = UIManager.getInstance();

    // create the scene and attach it to sceneParent
    await createAntCommunicationScene(canvas, scene);

    // show the inspector
    // Inspector.Show(scene, { overlay: true });

    window.addEventListener("resize", function () {
      engine.resize();
    });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();
