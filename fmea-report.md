# FMEA Engineer - Failure Analysis Report

## 1. System Overview

- **Ultrasonic Sensor:** Detects obstacles and sends distance data to the Arduino.
- **Arduino Controller:** Processes sensor data and controls the motor driver.
- **L298N Motor Driver:** Drives the DC motors based on Arduino signals.
- **DC Motors:** Provide movement to the robot by converting electrical energy into mechanical motion.
- **Battery:** Supplies power to the system.

## 2. System Components and Functions

- **Ultrasonic Sensor:** Provides distance measurements for navigation. Output: Distance data.
- **Arduino Controller:** Executes control logic. Inputs: Sensor data; Outputs: Motor commands.
- **L298N Motor Driver:** Controls motor power/direction. Inputs: Arduino signals; Outputs: Motor power.
- **DC Motors:** Drive the robot. Inputs: Power from the motor driver.
- **Battery:** Provides energy to all components.

## 3. Interfaces and Dependencies

- **Sensor to Arduino:** Data interface; crucial for obstacle detection.
- **Arduino to Motor Driver:** Command interface; controls motor actions.
- **Motor Driver to Motors:** Power interface; affects movement.
- **Battery to Components:** Power interface; essential for operation.

## 4. Assumptions and Information Gaps

- **Known Information:**
  - Basic component functionality.
  - General interface connections.

- **Assumptions:**
  - Default operating voltage and current for components.
  - Standard environment for operation.

- **Unknown Information:**
  - Specific battery voltage and capacity.
  - Detailed sensor specifications and range.
  - Exact software logic and decision thresholds.

- **Information Needed:**
  - Battery specs for voltage under load.
  - Sensor model to determine range and timing.
  - Firmware details for failure handling.

## 5. Failure Analysis

| Component/Function   | Failure Mode                             | Cause                       | Immediate Effect                          | Downstream Effect                        | Existing Control | Severity                         | Occurrence                             | Detection                            | RPN | Score Rationales         | Confidence  |
|----------------------|------------------------------------------|-----------------------------|-------------------------------------------|------------------------------------------|------------------|----------------------------------|---------------------------------------|--------------------------------------|-----|---------------------------|-------------|
| Ultrasonic Sensor    | Sensor continuously returns max value    | Electrical noise, obstruction | Controller receives erroneous data         | Incorrect navigation decisions           | Not specified    | 8 - Possible collision (MEDIUM) | 5 - Plausible error source (LOW)       | 6 - Detection difficult (LOW)         | 240 | Impact, plausibility, detection     | MEDIUM      |
| Arduino Controller   | Application crashes (stack overflow)     | Software bug                | Controller halts or resets                | Stops or follows unintended paths         | Not specified    | 7 - Loss of control (MEDIUM)    | 4 - Bug unlikely (MEDIUM)            | 5 - Moderate detection (MEDIUM)       | 140 | Impact, likelihood, detectability | MEDIUM      |
| L298N Motor Driver   | Driver shorting output                   | Overcurrent/overheating     | Continuous power to motor                 | Imbalanced movement                      | Not specified    | 7 - Imbalanced motion (HIGH)    | 5 - Plausible load condition (MEDIUM) | 7 - Detection difficult (MEDIUM)      | 245 | Impact, load plausibility (HIGH)  | HIGH        |
| DC Motors            | Motor stalls, draws excessive current    | Overload, mechanical fault  | Heat buildup                               | Battery/drivers inefficient              | Not specified    | 6 - Reduced efficiency (MEDIUM) | 6 - Moderate likelihood (MEDIUM)     | 5 - Moderate detection (LOW)          | 180 | Impact, occurrence, detection     | LOW         |
| Battery              | Voltage sags near brownout threshold     | Cell depletion              | Brownout reset                             | Loss of navigation continuity             | Not specified    | 7 - System reset (LOW)          | 5 - Plausible condition (LOW)        | 4 - Moderate detectability (MEDIUM)   | 140 | Impact, plausibility, detection   | LOW         |
| Arduino Controller   | Spurious output commands                 | Software bug, noise         | Erratic motor behavior                     | Unintended movement                      | Not specified    | 8 - Potential collision (MEDIUM)| 3 - Unlikely bug (LOW)               | 6 - Requires monitoring (MEDIUM)      | 144 | Impact, occurrence, detectability | LOW         |

## 6. Failure Propagation Analysis

- **SENSOR →** Constant max output → **(invalid data) → CONTROLLER →** Wrong motion decision → **MOTOR DRIVER →** Collision
- **BATTERY →** Voltage sag → **(Arduino reset) → CONTROLLER →** Loss of logic state → **NAVIGATION →** Uncontrolled motion
- **MOTOR DRIVER →** Output held enabled → **(continuous motor power) → MOTOR →** Continuous rotation → Collision/damage
- **CONTROLLER →** Spurious output commands → **(erratic motor behavior) → MOTOR DRIVER →** Unintended movement → Collision

## 7. Risk Assessment Method

Severity, Occurrence, and Detection scores estimated using general engineering principles. Severity assesses potential damage, Occurrence estimates likelihood, Detection evaluates identification ease. RPN is product of scores, guiding mitigation focus. AI scores ≠ experimental reliability. Measured data needed for real decisions. Confidence reflects completeness of known data.

## 8. Risk Prioritization

Highest priority: **L298N Motor Driver Failure.**
- High RPN due to difficulty in detection and significant motion impact. Requires prompt attention and mitigation.

Other priorities: Ultrasonic Sensor Failure, DC Motor Stalling, Arduino Controller Crash, Spurious Output Commands, and Battery Voltage Sag. 

## 9. Recommended Mitigations

- **Failure Mode Addressed:** Ultrasonic Sensor - Max value output.
  - **Mitigation:** Add sensor data range validation. Reject readings outside 2-400 cm range. On three consecutive invalid readings, stop motors.
  - **Why It Helps:** Prevents navigation on erroneous data.
  - **Control Added/Improved:** Software error handling.
  - **Uncertainty / Validation Needed:** Sensor range spec unknown; needs testing.

- **Failure Mode Addressed:** Driver shorting output.
  - **Mitigation:** Implement watchdog timer. Reset Arduino if no signal in 1.5 sec. Disable motors if reset.
  - **Why It Helps:** Limits uncontrolled power delivery to motors.
  - **Control Added/Improved:** Hardware reset mechanism.
  - **Uncertainty / Validation Needed:** Watchdog settings need empirical validation under load.

- **Failure Mode Addressed:** Application crash (stack overflow).
  - **Mitigation:** Improve memory management in software. Add reset on critical errors.
  - **Why It Helps:** Reduces likelihood of crashes.
  - **Control Added/Improved:** Software monitoring and reset logic.
  - **Uncertainty / Validation Needed:** Test memory limits in typical conditions.

- **Failure Mode Addressed:** Battery voltage sag.
  - **Mitigation:** Use voltage monitoring circuit to check battery voltage. Trigger safe mode if below threshold.
  - **Why It Helps:** Prevents unintended resets.
  - **Control Added/Improved:** Software/Hardware voltage checks.
  - **Uncertainty / Validation Needed:** Measure actual load voltage under typical conditions.

- **Failure Mode Addressed:** Motor stalls, drawing excessive current.
  - **Mitigation:** Implement current sensing. On detecting overcurrent, disable motor temporarily.
  - **Why It Helps:** Prevents overheating/damage.
  - **Control Added/Improved:** Hardware current limiter.
  - **Uncertainty / Validation Needed:** Verify motor current thresholds with datasheet.

- **Failure Mode Addressed:** Spurious output commands.
  - **Mitigation:** Add filtering and debounce logic for commands in software.
  - **Why It Helps:** Stabilizes and corrects erratic motor behavior.
  - **Control Added/Improved:** Software command verification.
  - **Uncertainty / Validation Needed:** Requires tuning and verification of debounce parameters.

## 10. Verification Tests

### Test Name: Sensor Data Validation

Test Objective: Ensure motors stop on continuous invalid sensor data.
Setup: Robot on test stand, USB connection for data injection.
Procedure:
1. Inject out-of-range distance values via USB port.
2. Observe if motors stop.
3. Confirm that reading reset action occurs on valid data.
Expected Safe Behavior: Motors stop after three invalid readings.
Pass Criterion: Motors stop within proposed time frame of 500 ms after invalid data detection.

### Test Name: Watchdog Timer Reset

Test Objective: Verify Arduino reset via watchdog upon signal loss.
Setup: Test stand with Arduino connected to watch current state.
Procedure:
1. Simulate loss of signal to the watchdog timer.
2. Observe Arduino reset behavior.
3. Confirm motors disable post-reset.
Expected Safe Behavior: Arduino restarts and motors disable within 1.5 sec.
Pass Criterion: Verified reset occurs promptly on signal loss.

### Test Name: Software Crash Recovery

Test Objective: Test system recovery from software crash.
Setup: Induce software crash under controlled conditions.
Procedure:
1. Load memory-intensive tasks to simulate strain.
2. Trigger crash through controlled error.
3. Observe reset procedure.
Expected Safe Behavior: System recovers and operates correctly post-reset.
Pass Criterion: Software stability is observed post-fix, with no repeat crash.

### Test Name: Voltage Monitoring

Test Objective: Verify voltage monitoring intervention on low battery.
Setup: Simulate battery voltage drop.
Procedure:
1. Monitor voltage with multimeter.
2. Introduce simulated load to drop voltage.
3. Observe system response to critical threshold breach.
Expected Safe Behavior: System enters safe mode, disables operations.
Pass Criterion: Safe mode triggered at predefined voltage low point.

### Test Name: Current Sensing

Test Objective: Validate motor current sensing and protection.
Setup: Setup current monitoring on motor driver.
Procedure:
1. Simulate motor load to exceed current threshold.
2. Observe motor shutdown behavior.
Expected Safe Behavior: Motor is disabled on excessive current detection.
Pass Criterion: System disables motor power upon reaching excess load.

## 11. Engineering Limitations

Severity, Occurrence, and Detection scores are AI-estimated based on the available system description and general engineering heuristics. They are a starting point for engineering review and are not measured or validated reliability data. AI estimate ≠ measured reliability; further testing and review are essential.

Testing requires component specs, operating conditions. Estimated risks may differ from actual system, necessitating complete technical validation and environmental consideration.

## 12. Conclusion

This analysis identified critical failure modes, focusing on sensor data handling, control logic robustness, and power stability. Mitigations prioritize the motor driver issue due to its higher RPN. Each mitigation is actionable, directed toward specific failures, and supports improved detection/prevention methods. Next steps include engineering validation of estimated thresholds, hardware configuration checks, and real-world testing to confirm effectiveness and reliability of strategies.
