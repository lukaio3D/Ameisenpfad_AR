import Recast from "recast-detour";
import {
  RecastJSPlugin,
  Scene,
  Mesh,
  Color3, 
  StandardMaterial
} from "@babylonjs/core";

export default async function createNavigationFeatures(scene: Scene, groundMesh: Mesh[], showNavMesh: boolean) {
  const recast = await Recast();
  let navigationPlugin = new RecastJSPlugin(recast);

  const parameters = {
    cs: 0.2,
    ch: 0.2,
    walkableSlopeAngle: 35,
    walkableHeight: 1,
    walkableClimb: 1,
    walkableRadius: 1,
    maxEdgeLen: 12,
    maxSimplificationError: 1.3,
    minRegionArea: 8,
    mergeRegionArea: 20,
    maxVertsPerPoly: 6,
    detailSampleDist: 6,
    detailSampleMaxError: 1,
  };
  
  navigationPlugin.createNavMesh(groundMesh, parameters);

  //Zufällige Position auf NavMesh finden

  // Optional: NavMesh visualisieren
  if(showNavMesh) {
  let navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
  const matdebug = new StandardMaterial("matdebug", scene);
  matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
  matdebug.alpha = 0.2;
  navmeshdebug.material = matdebug;
  }

  // Crowd erstellen
  let crowd = navigationPlugin.createCrowd(10, 2, scene);

  return {navigationPlugin, crowd};

}
