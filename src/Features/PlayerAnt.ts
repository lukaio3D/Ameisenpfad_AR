import Ant from "./Ant";

export default class PlayerAnt extends Ant {
  private _isPlayer: boolean = false;

  constructor(scene, position) {
    super(scene, position);
    this._isPlayer = true;
  }

  public isPlayer(): boolean {
    return this._isPlayer;
  }
}