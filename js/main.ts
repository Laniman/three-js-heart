import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function createScene(): {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.Renderer;
} {
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
  const light1 = new THREE.PointLight(color, 1);
  light1.add(
    new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 }))
  );
  light1.position.set(10, 10, 10);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x80ff80, 1);
  light2.add(
    new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x80ff80 }))
  );
  light2.position.set(-15, 10, 0);
  scene.add(light2);

  const light3 = new THREE.PointLight(0xffaa00, 1);
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

function useCoordinates(): {
  vertices: THREE.Vector3[];
  trianglesIndexes: [number, number, number][];
} {
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
  ] as [number, number, number][];

  return {
    vertices,
    trianglesIndexes,
  };
}

function createHearthMesh(
  coordinatesList: THREE.Vector3[],
  trianglesIndexes: [number, number, number][]
): {
  geo: THREE.BufferGeometry;
  material: THREE.Material;
  heartMesh: THREE.Mesh;
} {
  const geo = new THREE.BufferGeometry();
  const vertices: THREE.Vector3[] = [];
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

function addWireFrameToMesh(mesh: THREE.Mesh, geometry: THREE.BufferGeometry) {
  const wireFrame = new THREE.WireframeGeometry(geometry);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 2,
  });
  const line = new THREE.LineSegments(wireFrame, lineMat);
  mesh.add(line);
}

function handleMouseIntersection(
  camera: THREE.Camera,
  scene: THREE.Scene,
  meshUuid: THREE.Mesh["uuid"]
): { onMouseIntersection: (event: MouseEvent | TouchEvent) => void } {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseIntersection(event: MouseEvent | TouchEvent) {
    let coordinatesObject;
    if (event instanceof TouchEvent) {
      coordinatesObject = event.changedTouches[0];
    } else {
      coordinatesObject = event;
    }

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

function beatingAnimation(mesh: THREE.Mesh) {
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

function setControls(
  camera: THREE.Camera,
  domElement: HTMLElement
): { controls: InstanceType<typeof OrbitControls> } {
  const controls = new OrbitControls(camera, domElement);
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = (2 * Math.PI) / 3;
  controls.minDistance = 20;
  controls.maxDistance = 34;
  controls.update();
  return {
    controls,
  };
}

function createRoom(
  scene: THREE.Scene,
  options: { width: number; height: number; depth: number }
) {
  const { width, height, depth } = options;
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0x241b61,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 6; i++) {
    const geo = new THREE.PlaneGeometry(width, height, 2);
    const rotationAngle: { axis: "X" | "Y" | "Z"; radiant: number } = {
      axis: "X",
      radiant: 0,
    };
    const translation = {
      x: 0,
      y: 0,
      z: 0,
    };

    switch (i) {
      case 0:
        translation.z = -depth / 2;
        break;
      case 1:
        rotationAngle.radiant = -Math.PI * 0.5;
        rotationAngle.axis = "X";
        translation.y = -height / 2;
        break;
      case 2:
        rotationAngle.radiant = -Math.PI * 0.5;
        rotationAngle.axis = "X";
        translation.y = height / 2;
        break;
      case 3:
        rotationAngle.radiant = -Math.PI * 0.5;
        rotationAngle.axis = "Y";
        translation.x = -width / 2;
        break;
      case 4:
        rotationAngle.radiant = -Math.PI * 0.5;
        rotationAngle.axis = "Y";
        translation.x = width / 2;
        break;
      case 5:
        translation.z = depth / 2;
        break;
      default:
        break;
    }
    const plane = new THREE.Mesh(
      geo[`rotate${rotationAngle.axis}`](rotationAngle.radiant).translate(
        translation.x,
        translation.y,
        translation.z
      ),
      planeMaterial
    );
    scene.add(plane);
  }
}

function init() {
  const { scene, camera, renderer } = createScene();
  const { controls } = setControls(camera, renderer.domElement);
  const { vertices, trianglesIndexes } = useCoordinates();
  const { geo, heartMesh } = createHearthMesh(vertices, trianglesIndexes);

  scene.add(heartMesh);
  createRoom(scene, { width: 70, height: 70, depth: 70 });
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
