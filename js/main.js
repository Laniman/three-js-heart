import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function createScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.z = 30;
  camera.position.y = 15;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const sphere = new THREE.SphereGeometry(0.5, 16, 8);
  const color = 0xffffff;
  const light1 = new THREE.PointLight(color, 2);
  light1.add(
    new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 }))
  );
  light1.position.set(10, 10, 10);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x80ff80, 2);
  light2.add(
    new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x80ff80 }))
  );
  light2.position.set(-15, 10, 0);
  scene.add(light2);

  const light3 = new THREE.PointLight(0xffaa00, 2);
  light3.add(
    new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffaa00 }))
  );
  light3.position.set(10, 15, -5);
  scene.add(light3);

  return {
    scene,
    camera,
    renderer,
  };
}

function useCoordinates() {
  const vertices = [
    new THREE.Vector3(0, 0, 0), // point C
    new THREE.Vector3(0, 5, -1.5),
    new THREE.Vector3(5, 5, 0), // point A
    new THREE.Vector3(9, 9, 0),
    new THREE.Vector3(5, 9, 2),
    new THREE.Vector3(7, 13, 0),
    new THREE.Vector3(3, 13, 0),
    new THREE.Vector3(0, 11, 0),
    new THREE.Vector3(5, 9, -2),
    new THREE.Vector3(0, 8, -3),
    new THREE.Vector3(0, 8, 3),
    new THREE.Vector3(0, 5, 1.5), // point B
    new THREE.Vector3(-9, 9, 0),
    new THREE.Vector3(-5, 5, 0),
    new THREE.Vector3(-5, 9, -2),
    new THREE.Vector3(-5, 9, 2),
    new THREE.Vector3(-7, 13, 0),
    new THREE.Vector3(-3, 13, 0),
  ];

  const trianglesIndexes = [
    // face 1
    [2, 11, 0],
    [2, 3, 4],
    [5, 4, 3],
    [4, 5, 6],
    [4, 6, 7],
    [4, 7, 10],
    [4, 10, 11],
    [4, 11, 2],
    [0, 11, 13],
    [12, 13, 15],
    [12, 15, 16],
    [16, 15, 17],
    [17, 15, 7],
    [7, 15, 10],
    [11, 10, 15],
    [13, 11, 15],
    // face 2
    [0, 1, 2],
    [1, 9, 2],
    [9, 8, 2],
    [5, 3, 8],
    [8, 3, 2],
    [6, 5, 8],
    [7, 6, 8],
    [9, 7, 8],
    [14, 17, 7],
    [14, 7, 9],
    [14, 9, 1],
    [9, 1, 13],
    [1, 0, 13],
    [14, 1, 13],
    [16, 14, 12],
    [16, 17, 14],
    [12, 14, 13],
  ];

  return {
    vertices,
    trianglesIndexes,
  };
}

function createHearthMesh(coordinatesList, trianglesIndexes) {
  const geo = new THREE.BufferGeometry();
  const vertices = [];
  trianglesIndexes.forEach((triangle) => {
    vertices.push(
      coordinatesList[triangle[0]],
      coordinatesList[triangle[1]],
      coordinatesList[triangle[2]]
    );
  });

  geo.setFromPoints(vertices);
  geo.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial({ color: 0xad0c00 });
  const heartMesh = new THREE.Mesh(geo, material);

  return {
    geo,
    material,
    heartMesh,
  };
}

function addWireFrameToMesh(mesh, geometry) {
  const wireFrame = new THREE.WireframeGeometry(geometry);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 2,
  });
  const line = new THREE.LineSegments(wireFrame, lineMat);
  mesh.add(line);
}

function handleMouseIntersection(camera, scene, meshUuid) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseIntersection(event) {
    const coordinatesObject = event.changedTouches
      ? event.changedTouches[0]
      : event;
    mouse.x = (coordinatesObject.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(coordinatesObject.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length && intersects[0].object.uuid === meshUuid) {
      startAnim = true;
    }
  }

  mouse.x = 1;
  mouse.y = 1;

  return {
    onMouseIntersection,
  };
}

let startAnim = false;
let scaleThreshold = false;
const beatingIncrement = 0.008;

function beatingAnimation(mesh) {
  if (mesh.scale.x < 1.4 && !scaleThreshold) {
    mesh.scale.x += beatingIncrement * 2;
    mesh.scale.y += beatingIncrement * 2;
    mesh.scale.z += beatingIncrement * 2;

    if (mesh.scale.x >= 1.4) {
      scaleThreshold = true;
    }
  } else if (scaleThreshold) {
    mesh.scale.x -= beatingIncrement;
    mesh.scale.y -= beatingIncrement;
    mesh.scale.z -= beatingIncrement;

    if (mesh.scale.x <= 1) {
      scaleThreshold = false;
      startAnim = false;
    }
  }
}

function setControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.update();
  return {
    controls,
  };
}

function init() {
  const { scene, camera, renderer } = createScene();
  const { controls } = setControls(camera, renderer.domElement);
  const { vertices, trianglesIndexes } = useCoordinates();
  const { geo, heartMesh } = createHearthMesh(vertices, trianglesIndexes);

  scene.add(heartMesh);
  addWireFrameToMesh(heartMesh, geo);

  const { onMouseIntersection } = handleMouseIntersection(
    camera,
    scene,
    heartMesh.uuid
  );
  window.addEventListener("click", onMouseIntersection, false);

  const animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    heartMesh.rotation.y -= 0.005;
    if (startAnim) {
      beatingAnimation(heartMesh);
    }
    controls.update();
  };

  animate();
}

init();
