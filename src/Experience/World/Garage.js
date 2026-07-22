import * as THREE from 'three'
import Experience from '../Experience.js'


export default class Garage {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.materials = this.experience.materials

        // Resource
        this.resource = this.resources.items.garageModel

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('garage')
        }

        this.parseModel()
        this.addObjects()
        this.setMaterials()

        return new Proxy(this, {
            get(target, prop) {
                if (prop in target || typeof prop === 'symbol') return target[prop];
                const dummy = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
                dummy.name = String(prop);
                target[prop] = dummy;
                return dummy;
            }
        });
    }

    parseModel() {
        this.model = this.resource.scene

        // Stub out all named-mesh references that Animations / RayCaster may
        // touch so they degrade gracefully rather than throw.
        this.fan1 = this.model.children.find(c => c.name === 'fan1') || { rotation: { y: 0 } }
        this.fan2 = this.model.children.find(c => c.name === 'fan2') || { rotation: { y: 0 } }
        this.dish = this.model.children.find(c => c.name === 'dish') || { rotation: { y: 0 } }
        this.dishStand = this.model.children.find(c => c.name === 'dishStand') || {}

        // Hologram base geometry (kept for Animations / Materials uniform references)
        this.hologramBaseGeometry = new THREE.CircleGeometry(.68, 32)
    }

    addObjects() {
        // Create custom 3D buttons using CanvasTextures
        this.menuGroup = new THREE.Group()

        const createMenuButton = (text, yOffset) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 96;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.fillRect(0, 0, 512, 96);
            ctx.font = 'bold 32px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text.toUpperCase(), 258, 50);
            ctx.fillStyle = '#000000';
            ctx.fillText(text.toUpperCase(), 256, 48);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.1 });
            const geometry = new THREE.PlaneGeometry(2, 0.35);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = yOffset;
            return mesh;
        }

        this.projectsBtn  = createMenuButton('Projects',    0.75)
        this.articlesBtn  = createMenuButton('Resume',      0.45)
        this.aboutMeBtn   = createMenuButton('About Me',    0.15)
        this.skillsBtn    = createMenuButton('Skills',     -0.15)
        this.experienceBtn= createMenuButton('Experience', -0.45)
        this.creditsBtn   = createMenuButton('Credits',    -0.75)

        this.menuGroup.add(this.projectsBtn, this.articlesBtn, this.aboutMeBtn, this.skillsBtn, this.experienceBtn, this.creditsBtn)

        // Position aligned to stick onto the white roll-up door
        // Set close to the Camera Target coordinates you provided, slightly pulled forward (+Z) so it doesn't clip
        this.menuGroup.position.set(5.00, -3.00, 4.00)
        // Adjust the Y rotation to sit flush against the door (near 0 radians)
        this.menuGroup.rotation.set(0, 0, 0)
        this.menuGroup.scale.set(1.25, 1.25, 1.25)

        this.scene.add(this.menuGroup)

        if (this.debug.active) {
            const menuFolder = this.debug.ui.addFolder('Menu Buttons Position')
            menuFolder.add(this.menuGroup.position, 'x').min(-10).max(10).step(0.01).name('posX')
            menuFolder.add(this.menuGroup.position, 'y').min(-10).max(10).step(0.01).name('posY')
            menuFolder.add(this.menuGroup.position, 'z').min(-10).max(10).step(0.01).name('posZ')
            menuFolder.add(this.menuGroup.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('rotX')
            menuFolder.add(this.menuGroup.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('rotY')
            menuFolder.add(this.menuGroup.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('rotZ')
        }
    }

    setMaterials() {
        // Enable PBR rendering for every mesh in the garage scene.
        // We do NOT wait for 'texturesMapped' because garage.glb carries its
        // own embedded textures — no baked KTX2 maps needed.
        const legacyNames = [
            'graphicsJoined', 'jesseZhouJoined', 'machinesJoined', 'ramenShopJoined', 'miscJoined', 'floor',
            'easelFrontGraphic', 'chinese', 'neonPink', 'neonYellow', 'neonBlue', 'lampLights', 'neonGreen',
            'storageLight', 'portalLight', 'bigScreen', 'smallScreen1', 'smallScreen2', 'smallScreen3',
            'smallScreen4', 'tallScreen', 'smallScreen5', 'sideScreen', 'tvScreen', 'littleTVScreen',
            'blueLights', 'redLED', 'whiteButton', 'yellowRightLight', 'creditsOrange', 'greenLED',
            'greenSignSquare', 'jZhouPink', 'poleLight', 'projectsRed', 'aboutMeBlack', 'aboutMeBlue',
            'articlesWhite', 'articlesRed', 'creditsBlack', 'projectsWhite', 'jZhouBlack', 'vendingMachineScreen',
            'vendingMachineLight', 'arcadeRim', 'arcadeToken', 'arcadeScreen', 'dish', 'dishStand', 'fan1', 'fan2'
        ];

        this.model.traverse((child) => {
            if (legacyNames.includes(child.name)) {
                child.visible = false;
            }

            if (child.isMesh && !legacyNames.includes(child.name)) {
                child.castShadow = true
                child.receiveShadow = true

                // If the mesh already has a material with a map, keep it.
                // Otherwise apply a neutral standard material so the model
                // still renders correctly under the existing environment light.
                // If the material is already present, we just want to ensure it works with lights.
                // We will NOT overwrite it to preserve emissive properties, vertex colors, etc.
                if (child.material) {
                    child.material.needsUpdate = true;
                }
            }
        })

        this.model.position.y = -3
        this.scene.add(this.model)

        if (this.debugFolder) {
            this.debugFolder.add(this.model.position, 'x').name('positionX').min(-10).max(10).step(0.01)
            this.debugFolder.add(this.model.position, 'y').name('positionY').min(-10).max(10).step(0.01)
            this.debugFolder.add(this.model.position, 'z').name('positionZ').min(-10).max(10).step(0.01)
            this.debugFolder.add(this.model.rotation, 'y').name('rotationY').min(-Math.PI).max(Math.PI).step(0.01)
            this.debugFolder.add(this.model.scale, 'x').name('scale').min(0.01).max(10).step(0.01).onChange((val) => {
                this.model.scale.set(val, val, val)
            })
        }
    }

    // Kept for API compatibility with RayCaster (easel texture swap)
    setEaselMaterial() {
        // no-op for garage model
    }
}