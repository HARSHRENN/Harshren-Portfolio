import Experience from './Experience.js'
import gsap from 'gsap'
import * as THREE from 'three'

export default class Controller
{
    constructor()
    {

        // Setup
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.resources = this.experience.resources
        this.sounds = this.experience.sounds
        this.preLoader = this.experience.preLoader
        this.config = this.experience.config
        this.animations = this.experience.animations

        this.setLogic()
        this.setProjectControls()
        this.setMenuControls()
        this.setAboutMeControls()
        this.setArcadeScreenControls()
        this.setCamControls()
        this.setVideoControls()
        this.setSocialControls()
        this.setScreenTracker()

        this.resources.on('ready', () =>
        {
            this.garage = this.experience.world.garage
            this.materials = this.experience.materials
        })

    }

    

    // -------------------------------------------------------
    // 3D-to-2D screen tracker: keeps the popup perfectly
    // aligned with the car's centre-console screen at all times
    // -------------------------------------------------------
    setScreenTracker()
    {
        // The world-space centre of the car's infotainment screen.
        // Camera looks in the +X direction, so screen width spans Z-axis,
        // and screen height spans Y-axis.
        this.screenWorldPos = new THREE.Vector3(-2.80, -3.40, 1.80)

        // Tune these to grow / shrink the popup to exactly fit the physical screen.
        // Width  → Z-axis (left/right as seen from the camera)
        // Height → Y-axis (up/down)
        this.screenHalfWidthWorld  = 1.10   // half-width  in world units (Z)
        this.screenHalfHeightWorld = 0.35   // half-height in world units (Y)

        this._trackingActive = false
        this._popup = document.getElementById('projects-popup')

        this._updatePopupPosition = () =>
        {
            // Position and sizing are controlled cleanly by CSS modal window
            return
        }

        // Hook into the render loop via requestAnimationFrame
        const loop = () =>
        {
            this._updatePopupPosition()
            requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)
    }

    setLogic()
    {
        this.logic = {}
        this.logic.buttonsLocked = false
        this.logic.mode = 'menu'

        this.logic.lockButtons = async (lockDuration) =>
        {
            this.logic.buttonsLocked = true
            await this.sleep(lockDuration)
            this.logic.buttonsLocked = false
        }

        this.backButton = document.querySelector('.back-button')
        this.backButton.addEventListener('click', () => {
            if (this.logic.buttonsLocked === false && this.logic.mode !== 'menu') {
                this.sounds.playBloop()

                // Hide skills popup if in workbench mode
                if (this.logic.mode === 'workbench') {
                    const skillsPopup = document.getElementById('skills-popup')
                    if (skillsPopup) skillsPopup.classList.add('hidden')
                }

                // Hide about me popup if in aboutMe/skills/experience mode
                if (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills' || this.logic.mode === 'experience') {
                    const aboutMePopup = document.getElementById('aboutme-popup')
                    if (aboutMePopup) aboutMePopup.classList.add('hidden')
                }

                // Hide experience popup
                if (this.logic.mode === 'experienceView') {
                    const expPopup = document.getElementById('experience-popup')
                    if (expPopup) expPopup.classList.add('hidden')
                }

                this.logic.mode = 'menu'
                this.camControls.toDefault()
                
                // Hide projects popup
                const projectsPopup = document.getElementById('projects-popup');
                if (projectsPopup) projectsPopup.classList.add('hidden');

                // If exiting projects view
                if (this.logic.mode.includes('projects')) {
                    this.bigScreenTransition(
                        this.materials.vendingMachineScreenMaterial,
                        this.resources.items.vendingMachineDefaultTexture,
                        0.4,
                        true
                    )
                }
                
                // If exiting aboutMe view
                if (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills' || this.logic.mode === 'experience') {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenDefaultTexture,
                        0.4,
                        1,
                        0
                    )
                }

                // If exiting credits view
                if (this.logic.mode === 'credits' || this.logic.mode === 'thanks' || this.logic.mode === 'creditsStart') {
                    this.screenTransition(
                        this.materials.arcadeScreenMaterial,
                        this.resources.items.arcadeScreenDefaultTexture,
                        0.2
                    )
                }
            }
        })

        // Close popup button
        this.closePopupButton = document.getElementById('close-popup')
        if (this.closePopupButton) {
            this.closePopupButton.addEventListener('click', () => {
                this.sounds.playBloop()
                this._trackingActive = false
                document.getElementById('projects-popup').classList.add('hidden')
            })
        }

        // Close skills popup button
        this.closeSkillsPopupButton = document.getElementById('close-skills-popup')
        if (this.closeSkillsPopupButton) {
            this.closeSkillsPopupButton.addEventListener('click', () => {
                this.sounds.playBloop()
                document.getElementById('skills-popup').classList.add('hidden')
            })
        }

        // Skills tab switcher
        document.querySelectorAll('.skills-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.skills-tab').forEach(b => b.classList.remove('active'))
                document.querySelectorAll('.skills-tab-content').forEach(c => c.classList.add('hidden'))
                btn.classList.add('active')
                const tabId = 'tab-' + btn.dataset.tab
                const target = document.getElementById(tabId)
                if (target) target.classList.remove('hidden')
                this.sounds.playBloop()
            })
        })

        // About Me popup – close button
        const closeAboutMeBtn = document.getElementById('close-aboutme-popup')
        if (closeAboutMeBtn) {
            closeAboutMeBtn.addEventListener('click', () => {
                this.sounds.playBloop()
                document.getElementById('aboutme-popup').classList.add('hidden')
            })
        }

        // About Me popup – tab switcher
        document.querySelectorAll('.aboutme-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.aboutme-tab').forEach(b => b.classList.remove('active'))
                document.querySelectorAll('.aboutme-tab-content').forEach(c => c.classList.add('hidden'))
                btn.classList.add('active')
                const tabId = 'atab-' + btn.dataset.atab
                const target = document.getElementById(tabId)
                if (target) target.classList.remove('hidden')
                this.sounds.playBloop()
            })
        })

        // Close experience popup button
        const closeExpBtn = document.getElementById('close-experience-popup')
        if (closeExpBtn) {
            closeExpBtn.addEventListener('click', () => {
                this.sounds.playBloop()
                document.getElementById('experience-popup').classList.add('hidden')
            })
        }
    }

    // Project selection

    setProjectControls()
    {
        this.projectControls = {}
        this.projectControls.project1 = async () =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'projects0')
            {
                this.sounds.playBloop()
                this.logic.mode = 'projects1'
                this.bigScreenTransition(
                    this.materials.vendingMachineScreenMaterial,
                    this.resources.items.project1Texture,
                    0.2
                )
            }
        }
        this.projectControls.project2 = async () =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'projects0')
            {
                this.sounds.playBloop()
                this.logic.mode = 'projects2'
                this.bigScreenTransition(
                    this.materials.vendingMachineScreenMaterial,
                    this.resources.items.project2Texture,
                    0.2
                )
            }
        }
        this.projectControls.project3 = async () =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'projects0')
            {
                this.sounds.playBloop()
                this.logic.mode = 'projects3'
                this.bigScreenTransition(
                    this.materials.vendingMachineScreenMaterial,
                    this.resources.items.project3Texture,
                    0.2
                )
            }
        }
        this.projectControls.project4 = async () =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'projects0')
            {
                this.sounds.playBloop()
                this.logic.mode = 'projects4'
                this.bigScreenTransition(
                    this.materials.vendingMachineScreenMaterial,
                    this.resources.items.project4Texture,
                    0.2
                )
            }
        }

        // Go back
        this.projectControls.projectBack = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'projects0'))
            {
                this.sounds.playBloop()
                this.logic.lockButtons(1500)
                this.logic.mode = 'menu'
                this.camControls.toDefault()
                this.bigScreenTransition(
                    this.materials.vendingMachineScreenMaterial,
                    this.resources.items.vendingMachineDefaultTexture,
                    0.4,
                    true
                )
            }

            if(this.logic.buttonsLocked === false && (this.logic.mode === 'projects1' || this.logic.mode === 'projects2' || this.logic.mode === 'projects3'|| this.logic.mode === 'projects4'))
            {
                this.sounds.playBloop()
                this.logic.mode = 'projects0'
                this.bigScreenTransition(
                    this.materials.vendingMachineScreenMaterial,
                    this.resources.items.vendingMachineMenuTexture,
                    0.2
                )
            }
            console.log('projectBack')
        }

        // Enter
        this.projectControls.projectEnter = async () =>
        {
            console.log('projectEnter')
        }
    }

    // Main menu controls

    setMenuControls()
    {
        this.menuControls = {}
        this.menuControls.projects = async (obj, color) =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'menu')
            {
                this.sounds.playClick()
                this.logic.mode = 'projects0'
                this.menuControls.buttonIndicator(obj, color)
                this.camControls.toProjects()

                this.bigScreenTransition(
                    this.materials.vendingMachineScreenMaterial,
                    this.resources.items.vendingMachineMenuTexture,
                    0.2
                )
            }
 
        }
        this.menuControls.jZhou = async (obj, color) =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'menu')
            {
                this.sounds.playClick()
                this.sounds.playWhoosh()
                this.menuControls.buttonIndicator(obj, color)
                this.camera.transitions.jZhou(1.5)
            }
        }
        this.menuControls.articles = async (obj, color) =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'menu')
            {
                this.sounds.playClick()
                this.menuControls.buttonIndicator(obj, color)
                await this.sleep(250)
                
                // Create a temporary link to download the resume
                const link = document.createElement('a')
                link.href = 'models/resume.pdf'
                link.download = 'Resume.pdf'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
        }
        this.menuControls.aboutMe = async (obj, color) =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'menu')
            {
                this.sounds.playClick()
                this.logic.mode = 'aboutMe'
                this.menuControls.buttonIndicator(obj, color)
                this.camControls.toAboutMe()

                // Show About Me popup
                const aboutMePopup = document.getElementById('aboutme-popup')
                if (aboutMePopup) {
                    await this.sleep(800)
                    aboutMePopup.classList.remove('hidden')
                }

                if(this.config.vertical === true)
                {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenAboutMeMobileTexture,
                        0.2,
                    )
                }
                else
                {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenAboutMeTexture,
                        0.2,
                    )
                }
            }
        }
        this.menuControls.credits = async (obj, color) =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'menu')
            {
                this.sounds.playClick()
                this.logic.mode = 'creditsStart'
                this.menuControls.buttonIndicator(obj, color)
                this.camControls.toCredits()
            }
        }

        this.menuControls.workbench = async (obj, color) =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'menu')
            {
                this.sounds.playClick()
                this.logic.mode = 'workbench'
                if(obj) this.menuControls.buttonIndicator(obj, color)
                this.camControls.toWorkbench()
            }
        }

        this.menuControls.experience = async (obj, color) =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'menu')
            {
                this.sounds.playClick()
                this.logic.mode = 'experienceView'
                if(obj) this.menuControls.buttonIndicator(obj, color)
                this.camControls.toExperience()
            }
        }

        this.menuControls.buttonIndicator = async (obj, color) =>
        {
            // Instead of swapping material, let's do a quick "press" animation
            gsap.to(obj.scale, { duration: 0.1, x: 0.8, y: 0.8, z: 0.8, yoyo: true, repeat: 1 });
        }
    }

    // About me big screen controls

    setAboutMeControls()
    {
        this.aboutMeControls = {}

        this.aboutMeControls.aboutMeScreens = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'skills' || this.logic.mode === 'experience'))
            {
                this.sounds.playBloop()
                this.logic.mode = 'aboutMe'
                
                if(this.config.vertical === true)
                {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenAboutMeMobileTexture,
                        0.2
                    )
                }
                else
                {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenAboutMeTexture,
                        0.2
                    )
                }
            }
        }

        this.aboutMeControls.aboutMeSkills = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'aboutMe' || this.logic.mode === 'experience'))
            {
                this.sounds.playBloop()
                this.logic.mode = 'skills'

                if(this.config.vertical === true)
                {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenSkillsMobileTexture,
                        0.2
                    )
                }
                else
                {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenSkillsTexture,
                        0.2
                    )
                }
            }
        }

        this.aboutMeControls.aboutMeExperience = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills'))
            {
                this.sounds.playBloop()
                this.logic.mode = 'experience'

                if(this.config.vertical === true)
                {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenExperienceMobileTexture,
                        0.2
                    )
                }
                else
                {
                    this.bigScreenTransition(
                        this.materials.bigScreenMaterial,
                        this.resources.items.bigScreenExperienceTexture,
                        0.2
                    )
                }
            }
        }

        this.aboutMeControls.aboutMeBack = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills' || this.logic.mode === 'experience'))
            {
                this.sounds.playBloop()
                this.logic.mode = 'menu'
                this.camControls.toDefault()

                this.bigScreenTransition(
                    this.materials.bigScreenMaterial,
                    this.resources.items.bigScreenDefaultTexture,
                    0.4,
                    1,
                    0
                )
            }
        }
    }

    //arcade screen credit controls

    setArcadeScreenControls()
    {
        this.screenControls = {}
        this.screenControls.arcadeScreen = async () =>
        {
            if(this.logic.buttonsLocked === false && this.logic.mode === 'creditsStart' )
            {
                this.sounds.playArcade()
                this.logic.mode = 'credits'
                this.screenTransition(
                    this.materials.arcadeScreenMaterial,
                    this.resources.items.arcadeScreenCreditsTexture,
                    0.2
                )
            }
            else if(this.logic.buttonsLocked === false && this.logic.mode === 'credits' )
            {
                this.sounds.playArcade()
                this.logic.mode = 'thanks'
                this.screenTransition(
                    this.materials.arcadeScreenMaterial,
                    this.resources.items.arcadeScreenThanksTexture,
                    0.2
                )
            }
            else if(this.logic.buttonsLocked === false && this.logic.mode === 'thanks' )
            {
                this.sounds.playArcade()
                this.logic.mode = 'menu'
                this.camControls.toDefault()
                this.screenTransition(
                    this.materials.arcadeScreenMaterial,
                    this.resources.items.arcadeScreenDefaultTexture,
                    0.2
                )
            }
        }

    }

    // camera transitions and angles

    setCamControls()
    {
        this.camControls = {}
        this.camControls.toProjects = async () =>
        {
            this.sounds.playWhoosh()

            this.logic.lockButtons(1500)
            this.camera.camAngle.unlocked()
            this.camera.transitions.vendingMachine(1.5)
            await this.sleep(1500)
            this.camera.camAngle.vendingMachine()
            this.backButton.classList.add('visible')

            // Show + start tracking the car screen
            const projectsPopup = document.getElementById('projects-popup');
            if (projectsPopup) {
                projectsPopup.classList.remove('hidden');
                this._trackingActive = true
            }
        }
        this.camControls.toDefault = async () =>
        {
            this.sounds.playWhoosh()
            this.backButton.classList.remove('visible')

            // Stop tracking, hide all popups
            this._trackingActive = false
            const skillsPopup = document.getElementById('skills-popup')
            if (skillsPopup) skillsPopup.classList.add('hidden')
            const aboutMePopup = document.getElementById('aboutme-popup')
            if (aboutMePopup) aboutMePopup.classList.add('hidden')
            const expPopup = document.getElementById('experience-popup')
            if (expPopup) expPopup.classList.add('hidden')

            this.logic.lockButtons(1500)
            this.camera.camAngle.unlocked()
            this.camera.transitions.default(1.5)
            await this.sleep(1500)
            this.camera.camAngle.default()
        }
        this.camControls.toAboutMe = async () =>
        {
            this.sounds.playWhoosh()

            this.logic.lockButtons(1500)
            this.camera.camAngle.unlocked()
            this.camera.transitions.aboutMe(1.5)
            await this.sleep(1500)
            this.camera.camAngle.aboutMe()
            this.backButton.classList.add('visible')
        }
        this.camControls.toCredits = async () =>
        {
            this.sounds.playWhoosh()

            this.logic.lockButtons(1500)
            this.camera.camAngle.unlocked()
            this.camera.transitions.credits(1.5)
            await this.sleep(1500)
            this.camera.camAngle.credits()
            this.backButton.classList.add('visible')
        }

        this.camControls.toWorkbench = async () =>
        {
            this.sounds.playWhoosh()

            this.logic.lockButtons(1500)
            this.camera.camAngle.unlocked()
            this.camera.transitions.workbench(1.5)
            await this.sleep(1500)
            this.camera.camAngle.workbench()
            this.backButton.classList.add('visible')

            // Show the skills panel
            const skillsPopup = document.getElementById('skills-popup')
            if (skillsPopup) skillsPopup.classList.remove('hidden')
        }

        this.camControls.toExperience = async () =>
        {
            this.sounds.playWhoosh()

            this.logic.lockButtons(1500)
            this.camera.camAngle.unlocked()
            this.camera.transitions.experience(1.5)
            await this.sleep(1500)
            this.camera.camAngle.experience()
            this.backButton.classList.add('visible')

            // Show the experience panel
            const expPopup = document.getElementById('experience-popup')
            if (expPopup) expPopup.classList.remove('hidden')
        }
    }

    // video controls

    setVideoControls()
    {
        this.videoControls = {}

        this.videoControls.bigScreen = async () =>
        {
            console.log('bigScreen')
        }

        this.videoControls.littleTVScreen = async () =>
        {
            this.videoControls.togglePlayback(this.resources.video['littleTVScreenVideoTexture'])
        }

        this.videoControls.tallScreen = async () =>
        {
            this.videoControls.togglePlayback(this.resources.video['tallScreenVideoTexture'])
        }

        this.videoControls.tvScreen = async () =>
        {
            if(this.resources.video['tvScreenVideoTexture'].paused)
            {this.resources.video['tvScreenVideoTexture'].play()}
            else {
                window.open('https://www.youtube.com/watch?v=fYcphQibLek', '_blank');
                this.resources.video['tvScreenVideoTexture'].pause()
            }
        }

        this.videoControls.sideScreen = async () =>
        {

        }

        this.smallScreen1Counter = 1

        this.videoControls.smallScreen1 = async () =>
        { 
            if(this.smallScreen1Counter < this.resources.carousel1.length)
            {this.smallScreen1Counter++}
            else {this.smallScreen1Counter = 1}

            this.screenTransition(
                this.materials.smallScreen1Material,
                this.resources.carousel1[this.smallScreen1Counter-1],
                0.8
            )

            this.animations.photoCounter = 0
        }

        this.smallScreen2Counter = 1

        this.videoControls.smallScreen2 = async () =>
        {
            if(this.smallScreen2Counter < this.resources.carousel2.length)
            {this.smallScreen2Counter++}
            else {this.smallScreen2Counter = 1}

            this.screenTransition(
                this.materials.smallScreen2Material,
                this.resources.carousel2[this.smallScreen2Counter-1],
                0.8
            )

            this.animations.photoCounter = 0
        }

        this.videoControls.smallScreen3 = async () =>
        {
            this.videoControls.togglePlayback(this.resources.video['smallScreen3VideoTexture'])
        }

        this.videoControls.smallScreen4 = async () =>
        {
            this.videoControls.togglePlayback(this.resources.video['smallScreen4VideoTexture'])
        }

        this.videoControls.smallScreen5 = async () =>
        {
            this.videoControls.togglePlayback(this.resources.video['smallScreen5VideoTexture'])
        }

        this.videoControls.togglePlayback = async (video) =>
        {
            this.sounds.playBloop()
            if(video.paused)
            {video.play()}
            else {video.pause()}
        }


    }

    setSocialControls()
    {
        this.socialControls = {}
        this.socialControls.twitter = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills' || this.logic.mode === 'experience'))
            {
                window.open('https://twitter.com', '_blank');
            }
            
        }

        this.socialControls.linkedIn = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills' || this.logic.mode === 'experience'))
            {
                window.open('https://www.linkedin.com/in/harshrennn', '_blank');
            }
            
        }

        this.socialControls.gitHub = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills' || this.logic.mode === 'experience'))
            {
                window.open('https://github.com/HARSHRENN', '_blank');
            }
            
        }

        this.socialControls.medium = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills' || this.logic.mode === 'experience'))
            {
                window.open('https://medium.com', '_blank');
            }
            
        }

        this.socialControls.mail = async () =>
        {
            if(this.logic.buttonsLocked === false && (this.logic.mode === 'aboutMe' || this.logic.mode === 'skills' || this.logic.mode === 'experience'))
            {
                window.location.href='mailto:harshren777@gmail.com'
            }
            
        }
    }

    screenTransition(material,newTexture, duration,)
    {
        material.uniforms.texture2.value = newTexture
        gsap.to(material.uniforms.progress, {value:1,
            duration: duration,
            ease: "power1.inOut",
            onComplete: () => {
                material.uniforms.texture1.value = newTexture
                material.uniforms.progress.value = 0
            }
        })
    }

    bigScreenTransition(material,newTexture, duration, toDefault)
    {
        material.uniforms.uTexture2IsDefault.value = toDefault ? 1 : 0

        material.uniforms.uTexture2.value = newTexture
        gsap.to(material.uniforms.uProgress, {value:1,
            duration: duration,
            ease: "power1.inOut",
            onComplete: () => {
                material.uniforms.uTexture1IsDefault.value = toDefault ? 1 : 0 
                material.uniforms.uTexture1.value = newTexture
                material.uniforms.uProgress.value = 0
                
            }
        })
    }

    sleep(ms) 
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}