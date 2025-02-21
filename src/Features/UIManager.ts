// UIManager.ts
import * as GUI from "@babylonjs/gui";

export class UIManager {
  private static instance: UIManager;
  public advancedTexture: GUI.AdvancedDynamicTexture;
  public timer: GUI.TextBlock;
  public healthBar: HTMLProgressElement;
  public collectBar: HTMLProgressElement;
  public overlayText: GUI.TextBlock;
  public bigScreen: GUI.Rectangle;
  public dialogContainer: GUI.StackPanel;
  public dialogzeile: HTMLParagraphElement;
  public startScreen: GUI.Rectangle;
  public startButton: GUI.Button;

  private constructor() {
    this.dialogzeile = document.getElementById("dialogzeile") as HTMLParagraphElement;
    this.healthBar = document.getElementById("lebensAnzeige") as HTMLProgressElement;
    this.collectBar = document.getElementById("fruechteAnzeige") as HTMLProgressElement;


    // AdvancedTexture erstellen
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Big Screen Overlay
    this.bigScreen = new GUI.Rectangle();
    this.bigScreen.width = "100%";
    this.bigScreen.height = "100%";
    this.bigScreen.thickness = 0;
    this.bigScreen.background = "black";
    this.bigScreen.alpha = 1;
    this.bigScreen.isVisible = false;
    this.advancedTexture.addControl(this.bigScreen);

    this.overlayText = new GUI.TextBlock();
    this.overlayText.text = "";
    this.overlayText.color = "white";
    this.overlayText.fontSize = "2%";
    this.overlayText.height = "100px";
    this.overlayText.width = "100%";
    this.overlayText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.overlayText.textHorizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.bigScreen.addControl(this.overlayText);
  }

  // Singleton-Instanz abrufen
  public static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }
    return UIManager.instance;
  }

  // Neue Methode zum Anzeigen von Nachrichten in der Dialogzeile
  public displayMessage(text: string) {
    this.dialogzeile.innerHTML = text;
  }

  public setOverlayText(text: string) {
    this.bigScreen.isVisible = true;
    this.overlayText.text = text;
  }

  public setHealthBar(value: number) {
    this.healthBar.value = value;
  }

  public setFruitBar(value: number) {
    this.collectBar.value = value;
  }
}
