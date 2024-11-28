import AntObject from "./AntObject";
import PlayerController from "../Features/PlayerController";
import { Color3 } from "@babylonjs/core";

export default class PlayerAnt extends AntObject {
  constructor(startPosition, scene, navigationPlugin, crowd) {
    super(startPosition, scene, navigationPlugin, crowd);
    PlayerController(scene, this);
  }
}
