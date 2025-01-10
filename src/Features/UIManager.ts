// UIManager.ts
import * as GUI from "@babylonjs/gui";

export class UIManager {
  private static instance: UIManager;
  public advancedTexture: GUI.AdvancedDynamicTexture;
  public dialogzeile: GUI.TextBlock;
  public timer: GUI.TextBlock;
  public healthBar: GUI.Slider;
  public collectBar: GUI.Slider;
  public overlayText: GUI.TextBlock;
  public bigScreen: GUI.Rectangle;
  public dialogContainer: GUI.StackPanel;
  public dialogText: GUI.TextBlock;
  public startScreen: GUI.Rectangle;
  public startButton: GUI.Button;

  private constructor() {
    // AdvancedTexture erstellen
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Startscreen erstellen und konfigurieren
    this.startScreen = new GUI.Rectangle();
    this.startScreen.width = "100%";
    this.startScreen.height = "100%";
    this.startScreen.background = "black";
    this.startScreen.thickness = 0;
    this.advancedTexture.addControl(this.startScreen);

    // Startbutton erstellen und konfigurieren
    this.startButton = GUI.Button.CreateSimpleButton("startButton", "Start");
    this.startButton.width = "20%";
    this.startButton.height = "10%";
    this.startButton.color = "white";
    this.startButton.background = "green";
    this.startButton.fontSize = 24;
    this.startButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.startButton.horizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.startScreen.addControl(this.startButton);

    // Event Listener für den Startbutton
    this.startButton.onPointerUpObservable.add(() => {
      this.startScreen.isVisible = false;
    });

    // Dialogzeile erstellen und konfigurieren
    this.dialogzeile = new GUI.TextBlock();
    this.dialogzeile.text = "";
    this.dialogzeile.color = "white";
    this.dialogzeile.fontSize = "2%";
    this.dialogzeile.height = "5%";
    this.dialogzeile.width = "100%";
    this.dialogzeile.paddingBottom = "24px";
    this.dialogzeile.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.dialogzeile.textHorizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

    // **Schwarzen Umriss hinzufügen**
    this.dialogzeile.outlineWidth = 2;
    this.dialogzeile.outlineColor = "black";

    // TextBlock zur GUI hinzufügen
    this.advancedTexture.addControl(this.dialogzeile);

    // Container erstellen und konfigurieren
    let containerTopLeft = new GUI.Rectangle();
    containerTopLeft.height = "10%";
    containerTopLeft.width = "20%";
    containerTopLeft.thickness = 0; // Rahmen entfernen
    containerTopLeft.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    containerTopLeft.horizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.advancedTexture.addControl(containerTopLeft);

    // TextBlock zur GUI hinzufügen
    this.advancedTexture.addControl(this.dialogzeile);

    // Timer-TextBlock erstellen und konfigurieren
    this.timer = new GUI.TextBlock();
    this.timer.text = "";
    this.timer.color = "orange";
    this.timer.fontSize = 24;
    this.timer.height = "10%";
    this.timer.width = "20%";

    // **Schwarzen Umriss hinzufügen**
    this.timer.outlineWidth = 2;
    this.timer.outlineColor = "black";

    // TextBlock zur GUI hinzufügen
    containerTopLeft.addControl(this.timer);

    // Container erstellen und konfigurieren
    let containerTopRight = new GUI.Rectangle();
    containerTopRight.height = "10%";
    containerTopRight.width = "20%";
    containerTopRight.paddingTop = "20px";
    containerTopRight.paddingRight = "20px";
    containerTopRight.thickness = 0; // Rahmen entfernen
    containerTopRight.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    containerTopRight.horizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.advancedTexture.addControl(containerTopRight);

    // Grid erstellen und zum Container hinzufügen
    let grid = new GUI.Grid();
    grid.addColumnDefinition(0.5, false);
    grid.addColumnDefinition(0.5, false);
    grid.addRowDefinition(0.5, false);
    grid.addRowDefinition(0.5, false);
    grid.width = "100%";
    grid.height = "100%";
    containerTopRight.addControl(grid);

    // Beschriftung Lebensbalken erstellen und konfigurieren
    let legendHealth = new GUI.TextBlock();
    legendHealth.text = "Leben";
    legendHealth.color = "white";
    legendHealth.fontSize = "40%";
    legendHealth.height = "50%";
    legendHealth.width = "100%";
    // **Schwarzen Umriss hinzufügen**
    legendHealth.outlineWidth = 2;
    legendHealth.outlineColor = "black";
    grid.addControl(legendHealth, 0, 0);

    // Lebensbalken konfigurieren und hinzufügen
    this.healthBar = new GUI.Slider();
    this.healthBar.minimum = 0;
    this.healthBar.maximum = 100;
    this.healthBar.color = "green";
    this.healthBar.background = "white";
    this.healthBar.value = 100;
    this.healthBar.height = "50%";
    this.healthBar.width = "100%";
    this.healthBar.displayThumb = false;
    this.healthBar.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    grid.addControl(this.healthBar, 0, 1);

    // Beschriftung Lebensbalken erstellen und konfigurieren
    let legendCollected = new GUI.TextBlock();
    legendCollected.text = "Früchte";
    legendCollected.color = "white";
    legendCollected.fontSize = "40%";
    legendCollected.height = "50%";
    legendCollected.width = "100%";
    // **Schwarzen Umriss hinzufügen**
    legendCollected.outlineWidth = 2;
    legendCollected.outlineColor = "black";
    grid.addControl(legendCollected, 1, 0);

    // Sammelbalken konfigurieren und hinzufügen
    this.collectBar = new GUI.Slider();
    this.collectBar.minimum = 0;
    this.collectBar.maximum = 100;
    this.collectBar.color = "orange";
    this.collectBar.background = "white";
    this.collectBar.value = 0;
    this.collectBar.height = "50%";
    this.collectBar.width = "100%";
    this.collectBar.displayThumb = false;
    this.collectBar.horizontalAlignment =
      GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    grid.addControl(this.collectBar, 2, 2);

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
    this.dialogzeile.text = text;
    this.dialogzeile.isVisible = true;
  }

  public setOverlayText(text: string) {
    this.bigScreen.isVisible = true;
    this.overlayText.text = text;
  }

  public setHealthBar(value: number) {
    this.healthBar.value = value;
  }
}
