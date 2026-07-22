import * as THREE from 'three'
import Experience from '../Experience.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('environment')
        }

        this.setSunLight()
        this.setSky()
        this.setEnvironmentMap()
    }

    setSunLight() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
        this.scene.add(this.ambientLight)

        this.sunLight = new THREE.DirectionalLight(0xffffff, 2)
        this.sunLight.position.set(5, 5, 5)
        this.scene.add(this.sunLight)
    }

    setSky() {
        this.sky = new Sky()
        this.sky.scale.setScalar(450000)
        this.scene.add(this.sky)

        const sun = new THREE.Vector3()

        const effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 5,
            azimuth: 180
        }

        const uniforms = this.sky.material.uniforms
        uniforms[ 'turbidity' ].value = effectController.turbidity
        uniforms[ 'rayleigh' ].value = effectController.rayleigh
        uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient
        uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG

        const updateSun = () => {
            const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation )
            const theta = THREE.MathUtils.degToRad( effectController.azimuth )
            sun.setFromSphericalCoords( 1, phi, theta )
            uniforms[ 'sunPosition' ].value.copy( sun )
        }

        updateSun()

        if(this.debug.active) {
            const skyFolder = this.debugFolder.addFolder('sky')
            skyFolder.add(effectController, 'elevation', 0, 90, 0.1).onChange(updateSun)
            skyFolder.add(effectController, 'azimuth', -180, 180, 0.1).onChange(updateSun)
            skyFolder.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange((v) => uniforms[ 'turbidity' ].value = v)
            skyFolder.add(effectController, 'rayleigh', 0.0, 4.0, 0.001).onChange((v) => uniforms[ 'rayleigh' ].value = v)
        }
    }

    setEnvironmentMap() {
        // Add environment map if available later
    }
}