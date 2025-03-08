import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import spline from './data/spline.js';
import getStarfield from './data/getStarfield.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import "./App.css"
import backgroundMusic from './data/BGM.wav';
import { playLaserSound } from './sounds/laserSound';
import { playExplodeSound } from './sounds/explodeSound';
import soundIcon from './data/sound-2-svgrepo-com.svg';

const Starfield = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [destroyedBoxes, setDestroyedBoxes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [time, setTime] = useState(0);
  const mountRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio(backgroundMusic));

  useEffect(() => {
    audioRef.current.loop = true;
  }, []);

  const difficultySettings = {
    easy: { speedMultiplier: 0.03 },
    medium: { speedMultiplier: 0.05 },
    hard: { speedMultiplier: 0.08 }
  };

  const startGame = (difficulty) => {
    if (gameStarted) return;
    setGameStarted(true);
    setDifficulty(difficulty);
    setTime(0); // 게임 시작 시 time 초기화
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('score').style.display = 'block';
    document.getElementById('timer').style.display = 'block';
    document.getElementById('soundButton').style.display = 'block';
    audioRef.current.play();
    init(difficultySettings[difficulty]);
    startTimer();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameStarted(false);
    setGameOver(true);
    document.getElementById('score').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
    document.getElementById('soundButton').style.display = 'none';
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const retryGame = () => {
    setGameOver(false);
    setDifficulty(difficulty);
    setDestroyedBoxes(0);
    setTimeLeft(60);
    setTime(0); 
    document.getElementById('startScreen').style.display = 'flex';
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioRef.current.muted = !isMuted;
  };

  const init = (settings) => {
    let w = window.innerWidth;
    let h = window.innerHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.3);
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5;
    scene.add(camera);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // post-processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
    bloomPass.threshold = 0.002;
    bloomPass.strength = 3.5;
    bloomPass.radius = 0;
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const starfield = getStarfield();
    scene.add(starfield);

    const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);

    const tubeColor = 0x00ccff;
    const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
    const lineMat = new THREE.LineBasicMaterial({ color: tubeColor });
    const tubeLines = new THREE.LineSegments(edges, lineMat);
    scene.add(tubeLines);

    const hitMat = new THREE.MeshBasicMaterial({
      color: tubeColor,
      transparent: true,
      opacity: 0.0,
      side: THREE.BackSide
    });
    const tubeHitArea = new THREE.Mesh(tubeGeo, hitMat);
    scene.add(tubeHitArea);

    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const numBoxes = 55;
    const size = 0.075;
    const boxGeo = new THREE.BoxGeometry(size, size, size);

    const light = new THREE.PointLight(0xffffff, 0.07, 5);
    light.position.set(2,2,2);
    scene.add(light);

    const lightTarget = new THREE.Object3D();
    scene.add(lightTarget);
    light.target = lightTarget;

    for (let i = 0; i < numBoxes; i += 1) {
      const p = (i / numBoxes + Math.random() * 0.1) % 1;
      const pos = tubeGeo.parameters.path.getPointAt(p);
      const color = new THREE.Color().setHSL(0.7 + p, 1, 0.5);
      const boxMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.0
      });
      const hitBox = new THREE.Mesh(boxGeo, boxMat);
      hitBox.name = 'box';

      pos.x += Math.random() - 0.4;
      pos.z += Math.random() - 0.4;
      hitBox.position.copy(pos);
      const rote = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      hitBox.rotation.set(rote.x, rote.y, rote.z);
      const edges = new THREE.EdgesGeometry(boxGeo, 0.2);

      const lineMat = new THREE.LineBasicMaterial({ color });
      const boxLines = new THREE.LineSegments(edges, lineMat);
      boxLines.position.copy(pos);
      boxLines.rotation.set(rote.x, rote.y, rote.z);
      hitBox.userData.box = boxLines;
      boxGroup.add(hitBox);
      scene.add(boxLines);
    }

    let mousePos = new THREE.Vector2();
    const crosshairs = new THREE.Group();
    crosshairs.position.z = -1;
    camera.add(crosshairs);
    const crossMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
    });
    const lineGeo = new THREE.BufferGeometry();
    const lineVerts = [0, 0.05, 0, 0, 0.02, 0];
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));

    for (let i = 0; i < 4; i += 1) {
      const line = new THREE.Line(lineGeo, crossMat);
      line.rotation.z = i * 0.5 * Math.PI;
      crosshairs.add(line);
    }

    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    const impactPos = new THREE.Vector3();
    const impactColor = new THREE.Color();
    let impactBox = null;

    let lasers = [];
    const laserGeo = new THREE.IcosahedronGeometry(0.05, 2);

    const getLaserBolt = () => {
      const laserMat = new THREE.MeshBasicMaterial({
        color: 0xFFCC00,
        transparent: true,
        fog: false
      });
      var laserBolt = new THREE.Mesh(laserGeo, laserMat);
      laserBolt.position.copy(camera.position);

      let active = true;
      let speed = 0.5;

      let goalPos = camera.position.clone()
        .setFromMatrixPosition(crosshairs.matrixWorld);

      const laserDirection = new THREE.Vector3(0, 0, 0);
      laserDirection.subVectors(laserBolt.position, goalPos)
        .normalize()
        .multiplyScalar(speed);

      direction.subVectors(goalPos, camera.position);
      raycaster.set(camera.position, direction);
      let intersects = raycaster.intersectObjects([...boxGroup.children, tubeHitArea], true);

      if (intersects.length > 0) {
        impactPos.copy(intersects[0].point);
        impactColor.copy(intersects[0].object.material.color);
        if (intersects[0].object.name === 'box') {
          console.log('hit box', intersects[0].object);
          impactBox = intersects[0].object.userData.box;
          boxGroup.remove(intersects[0].object);
          setDestroyedBoxes(prev => prev + 1);
          playExplodeSound(isMuted); // 박스 폭발 소리 재생
        }
      }

      let scale = 1.0;
      let opacity = 1.0;
      let isExploding = false;

      const update = () => {
        if (active === true) {
          if (isExploding === false) {
            laserBolt.position.sub(laserDirection);

            if (laserBolt.position.distanceTo(impactPos) < 0.5) {
              laserBolt.position.copy(impactPos);
              laserBolt.material.color.set(impactColor);
              isExploding = true;
              impactBox?.scale.setScalar(0.0);
            }
          } else {
            if (opacity > 0.01) {
              scale += 0.2;
              opacity *= 0.85;

            } else {
              opacity = 0.0;
              scale = 0.01;
              active = false;
            }
            laserBolt.scale.setScalar(scale);
            laserBolt.material.opacity = opacity;
            laserBolt.userData.active = active;
          }
        }
      };
      laserBolt.userData = { update, active };
      return laserBolt;
    };

    const updateCamera = (t) => {
      const newTime = Math.pow(t * settings.speedMultiplier, 1.2);
      setTime(newTime);
      const looptime = 10 * 1000;
      const p = (newTime % looptime) / looptime;
      const pos = tubeGeo.parameters.path.getPointAt(p);
      const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
      camera.position.copy(pos);
      camera.lookAt(lookAt);
    };

    const animate = (t = 0) => {
      requestAnimationFrame(animate);
      updateCamera(t);
      crosshairs.position.set(mousePos.x, mousePos.y, -1);
      lasers.forEach(l => l.userData.update());
      composer.render(scene, camera);
    };
    animate();

    const fireLaser = () => {
      const laser = getLaserBolt();
      lasers.push(laser);
      scene.add(laser);
      playLaserSound(isMuted, 0.4); // 레이저 소리 재생, 볼륨 0.5로 설정

      let inactiveLasers = lasers.filter((l) => l.userData.active === false);
      scene.remove(...inactiveLasers);
      lasers = lasers.filter((l) => l.userData.active === true);
    };
    window.addEventListener('click', () => fireLaser());

    const onMouseMove = (evt) => {
      w = window.innerWidth;
      h = window.innerHeight;
      let aspect = w / h;
      let fudge = { x: aspect * 0.75, y: 0.75 };
      mousePos.x = ((evt.clientX / w) * 2 - 1) * fudge.x;
      mousePos.y = (-1 * (evt.clientY / h) * 2 + 1) * fudge.y;
    };
    window.addEventListener('mousemove', onMouseMove, false);

    const handleWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleWindowResize, false);

    animate();
  };

  useEffect(() => {
    document.getElementById('score').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
    document.getElementById('soundButton').style.display = 'none'; // 소리 버튼 숨기기
  }, []);

  return (
    <div ref={mountRef}>
      <div id="startScreen">
        <h1>Starfield</h1>
        <button onClick={() => startGame('easy')}>Easy</button>
        <button onClick={() => startGame('medium')}>Medium</button>
        <button onClick={() => startGame('hard')}>Hard</button>
      </div>
      <div id="score">Destroyed Boxes: {destroyedBoxes}</div>
      <div id="timer">Time Left: {timeLeft}s</div>
      <button id="soundButton" onClick={toggleMute}>
        <img src={soundIcon} alt="Sound Icon" />
      </button>
      {gameOver && (
        <div id="gameOverScreen">
          <h1>Game Over!</h1>
          <p>You destroyed {destroyedBoxes} boxes.</p>
          <button onClick={retryGame}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default Starfield;