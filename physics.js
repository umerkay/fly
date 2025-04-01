import * as THREE from 'three';
import { showMessage, toggleRestartButton } from './ui.js';

export function updatePhysics(deltaTime, state) {
    if (state.aircraft.isCrashed) return;

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
    const dragForce = state.aircraft.velocity.clone().normalize().multiplyScalar(-dragMagnitude);
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

    // --- Update Velocity ---
    state.aircraft.velocity.addScaledVector(forces, deltaTime);

    // --- Calculate Roll-Induced Yaw (Banking Turn Physics) ---
    // if (!state.aircraft.isOnGround && speed > 2.0) {  // Only apply when airborne and with sufficient speed
    //     // Extract roll angle from quaternion
    //     const euler = new THREE.Euler().setFromQuaternion(state.aircraft.group.quaternion, 'YXZ');
    //     const rollAngle = euler.z;
        
    //     // Calculate yaw rate based on roll angle, speed, and lift
    //     // Roll angle is in radians, sin(rollAngle) gives us the horizontal component
    //     const turnFactor = 0.15; // Adjust this value to control turn sensitivity
    //     const yawRate = Math.sin(rollAngle) * speed * turnFactor;
        
    //     // Apply yaw rotation (around Y axis)
    //     const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(
    //         new THREE.Vector3(0, 1, 0),
    //         yawRate * deltaTime
    //     );
    //     state.aircraft.group.quaternion.premultiply(yawQuaternion);
    //     state.aircraft.group.quaternion.normalize();
    // }

    // --- Ground State Determination ---
    const groundCheckPosition = state.aircraft.group.position.y - state.aircraft.body?.geometry.parameters.height / 2;
    const landingSinkRate = state.aircraft.velocity.y;
    const currentlyTouchingGround = groundCheckPosition <= state.constants.GROUND_LEVEL + 0.01 && landingSinkRate <= 0.1;

    // Determine if on runway using proper condition
    const onRunway = Math.abs(state.aircraft.group.position.x) < state.constants.RUNWAY_WIDTH / 2 &&
                     Math.abs(state.aircraft.group.position.z) < state.constants.RUNWAY_LENGTH / 2;
    
    if (currentlyTouchingGround && onRunway) {
        // --- Actions when ON the runway ---
        if (!state.aircraft.isOnGround && state.aircraft.confirmedAirborne) {
            const sinkRate = Math.abs(landingSinkRate);
            if (speed > state.constants.MAX_SPEED_LANDING || sinkRate > state.constants.MAX_SINK_RATE_LANDING) {
                let reason = "Landing failed!";
                if (speed > state.constants.MAX_SPEED_LANDING) reason += ` Speed too high (${speed.toFixed(1)} > ${state.constants.MAX_SPEED_LANDING})`;
                if (sinkRate > state.constants.MAX_SINK_RATE_LANDING) reason += ` Sink rate too high (${sinkRate.toFixed(1)} > ${state.constants.MAX_SINK_RATE_LANDING})`;
                handleCrash(state, reason);
            } else {
                msg = 'Landed Successfully!';
            }
        } else if (!state.aircraft.hasBeenAirborne) {
            msg = `On Runway. Speed: ${speed.toFixed(1)} (Need ~${state.constants.TAKEOFF_SPEED} to lift)`;
        } else {
            msg = `On Ground. Speed: ${speed.toFixed(1)}`;
        }
        
        // Apply ground physics corrections
        state.aircraft.isOnGround = true;
        state.aircraft.velocity.y = 0;
        state.aircraft.group.position.y = state.constants.GROUND_LEVEL + state.aircraft.body.geometry.parameters.height / 2;
        
        // Apply ground friction
        const frictionMagnitude = 0.2;
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
        
    } else if (currentlyTouchingGround && !onRunway) {
        // NOT on runway: just let aircraft fly; terrain collision will handle crashes
        msg = 'Flying';
        state.aircraft.isOnGround = false;
    } else {
        // --- Actions when IN the air ---
        // Increment airborne timer when off ground
        state.aircraft.airborneTimer += deltaTime;
        
        // Check if we've been airborne long enough to consider takeoff complete
        if (state.aircraft.airborneTimer >= state.constants.AIRBORNE_CONFIRMATION_TIME && !state.aircraft.confirmedAirborne) {
            state.aircraft.confirmedAirborne = true;
            state.aircraft.hasBeenAirborne = true; // Also set the legacy flag
            msg = 'Airborne!';
        }
        
        if (state.aircraft.isOnGround) {
            // Just left the ground but not yet confirmed airborne
            // showMessage('Lifting off...', 'lightblue');
        } else if (state.aircraft.confirmedAirborne) {
            // Still flying, already confirmed airborne
            msg = 'Flying';
        }

        state.aircraft.isOnGround = false; // Definitely in the air now

         // *** CRASH CHECK (Flying into ground off-runway) *** (Only if previously airborne)
        // This check seems redundant now given the landing check handles off-runway landings,
        // but we can keep a simplified version for hitting terrain while flying low.
        // Check if bottom of plane hits ground level (0) when not over runway
        const worldGroundLevel = 0.0; // Actual ground plane Y
        const possiblyNearRunway = Math.abs(state.aircraft.group.position.x) < state.constants.RUNWAY_WIDTH &&
                                   Math.abs(state.aircraft.group.position.z) < state.constants.RUNWAY_LENGTH / 2 + 20; // Extra buffer
        if (state.aircraft.hasBeenAirborne && (state.aircraft.group.position.y - state.aircraft.body.geometry.parameters.height / 2) < worldGroundLevel) {
             if (!possiblyNearRunway) {
                  handleCrash(state, "Crashed into terrain!");
             }
        }
    }

    // --- Terrain Ahead Warning (PULL UP) ---
    if (!state.aircraft.isOnGround && state.terrainManager) {
        const forwardDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(state.aircraft.group.quaternion).normalize();
        const checkPoints = [];
        for (let i = 1; i <= 5; i++) {
            const point = state.aircraft.group.position.clone().addScaledVector(forwardDirection, i * 100); // 100m intervals
            checkPoints.push(point);
        }

        const terrainAhead = checkPoints.some(point => state.terrainManager.isColliding(state, point));
        if (terrainAhead) {
            msg = "Terrain ahead! PULL UP!";
        }
    }

    // --- Sink Rate Warning ---
    if (!state.aircraft.isOnGround && state.aircraft.velocity.y < -state.constants.SINK_RATE_THRESHOLD) { // Sink rate threshold
        msg = "Sink rate!";
    }

    // --- GPWS (Ground Proximity Warning System) ---
    if (!state.aircraft.isOnGround && state.terrainManager) {
        const downwardDirection = new THREE.Vector3(0, -1, 0);
        const gpwsPoints = [];
        for (let i = 1; i <= 5; i++) {
            const point = state.aircraft.group.position.clone().addScaledVector(downwardDirection, i * 10); // 10m intervals
            gpwsPoints.push(point);
        }

        const groundProximity = gpwsPoints.some(point => state.terrainManager.isColliding(state, point));
        if (groundProximity) {
            msg = "Ground proximity warning!";
        }
    }

    // --- Correct Controls Based on Orientation ---
    // Extract current orientation
    const euler = new THREE.Euler().setFromQuaternion(state.aircraft.group.quaternion, 'YXZ');
    // const rollAngle = euler.z;
    
    // Correct pitch control based on roll angle to prevent inversion
    // When aircraft is rolled more than 90° in either direction, pitch control should be inverted
    // if (Math.abs(rollAngle) > Math.PI/2) {
    //     // Invert pitch control when aircraft is significantly rolled
    //     state.aircraft.angularVelocity.x = -state.aircraft.angularVelocity.x;
    // }

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
        if (collisionCount >= 2) {
            handleCrash(state, "Collision with terrain!");
        }
    }

    // --- Crash Condition (Flying out of bounds - keep reasonable bounds) ---
    // Keep this check relatively simple
    // if (!state.aircraft.isCrashed && (state.aircraft.group.position.y < -5 || Math.abs(state.aircraft.group.position.x) > 600 || Math.abs(state.aircraft.group.position.z) > 600)) {
    //      handleCrash(state, "Flew out of bounds!");
    // }

    // Display the message if any
    if (msg) {
        showMessage(msg, 'lightblue');
    }

} // End of updatePhysics function

export function handleCrash(state, reason) {
    if (state.aircraft.isCrashed) return; // Prevent multiple crash triggers
    state.aircraft.isCrashed = true;
    state.aircraft.velocity.set(0, 0, 0); // Stop movement
    state.aircraft.angularVelocity.set(0,0,0);
    state.aircraft.thrust = 0; // Cut thrust on crash
    showMessage(`CRASHED! ${reason}`, 'red');
    toggleRestartButton(true);
}
