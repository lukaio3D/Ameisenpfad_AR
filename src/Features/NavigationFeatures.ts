import {
  Color3,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  RecastJSPlugin,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import Recast from "recast-detour";


export default async function createNavigationFeatures(scene, antContainer, antAnim) {
// Navmesh Setup
let recast = await Recast();
let navigationPlugin = new RecastJSPlugin();

var staticMesh = createStaticMesh(scene);
var navmeshParameters = {
  cs: 0.2,
  ch: 0.2,
  walkableSlopeAngle: 90,
  walkableHeight: 1.0,
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

navigationPlugin.createNavMesh([staticMesh], navmeshParameters);

var navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
navmeshdebug.position = new Vector3(0, 0.01, 0);

var matdebug = new StandardMaterial("matdebug", scene);
matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
matdebug.alpha = 0.2;
navmeshdebug.material = matdebug;

// crowd

var crowd = navigationPlugin.createCrowd(10, 1, scene);
let agents = [];
var i;
var agentParams = {
  radius: 0.5,
  height: 0.2,
  maxAcceleration: 4.0,
  maxSpeed: 1.0,
  collisionQueryRange: 0.5,
  pathOptimizationRange: 0.0,
  separationWeight: 1,
};

for (i = 0; i < 1; i++) {
  var width = 0.2;
  var agentCube = antContainer;
  var targetCube = MeshBuilder.CreateBox(
    "cube",
    { size: 0.01, height: 0.01 },
    scene
  );
  var matAgent = new StandardMaterial("mat2", scene);
  var variation = Math.random();
  matAgent.diffuseColor = new Color3(
    0.4 + variation * 0.6,
    0.3,
    1.0 - variation * 0.3
  );
  agentCube.material = matAgent;
  var randomPos = navigationPlugin.getRandomPointAround(
    new Vector3(-2.0, 0.1, -1.8),
    0.5
  );
  var transform = new TransformNode("transformNode", scene);
  //agentCube.parent = transform;
  var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
  agents.push({
    idx: agentIndex,
    trf: transform,
    mesh: agentCube,
    target: targetCube,
  });
}

var startingPoint;
var currentMesh;
var pathLine;
var getGroundPosition = function () {
  var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
  if (pickinfo.hit) {
    return pickinfo.pickedPoint;
  }

  return null;
};

var pointerDown = function (mesh) {
  currentMesh = mesh;
  startingPoint = getGroundPosition();
  if (startingPoint) {
    // we need to disconnect camera from canvas
    setTimeout(function () {
      // camera.detachControl();
    }, 0);
    var agents = crowd.getAgents();
    var i;
    for (i = 0; i < agents.length; i++) {
      var randomPos = navigationPlugin.getRandomPointAround(startingPoint, 1.0);
      crowd.agentGoto(
        agents[i],
        navigationPlugin.getClosestPoint(startingPoint)
      );
    }
    var pathPoints = navigationPlugin.computePath(
      crowd.getAgentPosition(agents[0]),
      navigationPlugin.getClosestPoint(startingPoint)
    );
    // pathLine = MeshBuilder.CreateDashedLines("ribbon", {points: pathPoints, updatable: true, instance: pathLine}, scene);
  }
};

scene.onPointerObservable.add((pointerInfo) => {
  switch (pointerInfo.type) {
    case PointerEventTypes.POINTERDOWN:
      if (pointerInfo.pickInfo.hit) {
        pointerDown(pointerInfo.pickInfo.pickedMesh);
      }
      break;
  }
});

scene.onBeforeRenderObservable.add(() => {
  var agentCount = agents.length;
  for (let i = 0; i < agentCount; i++) {
    var ag = agents[i];
    ag.mesh.position = crowd.getAgentPosition(ag.idx);
    let vel = crowd.getAgentVelocity(ag.idx);
    antAnim.speedRatio = vel.length() * 0.9;
    crowd.getAgentNextTargetPathToRef(ag.idx, ag.target.position);
    if (vel.length() > 0.2) {
      vel.normalize();
      var desiredRotation = Math.atan2(vel.x, vel.z);
      ag.mesh.rotation.y =
        ag.mesh.rotation.y + (desiredRotation - ag.mesh.rotation.y) * 0.1;
    }
  }
});

function createStaticMesh(scene) {
  var ground = Mesh.CreateGround("ground1", 6, 6, 2, scene);

  // Materials
  var mat1 = new StandardMaterial("mat1", scene);
  mat1.diffuseColor = new Color3(1, 1, 1);
  mat1.alpha = 0;

  var mesh = Mesh.MergeMeshes([ground]);
  mesh.material = mat1;
  return mesh;
}
};