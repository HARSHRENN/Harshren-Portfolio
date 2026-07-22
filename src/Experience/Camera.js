import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.config = this.experience.config

        if (this.config.vertical === true) {
            this.aboutMeDistance = 2.6
            this.projectsDistance = 4.6
        }
        else {
            this.aboutMeDistance = 2.2
            this.projectsDistance = 4.2
        }



        this.setInstance()
        this.setControls()
        this.setCamAngles()
        this.setTransitions()

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('camera')

            this.positionDebugFolder = this.debugFolder.addFolder('cameraPosition')
            this.positionDebugFolder.add(this.instance.position, 'x').min(-20).max(20).step(0.01).listen()
            this.positionDebugFolder.add(this.instance.position, 'y').min(-20).max(20).step(0.01).listen()
            this.positionDebugFolder.add(this.instance.position, 'z').min(-20).max(20).step(0.01).listen()

            this.targetDebugFolder = this.debugFolder.addFolder('cameraTarget')
            this.targetDebugFolder.add(this.controls.target, 'x').min(-20).max(20).step(0.01).listen()
            this.targetDebugFolder.add(this.controls.target, 'y').min(-20).max(20).step(0.01).listen()
            this.targetDebugFolder.add(this.controls.target, 'z').min(-20).max(20).step(0.01).listen()

            this.debugFolder.add(this.controls, 'enablePan')

            this.cam = false
            this.cameraToggle = { unlockCamera: false }
            this.debugFolder
                .add(this.cameraToggle, 'unlockCamera')
                .onChange(() => {
                    this.cam ? this.camAngle.default() : this.camAngle.unlocked()
                })

            this.debugHelper = {
                logCoordinates: () => {
                    console.log(`Camera Position: x: ${this.instance.position.x.toFixed(2)}, y: ${this.instance.position.y.toFixed(2)}, z: ${this.instance.position.z.toFixed(2)}`);
                    console.log(`Camera Target: x: ${this.controls.target.x.toFixed(2)}, y: ${this.controls.target.y.toFixed(2)}, z: ${this.controls.target.z.toFixed(2)}`);
                }
            }
            this.debugFolder.add(this.debugHelper, 'logCoordinates').name('Print Coordinates')
        }
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.4, 50)
        // Starting angle before you click START (wide shot of the garage)
        this.instance.position.x = -8
        this.instance.position.y = 2
        this.instance.position.z = 14
        this.scene.add(this.instance)
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.enablePan = false
        this.controls.rotateSpeed = 1.2
        this.controls.zoomSpeed = 0.8
        // Starting target before you click START
        this.controls.target.set(0, 0, -1)
        this.controls.enableRotate = false
        this.controls.enableZoom = false
    }

    setCamAngles() {
        this.camAngle = {}

        this.camAngle.unlocked = () => {
            this.controls.maxDistance = 30
            this.controls.minDistance = 0
            this.controls.minAzimuthAngle = -Infinity
            this.controls.maxAzimuthAngle = Infinity
            this.controls.minPolarAngle = 0
            this.controls.maxPolarAngle = Math.PI
            this.cam = true
        }

        this.camAngle.default = () => {
            this.controls.minDistance = 1
            this.controls.maxDistance = 30
            this.controls.minAzimuthAngle = 0
            this.controls.maxAzimuthAngle = Math.PI * 1.9999
            this.controls.minPolarAngle = Math.PI * 0.2
            this.controls.maxPolarAngle = Math.PI * 0.55
            this.cam = false
        }

        this.camAngle.vendingMachine = () => {
            this.controls.minDistance = 0.1
            this.controls.maxDistance = 5 // Increased from 3 to prevent camera snapping
            this.controls.minAzimuthAngle = -Infinity
            this.controls.maxAzimuthAngle = Infinity
            this.controls.minPolarAngle = 0
            this.controls.maxPolarAngle = Math.PI
            this.cam = false
        }

        this.camAngle.aboutMe = () => {
            this.controls.minDistance = 0.1
            this.controls.maxDistance = 30
            this.controls.minAzimuthAngle = -Infinity
            this.controls.maxAzimuthAngle = Infinity
            this.controls.minPolarAngle = 0
            this.controls.maxPolarAngle = Math.PI
            this.controls.enableRotate = false
            this.controls.enableZoom = false
        }

        this.camAngle.credits = () => {
            this.controls.minDistance = 1.5
            this.controls.maxDistance = 2.5
            this.controls.minAzimuthAngle = -(Math.PI * 0.2) //left
            this.controls.maxAzimuthAngle = Math.PI * 0.2 //right
            this.controls.minPolarAngle = Math.PI * .3
            this.controls.maxPolarAngle = Math.PI * .65
        }

        this.camAngle.workbench = () => {
            this.controls.minDistance = 0.1
            this.controls.maxDistance = 8
            this.controls.minAzimuthAngle = -Infinity
            this.controls.maxAzimuthAngle = Infinity
            this.controls.minPolarAngle = 0
            this.controls.maxPolarAngle = Math.PI
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

        this.camAngle.experience = () => {
            this.controls.minDistance = 0.1
            this.controls.maxDistance = 10
            this.controls.minAzimuthAngle = -Infinity
            this.controls.maxAzimuthAngle = Infinity
            this.controls.minPolarAngle = 0
            this.controls.maxPolarAngle = Math.PI
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

    }

    setTransitions() {
        this.transitions = {}

        this.transitions.vendingMachine = async (duration) => {
            this.controls.enableRotate = false
            this.controls.enableZoom = false

            gsap.to(this.instance.position, {
                duration: duration, ease: "power1.inOut",
                x: -4.77,
                y: -3.09,
                z: 1.48
            })

            gsap.to(this.controls.target, {
                duration: duration, ease: "power1.inOut",
                x: -2.80,
                y: -3.40,
                z: 1.50
            })

            await this.sleep(1500)
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

        this.transitions.default = async (duration) => {
            this.controls.enableRotate = false
            this.controls.enableZoom = false

            gsap.to(this.instance.position, {
                duration: duration, ease: "power1.inOut",
                x: 3.88,
                y: -1.46,
                z: 8.38
            })

            gsap.to(this.controls.target, {
                duration: duration, ease: "power1.inOut",
                x: 2.60,
                y: -2.00,
                z: 2.00
            })

            await this.sleep(1500)
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

        this.transitions.jZhou = async (duration) => {
            this.controls.enableRotate = false
            this.controls.enableZoom = false

            gsap.to(this.instance.position, {
                duration: duration, ease: "power1.inOut",
                x: -10.2,
                y: 6.3,
                z: 3.8
            })

            await this.sleep(1500)
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

        this.transitions.aboutMe = async (duration) => {
            this.controls.enableRotate = false
            this.controls.enableZoom = false

            gsap.to(this.instance.position, {
                duration: duration, ease: "power1.inOut",
                x: -2.94,
                y: -3.20,
                z: -4.61
            })
            gsap.to(this.controls.target, {
                duration: duration, ease: "power1.inOut",
                x: -2.70,
                y: -2.80,
                z: -20.00
            })

            await this.sleep(1500)
            // this.controls.enableRotate = true
            // this.controls.enableZoom = true
        }

        this.transitions.credits = async (duration) => {
            this.controls.enableRotate = false
            this.controls.enableZoom = false

            gsap.to(this.instance.position, {
                duration: duration, ease: "power1.inOut",
                x: -0.6,
                y: -1.05,
                z: 3.8
            })
            gsap.to(this.controls.target, {
                duration: duration, ease: "power1.inOut",
                x: -0.6,
                y: -1.05,
                z: 2.2
            })

            await this.sleep(1500)
            // this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

        this.transitions.workbench = async (duration) => {
            this.controls.enableRotate = false
            this.controls.enableZoom = false

            // Pan to look at the workbench / tool wall
            gsap.to(this.instance.position, {
                duration: duration, ease: "power1.inOut",
                x: 3.30,
                y: -1.88,
                z: -0.21
            })
            gsap.to(this.controls.target, {
                duration: duration, ease: "power1.inOut",
                x: 2.60,
                y: -2.30,
                z: 1.50
            })

            await this.sleep(1500)
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

        this.transitions.experience = async (duration) => {
            this.controls.enableRotate = false
            this.controls.enableZoom = false

            // Look at the arcade/credits area from a fresh angle
            gsap.to(this.instance.position, {
                duration: duration, ease: "power1.inOut",
                x: -0.6,
                y: -2.0,
                z: 5.5
            })
            gsap.to(this.controls.target, {
                duration: duration, ease: "power1.inOut",
                x: -0.6,
                y: -2.4,
                z: 2.0
            })

            await this.sleep(1500)
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        this.controls.update()
    }
}

// test