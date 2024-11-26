import Recast from "recast-detour";
import {
  RecastJSPlugin,
  Scene,
  Mesh,
  Color3, 
  StandardMaterial
} from "@babylonjs/core";

export default async function createNavigationFeatures(scene: Scene, groundMesh: Mesh[]) {
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
  let navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
  const matdebug = new StandardMaterial("matdebug", scene);
  matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
  matdebug.alpha = 0.2;
  navmeshdebug.material = matdebug;

  // Crowd erstellen
  let crowd = navigationPlugin.createCrowd(10, 2, scene);

  return {navigationPlugin, crowd};

}



// export default async function createNavigationFeatures(scene: Scene): Promise<{navigationPlugin: RecastJSPlugin; crowd: RecastJSCrowd}> {
// // RecastJSPlugin initialisieren
// const recast = await Recast();
// const navigationPlugin = new RecastJSPlugin(recast);

// // NavMesh-Parameter definieren
// const navmeshParameters = {
//   cs: 0.2,
//   ch: 0.2,
//   walkableSlopeAngle: 45,
//   walkableHeight: 0.5,
//   walkableClimb: 0.1,
//   walkableRadius: 0.2,
//   maxEdgeLen: 12.,
//   maxSimplificationError: 1.3,
//   minRegionArea: 8,
//   mergeRegionArea: 20,
//   maxVertsPerPoly: 6,
//   detailSampleDist: 6,
//   detailSampleMaxError: 1,
// };

// // Boden erstellen und NavMesh generieren
// const groundMesh = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
// navigationPlugin.createNavMesh([groundMesh], navmeshParameters);

// // Optional: NavMesh visualisieren
// const navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
// navmeshdebug.position = new Vector3(0, 0.01, 0);

// const matdebug = new StandardMaterial("matdebug", scene);
// matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
// matdebug.alpha = 0.2;
// navmeshdebug.material = matdebug;

// // Crowd erstellen
// const crowd = new RecastJSCrowd(navigationPlugin, 10, 0.1, scene);

//   // Box erstellen und Crowd übergeben
//   const box = MeshBuilder.CreateBox("box", { size: 0.1 }, scene);
//   const boxNode = new TransformNode("boxNode", scene);
//   box.parent = boxNode;
//   const agentParams: IAgentParameters = {
//     radius: 0.1,
//     height: 0.1,
//     maxAcceleration: 8.0,
//     maxSpeed: 1.0,
//     collisionQueryRange: 0.5,
//     pathOptimizationRange: 0.0,
//     separationWeight: 1.0,
//   };
//   crowd.addAgent(box.position, agentParams, boxNode);

// // navigationPlugin zurückgeben
// return {navigationPlugin, crowd};
// }
