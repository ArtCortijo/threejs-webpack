import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'

// Texture Loader
const textureLoader = new THREE.TextureLoader()

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const geometry = new THREE.PlaneBufferGeometry(1, 1.3)

for (let i = 0; i < 4; i++) {
	const material = new THREE.MeshBasicMaterial({
		map: textureLoader.load(`/photographs/space-${i+1}.jpg`)
	})

	const img = new THREE.Mesh(geometry, material)
	img.position.set(Math.random() + 0.3, i*-1.8)

	scene.add(img)
}

let objs = []

scene.traverse((object) => {
	if (object.isMesh) {
		objs.push(object)
	}
})

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}

window.addEventListener('resize', () =>
{
	// Update sizes
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	// Update camera
	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	// Update renderer
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

gui.add(camera.position, 'y').min(-5).max(10)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Mouse

window.addEventListener('wheel', onMouseWheel)

let y = 0
let position = 0

function onMouseWheel(event) {
	y = event.deltaY * 0.007
}

const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (event) => {
	mouse.x = event.clientX / sizes.width * 2 - 1
	mouse.y = - ( event.clientY / sizes.width ) * 2 + 1
})

/**
 * Animate
 */

const raycaster = new THREE.Raycaster()

const clock = new THREE.Clock()

const tick = () =>
{

	const elapsedTime = clock.getElapsedTime()

	// Update objects
	position += y
	y *= 0.9
	camera.position.y = position

	// Raycaster
	raycaster.setFromCamera(mouse, camera)
	const intersects = raycaster.intersectObjects(objs)
	console.log(intersects)

	for(const intersect of intersects) {
		// intersect.object.scale.set(1.1, 1.1)
		gsap.to(intersect.object.scale, {
			x: 1.3, 
			y: 1.3
		})
		gsap.to(intersect.object.rotation, {
			y: -0.5
		})
		gsap.to(intersect.object.position, {
			z: -0.9
		})
	}

	for(const object of objs) {
		if (!intersects.find(intersect => intersect.object === object)) {
			// object.scale.set(1, 1)
			gsap.to(object.scale, {
				x: 1, 
				y: 1
			})
			gsap.to(object.rotation, {
				y: 0
			})
			gsap.to(object.position, {
				z: 0
			})
		}
	}

	// Update Orbital Controls
	// controls.update()

	// Render
	renderer.render(scene, camera)

	// Call tick again on the next frame
	window.requestAnimationFrame(tick)
}

tick()