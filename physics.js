import * as THREE from 'three';
import { showMessage, toggleRestartButton } from './ui.js';

export function updatePhysics(deltaTime, state) {
    if (state.aircraft.isCrashed) return;

    // Add tracking variables if they don't exist
    state.aircraft.groundProximityTimer = state.aircraft.groundProximityTimer || 0;
    state.aircraft.maxAltitude = state.aircraft.maxAltitude || 0;

    let msg = null; // Initialize message variable
    
    // Force engine off: set thrust to zero when engine off is active
    if (state.aircraft.engineOff) {
        state.aircraft.thrust = 0;
    }

    // --- Forces ---
    // ... (Keep the existing Force calculations: Thrust, Drag, Lift, Gravity)
    const forces = new THREE.Vector3(0, 0, 0);
    const speed = state.aircraft.velocity.length();
    const speedSq = speed * speed;

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(state.aircraft.group.quaternion);
    forces.addScaledVector(forward, state.aircraft.thrust);

    // Apply ground friction when on ground
    if (state.aircraft.isOnGround && speed > 0.01) {
        // Determine surface type (runway or grass)
        const onRunway = Math.abs(state.aircraft.group.position.x) < state.constants.RUNWAY_WIDTH / 2 &&
                        Math.abs(state.aircraft.group.position.z) < state.constants.RUNWAY_LENGTH / 2;
        
        // Different friction coefficients based on surface type
        const runwayFriction = 0.02; // Smooth surface - low friction
        const grassFriction = 0.1;   // Rough surface - high friction
        
        // Select appropriate friction based on surface
        const frictionCoef = onRunway ? runwayFriction : grassFriction;
        
        // Calculate rolling resistance (increases with speed, but capped)
        const rollingResistance = Math.min(0.01 * speed, 0.5);
        
        // Total ground friction 
        const totalFriction = frictionCoef + rollingResistance;
        
        // Apply friction in opposite direction to ground velocity
        const groundVelocity = new THREE.Vector3(state.aircraft.velocity.x, 0, state.aircraft.velocity.z);
        const frictionForce = groundVelocity.clone().normalize().multiplyScalar(-totalFriction * state.constants.GRAVITY);
        forces.add(frictionForce);
        
        // Show surface info in console (optional - can remove)
        // console.log(`On ${onRunway ? 'runway' : 'grass'}, friction: ${totalFriction.toFixed(3)}`);
    }

    const dragMagnitude = state.constants.DRAG_COEFFICIENT * speedSq;
    // Calculate air density factor based on altitude (exponential decay)
    const altitude = state.aircraft.group.position.y;
    const minAirDensity = 0.2; // Minimum 20% of sea level air density
    const airDensityFactor = Math.max(minAirDensity, Math.exp(-altitude / 5000)); // Limit minimum density
    // Add extra drag when gear is deployed
    const gearDragMultiplier = state.aircraft.gearDeployed ? 1.3 : 1.0; // 30% more drag with gear down
    const dragForce = state.aircraft.velocity.clone().normalize().multiplyScalar(-dragMagnitude * airDensityFactor * gearDragMultiplier);
    if (!state.aircraft.isOnGround || speed > 0.1) {
        forces.add(dragForce);
    }

    const aircraftUp = new THREE.Vector3(0, 1, 0).applyQuaternion(state.aircraft.group.quaternion);
    const liftMagnitude = state.constants.LIFT_COEFFICIENT * speedSq;
    if (speed > 1.0 && aircraftUp.y > 0.1) {
         forces.addScaledVector(aircraftUp, liftMagnitude);
    }

    if (!state.aircraft.isOnGround || state.aircraft.velocity.y > 0) {
        forces.add(new THREE.Vector3(0, -state.constants.GRAVITY, 0));
    }

    // --- Apply Damping to Velocity ---
    const velocityDampingFactor = 0.98; // Adjust this value for smoother velocity damping
    state.aircraft.velocity.multiplyScalar(velocityDampingFactor);

    // --- Apply Damping to Angular Velocity ---
    const angularDampingFactor = 0.95; // Adjust this value for smoother angular velocity damping
    state.aircraft.angularVelocity.multiplyScalar(angularDampingFactor);

    // --- Update Velocity ---
    state.aircraft.velocity.addScaledVector(forces, deltaTime);

    // --- Ground State Determination ---
    const groundCheckPosition = state.aircraft.group.position.y - state.aircraft.body?.geometry.parameters.height / 2;
    const landingSinkRate = state.aircraft.velocity.y;
    const currentlyTouchingGround = groundCheckPosition <= state.constants.GROUND_LEVEL + 0.01 && landingSinkRate <= 0.1;

    // Determine if on runway using proper condition
    const onRunway = Math.abs(state.aircraft.group.position.x) < state.constants.RUNWAY_WIDTH / 2 &&
                     Math.abs(state.aircraft.group.position.z) < state.constants.RUNWAY_LENGTH / 2;
    
    if (currentlyTouchingGround && onRunway) {
        // --- Actions when ON the runway ---
        if (state.canRetractGear && !state.aircraft.gearDeployed) {
            handleCrash(state, "Landing failed! Gear not deployed.");
            return;
        }

        if (!state.aircraft.isOnGround && state.aircraft.confirmedAirborne) {
            const sinkRate = Math.abs(landingSinkRate);
            if (speed > state.constants.MAX_SPEED_LANDING || sinkRate > state.constants.MAX_SINK_RATE_LANDING) {
                let reason = "Landing failed!";
                if (speed > state.constants.MAX_SPEED_LANDING) reason += ` Speed too high (${(speed * 3).toFixed(1)} > ${state.constants.MAX_SPEED_LANDING * 3})`;
                if (sinkRate > state.constants.MAX_SINK_RATE_LANDING) reason += ` Sink rate too high (${sinkRate.toFixed(1)} > ${state.constants.MAX_SINK_RATE_LANDING})`;
                handleCrash(state, reason);
            } else {
                msg = 'Landed Successfully!';
                // Reset airborne flags after successful landing
                state.aircraft.hasBeenAirborne = false;
                state.aircraft.confirmedAirborne = false;
                state.aircraft.airborneTimer = 0;
                state.achievementManager.handleGameEvents('firstLanding');
            }
        } else if (!state.aircraft.hasBeenAirborne) {
            msg = `On Runway. Speed: ${(speed * 3).toFixed(1)} (Need ~${state.constants.TAKEOFF_SPEED * 3} to lift)`;
        } else {
            msg = `On Ground. Speed: ${(speed * 3).toFixed(1)}`;
        }
        
        // Apply ground physics corrections
        state.aircraft.isOnGround = true;
        state.aircraft.velocity.y = 0;
        state.aircraft.group.position.y = state.constants.GROUND_LEVEL + state.aircraft.body.geometry.parameters.height / 2;
        
        // Apply ground friction
        const frictionMagnitude = 0.2 * speed;
        const groundVelocity = new THREE.Vector3(state.aircraft.velocity.x, 0, state.aircraft.velocity.z);
        if (groundVelocity.lengthSq() > 0.01) {
             const frictionForce = groundVelocity.clone().normalize().multiplyScalar(-frictionMagnitude);
             state.aircraft.velocity.addScaledVector(frictionForce, deltaTime);
        }
        
        // Apply park brakes: zero horizontal velocity when active
        if (state.aircraft.parkBrakes) {
            state.aircraft.velocity.x = 0;
            state.aircraft.velocity.z = 0;
        }

        // Auto-level the pitch if nose is down when on ground
        const euler = new THREE.Euler().setFromQuaternion(state.aircraft.group.quaternion, 'YXZ');
        if (euler.x > 0) { // Positive X is nose down
            // Apply counter-pitch to level nose
            state.aircraft.angularVelocity.x = -euler.x * 5.0; // Strength of auto-leveling
        }
        
        // Dampen angular velocity
        state.aircraft.angularVelocity.x *= (1.0 - deltaTime * 8.0);
        state.aircraft.angularVelocity.z *= (1.0 - deltaTime * 8.0);

        state.aircraft.airborneTimer = 0;
        
    } else if (currentlyTouchingGround && !onRunway) {
        // NOT on runway: just let aircraft fly; terrain collision will handle crashes
        msg = 'Flying';
        state.aircraft.isOnGround = false;

        state.aircraft.airborneTimer = 0;
    } else {
        // --- Actions when IN the air ---
        // Increment airborne timer when off ground
        state.aircraft.airborneTimer += deltaTime;
        
        // Check if we've been airborne long enough to consider takeoff complete
        if (state.aircraft.airborneTimer >= state.constants.AIRBORNE_CONFIRMATION_TIME && !state.aircraft.confirmedAirborne) {
            state.aircraft.confirmedAirborne = true;
            state.aircraft.hasBeenAirborne = true; // Also set the legacy flag
            msg = 'Airborne!';
            console.log('Airborne!', state);
            state.achievementManager.handleGameEvents('firstFlight');
        }
        
        if (state.aircraft.isOnGround) {
            // Just left the ground but not yet confirmed airborne
            // showMessage('Lifting off...', 'lightblue');
        } else if (state.aircraft.confirmedAirborne) {
            // Still flying, already confirmed airborne
            msg = 'Flying';
        }

        state.aircraft.isOnGround = false; // Definitely in the air now

    }

    // --- Terrain Ahead Warning (PULL UP) ---
    if (!state.aircraft.isOnGround && !onRunway && state.terrainManager) {
        const forwardDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(state.aircraft.group.quaternion).normalize();
        const checkPoints = [];
        for (let i = 1; i <= 5; i++) {
            const point = state.aircraft.group.position.clone().addScaledVector(forwardDirection, i * 100); // 100m intervals
            checkPoints.push(point);
        }

        const terrainAhead = checkPoints.some(point => state.terrainManager.isColliding(state, point));
        if (terrainAhead) {
            msg = "Terrain ahead! PULL UP!";
            if (!state.aircraft.terrainWarningActive) {
                state.aircraft.terrainWarningActive = true;
            }
        } else if (state.aircraft.terrainWarningActive) {
            state.aircraft.terrainWarningActive = false;

            // state.achievementManager.handleGameEvents("terrain_dodger")
        }
    }

    // --- Sink Rate Warning ---
    if (!state.aircraft.isOnGround && !onRunway && state.aircraft.velocity.y < -state.constants.SINK_RATE_THRESHOLD) { // Sink rate threshold
        msg = "Sink rate!";
    }

    // --- GPWS (Ground Proximity Warning System) ---
    if (!state.aircraft.isOnGround && !onRunway && state.terrainManager) {
        const downwardDirection = new THREE.Vector3(0, -1, 0);
        const gpwsPoints = [];
        for (let i = 1; i <= 5; i++) {
            const point = state.aircraft.group.position.clone().addScaledVector(downwardDirection, i * 10); // 10m intervals
            gpwsPoints.push(point);
        }

        const groundProximity = gpwsPoints.some(point => state.terrainManager.isColliding(state, point));
        if (groundProximity) {
            msg = "Ground proximity warning!";
            state.aircraft.groundProximityTimer += deltaTime;
            if (state.aircraft.groundProximityTimer >= 60) { // 1 minute
                state.achievementManager.handleGameEvents('groundHugger');
            }
        } else {
            state.aircraft.groundProximityTimer = 0;
        }
    }

    // Check altitude achievements
    const currentAltitude = state.aircraft.group.position.y;
    // state.aircraft.maxAltitude = Math.max(state.aircraft.maxAltitude, currentAltitude);

    if (currentAltitude >= 500) {
        state.achievementManager.handleGameEvents('altitude500');
    } else if (currentAltitude >= 1000) {
        state.achievementManager.handleGameEvents('altitude1000');
    } else if (currentAltitude >= 2500) {
        state.achievementManager.handleGameEvents('altitude2500');
    }

    // Check for nose dive
    if (state.aircraft.velocity.y <= -50) {
        state.achievementManager.handleGameEvents('nose_diver');
    }

    // --- Update Position ---
    if (!state.aircraft.isCrashed) { 
         state.aircraft.group.position.addScaledVector(state.aircraft.velocity, deltaTime);
    }

    // --- Check for Terrain Collision using Bottom Corners ---
    if (state.terrainManager && state.aircraft.body) {
         const params = state.aircraft.body.geometry.parameters;
         const hw = params.width / 2;
         const hd = params.depth / 2;
         const bottomY = 0;
         const corners = [
            new THREE.Vector3(-hw, bottomY, -hd),
            new THREE.Vector3(hw, bottomY, -hd),
            new THREE.Vector3(-hw, bottomY, hd),
            new THREE.Vector3(hw, bottomY, hd)
        ];
        
        let collisionCount = 0;
        
        corners.forEach(corner => {
            // Transform corner to world coordinates
            corner.applyQuaternion(state.aircraft.group.quaternion);
            corner.add(state.aircraft.group.position);
            
            if (state.terrainManager.isColliding(state, corner)) {
                collisionCount++;
            }
        });
        
        // Trigger crash only if at least 2 corners collide
        if (collisionCount >= 1) {
            handleCrash(state, "Collision with terrain!");
        }
    }

    // Display the message if any
    if (msg) {
        showMessage(msg, 'lightblue');
    }

} // End of updatePhysics function

export function handleCrash(state, reason) {
    if (state.aircraft.isCrashed) return;
    state.aircraft.isCrashed = true;
    state.aircraft.velocity.set(0, 0, 0);
    state.aircraft.angularVelocity.set(0,0,0);
    state.aircraft.thrust = 0;
    showMessage(`CRASHED! ${reason}`, 'red');
    toggleRestartButton(true);

    // Check if crash is on runway
    const onRunway = Math.abs(state.aircraft.group.position.x) < state.constants.RUNWAY_WIDTH / 2 &&
                     Math.abs(state.aircraft.group.position.z) < state.constants.RUNWAY_LENGTH / 2;
    
    if (onRunway) {
        state.achievementManager.handleGameEvents('firstCrashLanding');
    } else {
        state.achievementManager.handleGameEvents('firstCrash');
    }
}
