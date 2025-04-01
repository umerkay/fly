export function getAircraftModel(modelName) {
    const models = {
        cessna: {
            modelPath: 'model/model.glb',
            scale: [0.01, 0.01, 0.01],
            rotation: [Math.PI / 2, Math.PI, Math.PI / 2 + Math.PI],
            position: [0, -1.675, 0],
            propellorName: 'Mesh_1',
            constants: {
                GRAVITY: 20.0,
                THRUST_FORCE: 10.0,
                MAX_THRUST: 300.0,
                REVERSE_THRUST_FORCE: 10.0,
                DRAG_COEFFICIENT: 0.08,
                LIFT_COEFFICIENT: 0.01,
                PITCH_SPEED: 0.2,
                ROLL_SPEED: 0.3,
                MAX_SPEED_LANDING: 18.0,
                MAX_SINK_RATE_LANDING: 2.5,
                TAKEOFF_SPEED: 25.0,
                AIRBORNE_CONFIRMATION_TIME: 5.0,
                GROUND_LEVEL: 0.5,
                RUNWAY_WIDTH: 30,
                RUNWAY_LENGTH: 300,
                SINK_RATE_THRESHOLD: 5,
            }
        },
        boeing787: {
            modelPath: 'model4/model (2).glb',
            scale: [0.03, 0.03, 0.03],
            rotation: [0,0,0],
            position: [0, -11.95, 35],
            propellorName: null, // No propellor for jet aircraft
            constants: {
                GRAVITY: 25.0,
                THRUST_FORCE: 200.0,
                MAX_THRUST: 1000.0,
                REVERSE_THRUST_FORCE: 50.0,
                DRAG_COEFFICIENT: 0.05,
                LIFT_COEFFICIENT: 0.002,
                PITCH_SPEED: 0.05,
                ROLL_SPEED: 0.2,
                MAX_SPEED_LANDING: 70.0,
                MAX_SINK_RATE_LANDING: 3.0,
                TAKEOFF_SPEED: 60.0,
                AIRBORNE_CONFIRMATION_TIME: 3.0,
                GROUND_LEVEL: 1.0,
                RUNWAY_WIDTH: 100,
                RUNWAY_LENGTH: 1000,
                SINK_RATE_THRESHOLD: 10,
            }
        }
    };

    return models[modelName] || models['cessna']; // Default to cessna if model not found
}
