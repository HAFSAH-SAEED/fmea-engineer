# FMEA Engineer - Failure Analysis Report

## 1. System Overview

The battery-powered autonomous mobile robot is designed for indoor navigation, consisting of:
- **12V Lithium-Ion Battery Pack with BMS:** Provides system power and manages battery status.
- **Arduino Mega Controller:** Central control, executing navigation algorithms.
- **Ultrasonic Distance Sensors:** Detect obstacles.
- **L298N Motor Driver:** Drives the motors using PWM signals.
- **12V DC Geared Motors and Wheels:** Provide mobility.
- **Chassis:** Structural support.
- **Voltage Regulation Circuitry:** Ensures stable power delivery.
- **Embedded Control Software:** Manages navigation, obstacle detection, and power management.

## 2. System Components and Functions

Components include the battery pack, Arduino controller, sensors, motor driver, motors, chassis, voltage regulation, and control software. Each ensures the robot can navigate, avoid obstacles, and maintain power stability.

## 3. Interfaces and Dependencies

- **Power Distribution:** Battery → Voltage Regulation → Arduino, Sensors, Motor Driver.
- **Control and Communication:** Arduino ↔ Sensors; Arduino → Motor Driver.
- **Mechanical:** Motors → Wheels → Chassis.

## 4. Assumptions and Information Gaps

### Known Information
- System components and basic function descriptions.

### Assumptions
- Default operational environments.
- Sensor and motor specs remain as per typical components.

### Unknown Information
- Exact battery voltage/current ratings.
- Sensor model and range specifications.
- Arduino software logic.

### Information Gaps
- Missing sensor specifications affect confidence in related failures.
- Lack of detailed battery specs limits predictability of electrical faults.
- Unspecified environmental conditions impact stress estimations.

## 5. Failure Analysis

| Component/Function | Failure Mode | Cause | Immediate Effect | Downstream Effect | Existing Control | Severity | Occurrence | Detection | RPN | Score Rationales | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Battery | Voltage sag | Faulty BMS | Power loss to system | System stops | Not specified | 8 (MEDIUM) | 6 (MEDIUM) | 5 (MEDIUM) | 240 | Robot stops affecting operation; plausible under load | MEDIUM |
| Sensor | Max value output | Electrical interference | Invalid data to controller | Incorrect obstacle handling | Not specified | 8 (HIGH) | 5 (MEDIUM) | 6 (LOW) | 240 | Collision risk if undetected; plausible noise | LOW |
| Arduino | Software crash | Bug, bad data | Controller stops processing | No control signals to motors | Not specified | 8 (HIGH) | 5 (LOW) | 4 (MEDIUM) | 160 | Stops unexpectedly due to data input | LOW |
| Motor Driver | Overheating | High load | Temporary disable | Loss of motor control | Not specified | 7 (MEDIUM) | 6 (MEDIUM) | 4 (MEDIUM) | 168 | Overheating stops function, high load likely | MEDIUM |
| Motor | Mechanical jam | Debris in gearbox | No motor rotation | Navigation drift | Not specified | 6 (MEDIUM) | 4 (MEDIUM) | 3 (MEDIUM) | 72 | Jam affects motion slightly likely | MEDIUM |
| BMS | Communication failure | Electrical noise | Incorrect battery data | Poor battery management | Not specified | 7 (LOW) | 5 (LOW) | 6 (LOW) | 210 | May cause incorrect shutdown | LOW |

## 6. Failure Propagation Analysis

- **SENSOR → Constant max output → (invalid data) → CONTROLLER → Incorrect command → MOTOR DRIVER → Collision.**
- **BATTERY → Voltage sag → (Arduino reset) → CONTROLLER → Loss of state → NAVIGATION → Uncontrolled motion.**
- **MOTOR DRIVER → Output held enabled → (continuous power) → MOTOR → Continuous rotation → Collision/damage.**

## 7. Risk Assessment Method

Severity, Occurrence, and Detection scores are AI-estimated based on available descriptions and engineering heuristics. RPN is calculated by Severity × Occurrence × Detection. Real reliability decisions require measurements and testing. Confidence level affects certainty, not probability.

## 8. Risk Prioritization

Highest RPN modes involve battery voltage sag and ultrasonic sensor max value output due to their potential for critical system impacts. These rank higher for collisions or uncontrolled behavior.

## 9. Recommended Mitigations

- **Failure Mode Addressed:** Battery Voltage Sag
  - **Mitigation:** Implement voltage monitoring circuit on Arduino.
  - **Why It Helps:** Detects low voltage early, preventing resets.
  - **Control Added:** Software check and power disable logic.
  - **Uncertainty / Validation Needed:** Requires calibration for actual voltage-sag behavior.

- **Failure Mode Addressed:** Sensor Max Value Output
  - **Mitigation:** Add sensor data range validation in software.
  - **Why It Helps:** Detects invalid sensor data early.
  - **Control Added:** Software validation routine.
  - **Uncertainty / Validation Needed:** Requires vendor datasheets for range specification.

- **Failure Mode Addressed:** Arduino Software Crash
  - **Mitigation:** Implement watchdog timer for system reset.
  - **Why It Helps:** Resets system upon software hang.
  - **Control Added:** Hardware watchdog mechanism.
  - **Uncertainty / Validation Needed:** Watchdog timeout requires adjustment based on software timing.

- **Failure Mode Addressed:** Motor Driver Overheating
  - **Mitigation:** Add thermal monitoring to motor driver.
  - **Why It Helps:** Prevents overheating by reducing load.
  - **Control Added:** Thermal cutoff circuit.
  - **Uncertainty / Validation Needed:** Thermal testing under operational load required.

- **Failure Mode Addressed:** BMS Communication Failure
  - **Mitigation:** Add robust error-checking in communication protocol.
  - **Why It Helps:** Ensures correct battery status is communicated.
  - **Control Added:** Software error-check routine.
  - **Uncertainty / Validation Needed:** Requires testing under noisy conditions.

## 10. Verification Tests

### Battery Voltage Monitoring Test
Test Objective: Verify the system detects low voltage and disables motor power.
Setup: Connect voltage monitoring circuit. Use a variable power supply to simulate voltage drop.
Procedure: 
1. Apply power and monitor through Arduino, simulate voltage drop.
2. Observe Arduino response at low voltage.
3. Ensure motors stop before critical voltage threshold.
Expected Safe Behavior: Motor power disables before voltage drops below set threshold, preventing reset.
Pass Criterion: Motors stop within specified voltage drop limit.

### Sensor Data Validation Test
Test Objective: Validate sensor data range check prevents invalid readings from driving logic.
Setup: Inject invalid data via serial.
Procedure:
1. Simulate out-of-range values to Arduino.
2. Monitor motor control signals.
Expected Safe Behavior: Motors should stop after consecutive invalid readings.
Pass Criterion: Motor control signals transition to zero within defined time after third invalid reading.

### Watchdog Timer Implementation Test
Test Objective: Verify the watchdog timer resets Arduino on software crash.
Setup: Use a test rig with watchdog timer.
Procedure:
1. Induce software hang.
2. Verify Arduino reset via timer.
Expected Safe Behavior: Watchdog triggers reset within configured time.
Pass Criterion: System resets without manual intervention following hang.

### Motor Driver Thermal Test
Test Objective: Confirm thermal monitoring halts motor operation on overheating.
Setup: Attach thermal sensors.
Procedure:
1. Run motor under load.
2. Monitor temperature.
Expected Safe Behavior: System reduces performance or stops before overheating.
Pass Criterion: Motor shuts down within safe thermal limits.

### BMS Communication Validation Test
Test Objective: Verify communication protocol detects errors.
Setup: Simulate noise on communication line.
Procedure:
1. Introduce signal noise.
2. Verify error detection and correction.
Expected Safe Behavior: System operates with noise-resilient communication.
Pass Criterion: Correct battery status retained under noisy conditions.

## 11. Engineering Limitations

Severity, Occurrence, and Detection scores are AI-estimated based on the available system description and general engineering heuristics. They are a starting point for engineering review and are not measured or validated reliability data. AI estimate ≠ measured reliability; further testing and verification are essential. Some assumptions due to missing specs may affect precision.

## 12. Conclusion

The most critical risks involve battery voltage instability and sensor data inaccuracies, causing potential system failures. Recommended steps include implementing monitoring and validation mechanisms alongside rigorous testing. AI-estimated scores are preliminary and must be confirmed through empirical measurements and analyses before making definitive reliability conclusions.

> Severity, Occurrence, and Detection scores are AI-estimated based on the available system description and general engineering heuristics. They are a starting point for engineering review and are not measured or validated reliability data. AI estimate ≠ measured reliability; further testing and review are essential.
