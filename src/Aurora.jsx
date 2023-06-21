import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Aurora = (props) => {
	const containerRef = useRef(null);
	const [isMouse, setIsMouse] = useState(false);
	const [isTouch, setIsTouch] = useState(false);

	const [mouseX, setMouseX] = useState();
	const [mouseY, setMouseY] = useState();

	const [touchX, setTouchX] = useState();
	const [touchY, setTouchY] = useState();

	useEffect(() => {
		let LABEL_TEXT = isTouch ? "hold and focus" : "Tap Anywhere";

		const clock = new THREE.Clock();
		const scene = new THREE.Scene();

		const restartAnimButton = document.getElementById("restart-anim");

		let renderBufferA = new THREE.WebGLRenderTarget(
			window.innerWidth * window.devicePixelRatio,
			window.innerHeight * window.devicePixelRatio
		);
		let renderBufferB = new THREE.WebGLRenderTarget(
			window.innerWidth * window.devicePixelRatio,
			window.innerHeight * window.devicePixelRatio
		);

		const renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0xff0000);
		renderer.setClearAlpha(1);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio || 1);
		containerRef.current.appendChild(renderer.domElement);

		const orthoCamera = new THREE.OrthographicCamera(
			-window.innerWidth / 2,
			window.innerWidth / 2,
			window.innerHeight / 2,
			-window.innerHeight / 2,
			0.1,
			10
		);
		orthoCamera.position.set(0, 0, 1);
		orthoCamera.lookAt(new THREE.Vector3(0, 0, 0));

		const labelMeshSize =
			window.innerWidth > window.innerHeight
				? window.innerHeight
				: window.innerWidth;
		const labelGeometry = new THREE.PlaneBufferGeometry(
			labelMeshSize,
			labelMeshSize
		);

		let fontColor = "black";

		let labelTextureCanvas;
		{
			labelTextureCanvas = document.createElement("canvas");
			const labelTextureCtx = labelTextureCanvas.getContext("2d");
			const textureSize = Math.min(
				renderer.capabilities.maxTextureSize,
				2048
			);
			const relativeFontSize = 300;
			labelTextureCanvas.width = textureSize;
			labelTextureCanvas.height = textureSize;
			labelTextureCtx.textAlign = "center";
			labelTextureCtx.textBaseline = "bottom";
			labelTextureCtx.font = `${relativeFontSize}px Helvetica`;
			const textWidth = labelTextureCtx.measureText(LABEL_TEXT).width;
			const widthDelta = labelTextureCanvas.width / textWidth;
			const fontSize = relativeFontSize * widthDelta * 0.5;
			labelTextureCtx.font = `${fontSize}px Helvetica`;
			labelTextureCtx.fillStyle = isTouch
				? "rgba(255, 255, 255, 0.05)"
				: "rgba(255, 255, 255, 1.05)";
			labelTextureCtx.fillText(
				LABEL_TEXT,
				labelTextureCanvas.width / 2,
				labelTextureCanvas.height / 2
			);
		}

		let labelMaterial = new THREE.MeshBasicMaterial({
			map: new THREE.CanvasTexture(labelTextureCanvas),
			transparent: true,
			color: 0x000,
		});

		const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);

		const geometryImgd = new THREE.PlaneBufferGeometry(100, 100);
		const texture = new THREE.TextureLoader().load(
			"https://a5.behance.net/2560beef5b406e036afa8db071e2d45613d7f8c8/img/for_you/creative_cloud_row/creative-cloud-product-image.png",
			renderer
		);
//		scene.add(labelMesh);
		const materialImgd = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
		});
		const meshd = new THREE.Mesh(geometryImgd, materialImgd);
		//scene.add(meshd);

		// Add mesh to the scene
		let geometryImg = new THREE.CircleGeometry(20, 32);
		let textureHand = new THREE.TextureLoader().load(
			"https://raw.githubusercontent.com/schmidtn-dot/load/main/assets/new_touch_new_rausch_schwarz.svg"
		);
		let materialImg = new THREE.MeshBasicMaterial({
			map: textureHand,
			transparent: true,
		});
		const mesh = new THREE.Mesh(geometryImg, materialImg);
		scene.add(mesh);

		const postFXScene = new THREE.Scene();
		const postFXGeometry = new THREE.PlaneBufferGeometry(
			window.innerWidth,
			window.innerHeight
		);
		const postFXMaterial = new THREE.ShaderMaterial({
			uniforms: {
				sampler: { value: null },
				progress: { value: 0.001 },
				time: { value: 110 },
				rotationTime: { value: 0.0 },
				rate: { value: 1 },
				tilt: { value: 0 },
				mousePosX: { value: 0.0 },
				mousePosY: { value: 0.0 },
				orientation: { value: new THREE.Vector2(0, 0) },
				visi: { value: 0.99 },
			},
			// vertex shader will be in charge of positioning our plane correctly
			vertexShader: `
          varying vec2 v_uv;
          uniform float progress;
          uniform float time;
          uniform float rate;
          uniform float rotationTime;
          uniform float mousePosX;
          uniform float mousePosY;
    
    
    
          void main () {
            // Set the correct position of each plane vertex
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position , vec3(rate,0.0,0.5) ) * mat4(cos(rotationTime), -sin(rotationTime), 0.0, 0.0, sin(rotationTime), cos(rotationTime), 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);     
            //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, .95);
    
    
            // Pass in the correct UVs to the fragment shader
            v_uv = uv;
          }
        `,
			fragmentShader: `
          // Declare our texture input as a "sampler" variable
          uniform sampler2D sampler;
    
          // Consume the correct UVs from the vertex shader to use
          // when displaying the gened texture
          
          uniform float progress;
          uniform float time;
          uniform float tilt;
          uniform float orientation;
          uniform float rate;
          uniform float mousePosX;
          uniform float mousePosY;
          uniform float visi;
    
    
    
          varying vec2 v_uv;
          
           //	Simplex 3D Noise 
          //	by Ian McEwan, Ashima Arts
          //
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    
          float snoise(vec3 v){ 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
          // First corner
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 =   v - i + dot(i, C.xxx) ;
    
          // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
    
            //  x0 = x0 - 0. + 0.0 * C 
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    
          // Permutations
            i = mod(i, 289.0 ); 
            vec4 p = permute( permute( permute( 
                       i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                     + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                     + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    
          // Gradients
          // ( N*N points uniformly over a square, mapped onto an octahedron.)
            float n_ = 1.0/7.0; // N=7
            vec3  ns = n_ * D.wyz - D.xzx;
    
            vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
    
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
    
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
    
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
    
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
    
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
    
          //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
    
          // Mix final noise value
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                          dot(p2,x2), dot(p3,x3) ) );
          }
    
          void main () {
          
            // Sample the correct color from the generated texture
            //vec4 inputColor = texture2D(sampler, v_uv + vec2(.00));
              float a = snoise(vec3(v_uv * 15.1, time * 3.1)) * .009;
            float b = snoise(vec3(v_uv * 166.1, time * .1 + .1)) * .0019;
            //vec4 inputColor = texture2D(sampler, v_uv + vec2(a * .005, b * .005) + vec2(-.0));
            vec4 inputColor = texture2D(sampler, v_uv + vec2(a * .095, b * .065) + vec2(mousePosX * 0.015, mousePosY * 0.0015) );
    
          
            // Set the correct color of each pixel that makes up the plane
            gl_FragColor = vec4(inputColor * (1.0 + (.8 - (rate * visi))));
            //gl_FragColor = vec4(inputColor * visi);
    
          }
        `,
			transparent: false,
		});
		const postFXMesh = new THREE.Mesh(postFXGeometry, postFXMaterial);
		postFXScene.add(postFXMesh);
		/*
    restartAnimButton.addEventListener('click', () => {
      renderer.setRenderTarget(renderBufferA);
      renderer.clear();
      renderer.setRenderTarget(renderBufferB);
      renderer.clear();
    });
*/
		let pos = 350;
		let scroll = 0;
		let scrollTarget = 0;
		let currentScroll = 0;
		let number = 0;
		let down = false;
		let currentTime = 0;
		let tx = window.innerWidth / 2;
		let ty = window.innerHeight / 2;

		function updateMesh() {
			currentTime += 0.05;
			mesh.rotation.z -= 0.001;
			postFXMesh.material.uniforms.time.value = currentTime * 0.1;

			pos += scroll * 0.1;

			labelMesh.position.y =
				(pos % window.innerHeight) - window.innerHeight / 2 + 100;
			number += scroll * 0.00028;

			mesh.position.y = window.innerHeight / 2 - ty;
			mesh.position.x = tx - window.innerWidth / 2;
			postFXMesh.material.uniforms.mousePosX.value =
				(tx - window.innerWidth / 2) * 0.005;
			postFXMesh.material.uniforms.mousePosY.value =
				(window.innerHeight / 2 - ty) * 0.037;
			if (isTouch) {
				//			postFXMesh.material.uniforms.visi.value -= .00003;
			}
		}

		function onAnimLoop() {
			scroll += (scrollTarget - scroll) * 0.1;
			scroll *= 0.9;
			scrollTarget *= 0.9;
			currentScroll *= scroll * 0.01;

			updateMesh();

			number = 1;

			labelMesh.material.color.r = number;
			labelMesh.material.color.b = number;
			labelMesh.material.color.g = number;

			renderer.autoClearColor = false;

			renderer.setRenderTarget(renderBufferA);
			renderer.render(postFXScene, orthoCamera);
			renderer.render(scene, orthoCamera);

			renderer.setRenderTarget(null);
			postFXMesh.material.uniforms.sampler.value = renderBufferA.texture;
			renderer.render(postFXScene, orthoCamera);

			const temp = renderBufferA;
			renderBufferA = renderBufferB;
			renderBufferB = temp;
		}

		function handleScroll(e) {
			scrollTarget = e.deltaY * 0.1;
		}

		function handelTouchDown(e) {
			tx = e.touches[0].clientX;
			ty = e.touches[0].clientY;
			setTouchY(e.touches[0].clientY);
			setIsTouch(true);
			props.startCount();
		}
		/*
		if (isMouse) {
			postFXMesh.material.uniforms.visi.value = 0.85;
			console.log(mouseX);
			console.log(mouseY);
			postFXMesh.material.uniforms.rate.value = 0.99;
			mesh.position.y = window.innerHeight / 2 - mouseY;
			mesh.position.x = mouseX - window.innerWidth / 2;
			postFXMesh.material.uniforms.visi.value = 0.98;
			mesh.position.y = window.innerHeight / 2 - mouseY;
			mesh.position.x = mouseX - window.innerWidth / 2;
			setIsMouse(true);
		} else {
			postFXMesh.material.uniforms.visi.value = 0.95;
		}

		if (tx) {
			postFXMesh.material.uniforms.visi.value = 0.85;
			console.log(mouseX);
			console.log(mouseY);
			postFXMesh.material.uniforms.rate.value = 0.96;
			/*
			mesh.position.y = window.innerHeight / 2 - touchY;
			mesh.position.x = touchX - window.innerWidth / 2;
			mesh.position.y = window.innerHeight / 2 - touchY;
			mesh.position.x = touchX - window.innerWidth / 2;

			mesh.position.y = window.innerHeight / 2 - touchY;
			mesh.position.x = tx - window.innerWidth / 2;
			postFXMesh.material.uniforms.mousePosX.value =
				(tx - window.innerWidth / 2) * 0.005;
			postFXMesh.material.uniforms.mousePosY.value =
				(window.innerHeight / 2 - touchY) * 0.037;
			// postFXMesh.material.uniforms.visi.value += 0.0001
			mesh.material.opacity = 1;
		} else {
			postFXMesh.material.uniforms.visi.value = 0.99;
			mesh.material.opacity = 0;
		}
		*/
		if (isTouch) {
			postFXMesh.material.uniforms.rate.value = 0.96;
			postFXMesh.material.uniforms.visi.value = 0.85;
			mesh.material.opacity = 1;
		} else {
			postFXMesh.material.uniforms.visi.value = 1.1;
		}
		window.addEventListener("wheel", handleScroll);
		window.addEventListener("touchmove", (e) => handelTouchDown(e));

		renderer.setAnimationLoop(onAnimLoop);

		return () => {
			window.removeEventListener("wheel", handleScroll);
			window.removeEventListener("touchmove", handelTouchDown);
			renderer.setAnimationLoop(null);
			containerRef.current.removeChild(renderer.domElement);
			renderer.dispose();
		};
	}, [isMouse, isTouch]);

	const handleMouseDown = (e) => {
		setMouseX(e.pageX);
		setMouseY(e.pageY);
		setIsMouse(true);
	};

	const handleMouseUp = () => {
		setIsMouse(false);
	};

	const handleTouchStart = (e) => {
		const touch = e.touches[0];
		setTouchX(touch.clientX);
		setTouchY(touch.clientY);
		setIsTouch(true);
	};

	const handelTouchCancel = (e) => {
		setIsTouch(false);
		props.stopCount();
	};

	const handleTouchEnd = () => {
		setIsTouch(false);
	};

	//const handelPress = () => {setIsPressed(!isPressed)}

	return (
		<div>
			<h1>{touchX}</h1>
			<div
				ref={containerRef}
				onMouseDown={(e) => handleMouseDown(e)}
				onMouseUp={handleMouseUp}
				onTouchStart={(e) => handelTouchStart(e)}
				onTouchEnd={handelTouchCancel}
				onTouchCancel={handelTouchCancel}
			></div>
		</div>
	);
};

export default Aurora;
