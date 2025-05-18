import { showToast } from './ui.js';

export const ACHIEVEMENTS = {
    FIRST_FLIGHT: {
        id: 'first_flight',
        title: 'Wheels Up! 🛫',
        description: 'Congrats, you figured out how to go up.'
      },
      
      FIRST_LANDING: {
        id: 'first_landing',
        title: 'Touchdown Master ✈️',
        description: 'You landed and didn’t explode. Overachiever, aren’t you?'
      },
      
      FIRST_CRASH: {
        id: 'first_crash',
        title: 'Mayday 💥',
        description: 'Well, that escalated quickly.'
      },
      
      FIRST_CRASH_LANDING: {
        id: 'first_crash_landing',
        title: 'Crash Landing 💥',
        description: 'Technically a landing.'
      },
      
      GROUND_HUGGER: {
        id: 'ground_hugger',
        title: 'Tow low? Never Heard of It 🏔️',
        description: 'That alarm is just a suggestion, right?'
      },
      
    //   TERRAIN_DODGER: {
    //     id: 'terrain_dodger',
    //     title: 'Threading the Needle ✨',
    //     description: 'Terrain warning? Pfft. You juked a mountain. Somehow.'
    //   },
      
      ALTITUDE_500: {
        id: 'altitude_500',
        title: 'Barely Airborne 🪁',
        description: '500 feet up and already acting like Maverick. Chill.'
      },
      
      ALTITUDE_1000: {
        id: 'altitude_1000',
        title: 'Skybound 🌤️',
        description: '1,000 feet and already feeling fancy, huh?'
      },
      
      ALTITUDE_2500: {
        id: 'altitude_2500',
        title: 'Cloud Surfer ☁️',
        description: 'Look at you, mingling with clouds like you belong there.'
      },
      
      NOSE_DIVER: {
        id: 'nose_diver',
        title: 'Controlled-ish Descent 🔻',
        description: 'Is this flying… or just falling with style?'
      }
  };
  

export class AchievementManager {
    constructor() {
        this.loadAchievements();
    }

    loadAchievements() {
        this.unlockedAchievements = new Set(
            JSON.parse(localStorage.getItem('unlockedAchievements') || '[]')
        );
    }

    saveAchievements() {
        localStorage.setItem('unlockedAchievements', 
            JSON.stringify([...this.unlockedAchievements])
        );
    }

    unlock(achievementId) {
        if (this.unlockedAchievements.has(achievementId)) return;

        const achievement = Object.values(ACHIEVEMENTS)
            .find(a => a.id === achievementId);
        
        if (!achievement) return;

        this.unlockedAchievements.add(achievementId);
        this.saveAchievements();
        
        if (typeof Toastify === 'undefined') {
            console.log(`🏆 Achievement Unlocked: ${achievement.title} - ${achievement.description}`);
        } else {
            showToast(`🏆 Achievement Unlocked: ${achievement.title}`, achievement.description);
        }
    }

    clearAchievements() {
        this.unlockedAchievements.clear();
        this.saveAchievements();
    }

    handleGameEvents(event, data) {
        switch(event) {
            case 'firstFlight':
                this.unlock(ACHIEVEMENTS.FIRST_FLIGHT.id);
                break;
            case 'firstLanding':
                this.unlock(ACHIEVEMENTS.FIRST_LANDING.id);
                break;
            case 'firstCrash':
                this.unlock(ACHIEVEMENTS.FIRST_CRASH.id);
                break;
            case 'firstCrashLanding':
                this.unlock(ACHIEVEMENTS.FIRST_CRASH_LANDING.id);
                break;
            case 'groundHugger':
                this.unlock(ACHIEVEMENTS.GROUND_HUGGER.id);
                break;
            // case 'terrain_dodger':
            //     this.unlock(ACHIEVEMENTS.TERRAIN_DODGER.id);
            //     break;
            case 'altitude1000':
                this.unlock(ACHIEVEMENTS.ALTITUDE_1000.id);
                break;
            case 'altitude2500':
                this.unlock(ACHIEVEMENTS.ALTITUDE_2500.id);
                break;
            case 'altitude500':
                this.unlock(ACHIEVEMENTS.ALTITUDE_500.id);
                break;
            case 'noseDiver':
                this.unlock(ACHIEVEMENTS.NOSE_DIVER.id);
                break;
        }
    }
}
