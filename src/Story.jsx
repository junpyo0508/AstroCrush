import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import modelPaths from './data/modelPath';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from "gsap";

export function Story({ startGame }) {
  const containerRef = useRef(null);
  const [showDifficultyButtons, setShowDifficultyButtons] = useState(false);
  const [showGameDescription, setShowGameDescription] = useState(false);

  useEffect(() => {
    if (!showGameDescription) return;

    const divContainer = containerRef.current;
    if (!divContainer) return;

    let WIDTH = window.innerWidth;
    let HEIGHT = window.innerHeight;

    let scene, camera, renderer;

    let model = new THREE.Object3D();
    let modelBody = new THREE.Object3D();

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, WIDTH / HEIGHT, 1, 1000);
      camera.position.set(0, 20, 190);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(WIDTH, HEIGHT);
      renderer.shadowMap.enabled = true;

      document.querySelector("#spaceship").appendChild(renderer.domElement);

      {
        var light = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
        light.position.set(100, 100, 100);
        scene.add(light);
      }
      {
        const color = 0xffffff;
        const intensity = 2;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(140, 160, 150);
        scene.add(light);
      }

      ModelLoadFunc(modelPaths[10]);
    };

    const ModelLoadFunc = (modelName) => {
      const ModelLoader = new GLTFLoader();

      ModelLoader.load(
        modelName,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(2.5, 2.5, 2.5);
          model.position.set(0, 0, 0);
          model.rotation.set(0.4, -5, 0);

          modelBody.position.set(0, 10, 0);
          modelBody.add(model);
          scene.add(modelBody);

          gsap.from("h2", {
            duration: 0.8,
            delay: 0.35,
            y: 60,
            alpha: 0,
            ease: "Power2.easeInOut",
          });
          gsap.from("p", {
            duration: 0.8,
            delay: 0.35,
            y: 60,
            alpha: 0,
            ease: "Power2.easeInOut",
          });

          gsap.from(model.position, {
            duration: 1.8,
            delay: 0.5,
            x: 0,
            z: -100,
            ease: "Power2.easeInOut",
          });

          gsap.to(model.position, {
            duration: 5,
            x: 100,
            y: 50,
            z: 30,
            repeat: -1,
            yoyo: true,
            ease: "Power1.easeInOut",
            onUpdate: () => {
              const time = performance.now() / 1000;
              model.rotation.x += Math.sin(time) * 0.001;
              model.rotation.y += Math.sin(time) * 0.01;
              model.rotation.z += Math.sin(time) * 0.001;
            },
          });
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.error('An error happened', error);
        }
      );
    };

    let moveNum = 0;
    let scrollTop = 0;

    const scrollFunc = () => {
      scrollTop = window.scrollY;
    };

    const animate = () => {
      moveNum += (scrollTop / 200 - moveNum) * 0.1;

      // if (model) {
      //   model.rotation.y += 0.1;
      // }
      // if (modelBody) {

      //   // modelBody.position.x = moveNum;
      //   // // modelBody.position.y += moveNum;
      //   // modelBody.position.z += moveNum/12;
      //   modelBody.rotation.y += 0.1;

      //   modelBody.rotation.y = moveNum;
      //   modelBody.rotation.z = moveNum / 12;
      // }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener("scroll", scrollFunc);

    return () => {
      window.removeEventListener("scroll", scrollFunc);
    };
  }, [showGameDescription]);

  return (
    <>
      <div id="startScreen" ref={containerRef}>
        {!showDifficultyButtons && !showGameDescription && (
          <>
            <h1>AstroCrush</h1>
            <div className="button-container">
              <button onClick={() => setShowDifficultyButtons(true)}>Select Difficulty</button>
              <button onClick={() => setShowGameDescription(true)}>Game Description</button>
            </div>
          </>
        )}
        {showDifficultyButtons && (
          <>
            <h1>AstroCrush</h1>
            <button onClick={() => startGame('easy')}>Easy</button>
            <button onClick={() => startGame('medium')}>Medium</button>
            <button onClick={() => startGame('hard')}>Hard</button>
          </>
        )}
        {showGameDescription && (
          <article>
            <div id='spaceship'></div>
            <h2>AstroCrush</h2>
            <p>
              In the near future, with space development booming, asteroids and orbital debris around planets have become a serious issue.<br />
              To deal with it, a new job emerges: the space debris cleaner.
            </p>
            <p>
              The main character, Kael, pilots a small cleaning ship, spending each day breaking apart drifting asteroids and space junk near planets.<br />
              The job is simple: scan the objects, choose the right tool, shoot, and clean up the remains.
            </p>
            <p>
              One day, Kael discovers a high-performance abandoned cleaning ship called “Stella Blade” and manages to repair and use it.<br />
              This ship is equipped with precision lasers, shockwave missiles, and an auto-orbit calculation system—a major upgrade.<br />
              With this new vessel, Kael’s efficiency skyrockets.
              They’re assigned to larger zones and encounter all kinds of strange junk, rare minerals, and occasionally unknown equipment during their routine.
            </p>
            <p>
              In the end, this is a story about<br/>
              “a regular worker cleaning up space.”<br/>
              The only twist? The workplace is zero-gravity fields and meteor showers.
            </p>
          </article>
        )}
      </div>
    </>
  );
}