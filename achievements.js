import { showToast } from './ui.js';

export const ACHIEVEMENTS = {
    FIRST_FLIGHT: {
      id: 'first_flight',
      title: 'Wheels Up! 🛫',
      description: 'Your pilot journey begins!'
    },
    FIRST_LANDING: {
      id: 'first_landing',
      title: 'Touchdown Master ✈️',
      description: 'Conquered the skies... and the runway. Smooth as silk!'
    },
    FIRST_CRASH: {
      id: 'first_crash',
      title: 'Mayday Mayhem 💥',
      description: 'but hey, at least it was dramatic!'
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
        }
    }
}
