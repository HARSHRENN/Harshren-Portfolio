import * as THREE from 'three'
import Experience from './Experience.js'
import EventEmitter from './Utils/EventEmitter.js'

export default class PreLoader extends EventEmitter
{
    constructor()
    {
        super()

        this.experience = new Experience()
        this.scene = this.experience.scene
        this.sounds = this.experience.sounds
        this.resources = this.experience.resources
        this.sizes = this.experience.sizes
        this.overlay = document.querySelector('.overlay')
        this.cooking = document.querySelector('#cooking')
        this.startButton = document.querySelector('.start')       



        // Progress
        this.resources.on('itemLoaded', () =>
        {
            this.progressRatio = (this.resources.loaded + 1)/ this.resources.toLoad
            
            document.getElementById("progressPercentage").innerHTML = Math.trunc(this.progressRatio * 100)
        })

        //Loaded
        this.resources.on('ready', () =>
        {
            this.cooking.classList.add('fade')
            window.setTimeout(() =>
            {
                this.readyScreen()
            }, 200)
        })
    }
    
    readyScreen()
    {
        if (this.cooking) this.cooking.remove()
        this.startButton.style.display = "inline"
        this.startButton.classList.add('fadeIn')
        this.startButton.addEventListener("click", async () => {

            // Remove overlay and button
            this.overlay.classList.add('fade')
            this.startButton.classList.add('fadeOut')

            window.setTimeout(() =>
            {
                if (this.startButton) this.startButton.remove()
                if (this.overlay) this.overlay.remove()
            }, 400)

            // Trigger start events
            this.controller = this.experience.controller
            this.performance = this.experience.performance

            // Move Camera
            this.controller.camControls.toDefault()

            // Play Sounds
            this.sounds.playClick()
            this.sounds.playWhoosh()
            this.sounds.playCooking()

            // Required for instagram brower compatibility
            this.sizes.resize()
            
            // Fast performance Check
            await this.sleep(50)
            this.performance.performanceCheck()  

            // Emit Event
            this.trigger('start')

            // Play Sounds
            await this.sleep(50)
            this.sounds.playDing()

        },{ once: true });
    }

    sleep(ms) 
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}