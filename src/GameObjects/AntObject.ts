import {
  RecastJSPlugin,
  Scene,
  Vector3,
  IAgentParameters,
  ICrowd,
  StandardMaterial,
  Color3,
  BoundingInfo,
  SceneLoader,
  AbstractMesh,
  AnimationGroup,
  Material,
  Mesh,
  PBRMaterial,
  AsyncCoroutine,
  Quaternion,
} from "@babylonjs/core";

import antModel from "../assets/240206_AnimatedAnt_final.glb";

export default class AntObject extends Mesh {
  public ready: Promise<void>;
  private antIndex: number;
  private antMesh: AbstractMesh;
  protected antSpeed: number = 0.5;
  protected antScale: number = 0.05;
  protected animationGroups: AnimationGroup[];
  protected currentAnimation: AnimationGroup;
  private idle: AnimationGroup;
  private run: AnimationGroup;
  private actionIsFired: boolean = false;
  protected scene: Scene;
  navigationPlugin: RecastJSPlugin;
  crowd: ICrowd;
  protected agentParams: IAgentParameters = {
    radius: 0.1,
    height: 0.05,
    maxAcceleration: 4.0,
    maxSpeed: 0.5,
    collisionQueryRange: 0.3,
    pathOptimizationRange: 0.0,
    separationWeight: 1.0,
  };
  // Deklaration der Klassenvariable
  private randomMoveInterval;

  constructor(
    antType: string,
    antSpeed: number,
    startPosition: Vector3,
    assignedScene: Scene,
    navigationPlugin: RecastJSPlugin,
    crowd: ICrowd
  ) {
    super(antType, assignedScene);
    this.antSpeed = antSpeed;
    this.agentParams.maxSpeed = this.antSpeed;
    this.navigationPlugin = navigationPlugin;
    this.crowd = crowd;
    this.scene = assignedScene;
    this.position.copyFrom(startPosition);
    this.ready = this.initialize();
  }

  private async initialize() {
    await this.createAntMesh(this.scene);
    this.addAntToCrowd(this.crowd);
    this.showBoundingBox = false;
    this.setBoundingInfo(
      new BoundingInfo(new Vector3(-3, -3, -6), new Vector3(3, 3, 6))
    );
    this.rotateAntOnMove(this.scene);
    this.animateAntOnMove(this.scene);
    this.idle = this.animationGroups[0];
    this.run = this.animationGroups[2];
  }

  private async createAntMesh(scene: Scene) {
    const result = await SceneLoader.ImportMeshAsync("", antModel, "", scene);
    this.antMesh = result.meshes[0];
    // Parent zuweisen
    this.antMesh.parent = this;

    this.antMesh.position = Vector3.Zero();

    // Skalierung einstellen
    this.scaling = new Vector3(this.antScale, this.antScale, this.antScale);

    // Optionale Rotation
    // this.antMesh.rotate(Vector3.Up(), Math.PI / 2);

    // Animation zuweisen
    if (result.animationGroups.length > 0) {
      this.animationGroups = result.animationGroups;
      this.animationGroups[0].stop();
    }

    // Materialien der geladenen Meshes anpassen
    result.meshes.forEach((childMesh) => {
      if (childMesh.material) {
        // Prüfen, ob das Material ein PBRMaterial ist (typisch für .glb-Dateien)
        let pbrMaterial = childMesh.material as PBRMaterial;
        if (pbrMaterial) {
          // Emissive Farbe auf Weiß setzen
          pbrMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5);
          // Optional: Emissive Textur auf die Albedo-Textur setzen, um die vorhandene Textur zum Leuchten zu bringen
          if (pbrMaterial.albedoTexture) {
            pbrMaterial.emissiveTexture = pbrMaterial.albedoTexture;
          }
        }
      }
    });
  }

  private addAntToCrowd(crowd: ICrowd) {
    this.antIndex = crowd.addAgent(this.position, this.agentParams, this);
  }

  private rotateAntOnMove(scene: Scene) {
    scene.onBeforeRenderObservable.add(() => {
      const velocity = this.crowd.getAgentVelocity(this.antIndex);
      if (velocity.length() > 0.2 && !this.actionIsFired) {
        // Bestimme das Ziel basierend auf der Bewegungsrichtung
        const targetPosition = this.position.add(velocity);
        const direction = targetPosition.subtract(this.position).normalize();
        // Erzeuge die Zielrotation basierend auf der Richtungsvektor
        let targetRotation = Quaternion.FromLookDirectionLH(direction, Vector3.Up());
        // Korrigiere die Rotation um 180° (pi) um das Modell richtig auszurichten
        const correction = Quaternion.RotationAxis(Vector3.Up(), Math.PI);
        targetRotation = targetRotation.multiply(correction);
        
        // Falls noch keine RotationQuaternion existiert, initialisiere sie
        if (!this.rotationQuaternion) {
          this.rotationQuaternion = targetRotation;
        } else {
          // Führe eine Slerp-Interpolation für einen weichen Übergang durch
          Quaternion.SlerpToRef(
            this.rotationQuaternion,
            targetRotation,
            0.2, // Smoothness-Faktor, anpassbar
            this.rotationQuaternion
          );
        }
      }
    });
  }



  private async animateAntOnMove(scene: Scene) {
    scene.onBeforeRenderObservable.add(() => {
      // Stellen Sie sicher, dass genug AnimationGroups vorhanden sind
      if (!this.animationGroups || this.actionIsFired) {
        return; // Kein Zugriff auf [1] oder [4] möglich
      }

      const velocity = this.crowd.getAgentVelocity(this.antIndex);
      const speed = velocity.length() * 3.5;

      // Idle if speed < 0.1
      if (speed < 0.1) {
        if (this.currentAnimation !== this.idle) {
          this.currentAnimation = this.idle;
          this.scene.onBeforeRenderObservable.runCoroutineAsync(
            this.blendToAnimation(this.idle, this.run)
          );
        }
        this.currentAnimation.speedRatio = 1;
      } else {
        // Run if speed >= 0.1
        if (this.currentAnimation !== this.run) {
          this.currentAnimation = this.run;
          this.scene.onBeforeRenderObservable.runCoroutineAsync(
            this.blendToAnimation(this.run, this.idle)
          );
        }
        this.currentAnimation.speedRatio = speed;
      }
    });
  }

  public fireAntAction(action: string) {
    this.actionIsFired = true;
    this.currentAnimation.stop();

    const animationFire = (animationIndex: number) => {
      this.animationGroups[animationIndex].start();
      this.animationGroups[animationIndex].loopAnimation = false;
      this.animationGroups[animationIndex].onAnimationGroupEndObservable.addOnce(
        () => {
          this.actionIsFired = false;
        }
      );
    };

    switch (action) {
      case "betrillernNPC":
        animationFire(10);
        break;
      case "betrillernPlayer":
        animationFire(9);
        break;
      case "feeding":
        animationFire(11);
        break;
      case "receiveFood":
        animationFire(12);
        break;
      case "attack":
        animationFire(8);
        break;
    }
  }

  *blendToAnimation(
    toAnim: AnimationGroup,
    fromAnim: AnimationGroup
  ): AsyncCoroutine<void> {
    let currentWeight = 1;
    let newWeight = 0;

    this.animationGroups.forEach((anim) => {
      anim.stop();
    });

    toAnim.play(true);

    while (newWeight < 1) {
      currentWeight -= 0.05;
      newWeight += 0.05;
      toAnim.setWeightForAllAnimatables(newWeight);
      fromAnim.setWeightForAllAnimatables(currentWeight);
      yield;
    }
  }

  public getMesh(): AbstractMesh {
    return this.antMesh;
  }

  public moveAnt(pointToMoveTo: Vector3) {
    this.crowd.agentGoto(
      this.antIndex,
      this.navigationPlugin.getClosestPoint(pointToMoveTo)
    );
  }

  public randomMove(setEnabled: boolean = true) {
    if (setEnabled) {
      if (this.randomMoveInterval) {
        // Falls bereits ein Intervall läuft, nicht erneut starten
        return;
      }
      this.randomMoveInterval = setInterval(() => {
        this.moveAnt(this.createRandomPointOnNavMesh());
      }, Math.random() * 3000 + 4000);
    } else {
      if (this.randomMoveInterval) {
        clearInterval(this.randomMoveInterval);
        this.randomMoveInterval = null;
      }
    }
  }

  public getMaterial(): Material {
    return this.antMesh.material;
  }

  public changeColor(newColor: Color3) {
    // Neues Material erstellen
    const newAntMaterial = new StandardMaterial(
      "newAntMaterial",
      this.antMesh.getScene()
    );
    newAntMaterial.diffuseColor = newColor;

    // Alle untergeordneten Meshes abrufen und Material setzen
    const allMeshes = this.antMesh.getChildMeshes();

    allMeshes.forEach((mesh) => {
      mesh.material = newAntMaterial;
    });
  }

  public changeMaterial(newMaterial: Material) {
    // Alle untergeordneten Meshes abrufen und Material setzen
    const allMeshes = this.antMesh.getChildMeshes();

    allMeshes.forEach((mesh) => {
      mesh.material = newMaterial;
    });
  }

  public createRandomPointOnNavMesh() {
    let xCoords = Math.random() * 2.5 * (Math.random() > 0.5 ? -1 : 1);
    let zCoords = Math.random() * 5;
    return this.navigationPlugin.getClosestPoint(
      new Vector3(xCoords, 0, zCoords)
    );
  }

  public antDispose() {
    this.antMesh.dispose();
    this.dispose();
    this.crowd.removeAgent(this.antIndex);
  }
}
