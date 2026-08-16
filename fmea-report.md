# FMEA Engineer - Failure Analysis Report

## 1. System Overview

The autonomous Arduino robot uses:
- **Arduino Controller:** Executes control algorithms and processes sensor data.
- **HC-SR04 Ultrasonic Sensor:** Detects obstacles by measuring distances.
- **L298N Motor Driver:** Drives the two DC motors.
- **DC Motors:** Facilitate robot movement.
- **Rechargeable Battery:** Supplies power to the entire system.
- **Voltage Regulation:** Maintains stable voltage delivery to components.
- **Embedded Control Software:** Implements logic for navigation decisions.

## 2. System Components and Functions

- **Arduino Controller:** Processes inputs and issues commands.
- **HC-SR04 Sensor:** Sends distance data to Arduino.
- **L298N Driver:** Receives commands from Arduino, powers motors.
- **DC Motors:** Convert electrical signals into mechanical motion.
- **Battery:** Powers all components.
- **Regulation Circuit:** Conditions power from the battery.
- **Control Software:** Determines robot movement based on data.

## 3. Interfaces and Dependencies

- **Arduino ↔ HC-SR04:** Sensor data communication for obstacle detection.
- **Arduino ↔ Motor Driver:** Command exchange for motor control.
- **Motor Driver ↔ Motors:** Power delivery for motion.
- **Battery ↔ Components:** Provides necessary energy to system.
- **Regulation Circuit ↔ Sensitive Components:** Ensures stable voltage.

## 4. Assumptions and Information Gaps

### Known Information
- Components and their primary functions are identified.
- Basic system interfaces and dependencies are understood.

### Assumptions
- Generic operational environments assumed (e.g., indoor flat surfaces).
- Typical component function expected without abnormal stress factors.

### Unknown Information
- Battery specifications (voltage, capacity).
- Exact environmental conditions affecting operation.
- Detailed software logic and error handling mechanisms.
- Sensor range and model-specific characteristics.

### Information Needed
- Vendor datasheets for sensor and motor driver.
- Battery voltage profile and brownout thresholds.
- Load characteristics and torque of motors.
- Firmware structure and code logic for navigation.

### Information Gaps
These gaps reduce confidence in evaluating the failure modes' occurrence likelihoods and detection capabilities, leading to reliance on heuristics in risk scoring.

## 5. Failure Analysis

| Component/Function | Failure Mode | Cause | Immediate Effect | Downstream Effect | Existing Control | Severity | Occurrence | Detection | RPN | Score Rationales | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| HC-SR04 Sensor | Outputs Max Distance | Faulty transducer | Invalid data to controller | Wrong navigation decision | Not specified | 8 - Collision likely (HIGH) | 5 - Noise plausible (MEDIUM) | 6 - Without range check (MEDIUM) | 240 | Severe collision risk, plausible occurrence without detection logic | MEDIUM |
| HC-SR04 Sensor | Invalid Echo Response | Loose wiring | Data inconsistency | Erratic movement | Not specified | 6 - Degraded navigation (MEDIUM) | 6 - Wiring/issues possible (MEDIUM) | 5 - Lacks diagnostics (MEDIUM) | 180 | Erratic paths possible; requires error monitoring | MEDIUM |
| Arduino Controller | Application Crash | Software bug | Control execution stops | Motors stop or erratic | Not specified | 7 - Erratic behavior possible (MEDIUM) | 4 - Unlikely unless specific (LOW) | 5 - Needs debugging (MEDIUM) | 140 | Rare crash, but effects complex to identify | LOW |
| Arduino Controller | Brownout Reset | Voltage sag | Temporary logic loss | Control interruption | Not specified | 7 - Interrupts tasks (MEDIUM) | 5 - Voltage sag plausible (MEDIUM) | 4 - Can monitor (MEDIUM) | 140 | Occurrence unknown due to battery specs | MEDIUM |
| Motor Driver | Continuous Current | Stuck signal | Power remains on | Overheating potential | Not specified | 9 - Fire risk (HIGH) | 3 - Rare setup needed (LOW) | 6 - Hard to detect (MEDIUM) | 162 | Severe but rare; challenging to pre-empty | LOW |
| Motor Driver | Overheating | Excess load | Thermal limits exceeded | Inconsistent control | Not specified | 8 - Possible damage (MEDIUM) | 6 - Load fluctuations likely (MEDIUM) | 7 - Detection hard (LOW) | 336 | Needs testing under load | LOW |
| DC Motor | Stalls Under Load | Mechanical overload | Heat buildup | Motor damage | Not specified | 7 - Immobilized risk (MEDIUM) | 5 - High load plausible (MEDIUM) | 5 - Requires sensing (MEDIUM) | 175 | Moderate impact on operation, detect by sensing | MEDIUM |
| Battery | Voltage Sag | High discharge | Undervoltage | System resets | Not specified | 8 - Resets and control loss (MEDIUM) | 6 - High load possible (MEDIUM) | 4 - Voltage check possible (MEDIUM) | 192 | Vital for stability, easily detectable | MEDIUM |

## 6. Failure Propagation Analysis

COMPONENT → FAILURE → INTERFACE / DEPENDENCY → NEXT COMPONENT → SYSTEM CONSEQUENCE:

- **HC-SR04 Sensor** → Outputs Max Distance → (invalid data) → **Arduino Controller** → Wrong motion decision → **Motor Driver** → Collision
- **Battery** → Voltage Sag → (undervoltage event) → **Arduino Controller** → Logic reset → **Navigation** → Uncontrolled motion
- **Motor Driver** → Continuous Output → (overcurrent) → **DC Motor** → Overheating → Damage

## 7. Risk Assessment Method

- **Severity:** Measures impact if failure occurs, not likelihood.
- **Occurrence:** Estimates likelihood based on system and environment.
- **Detection:** Ability to identify the failure before significant impact.
- **RPN:** Product of Severity, Occurrence, and Detection.
- **Confidence:** Reflects completeness of information, not likelihood.
 
AI-estimated scores guide prioritization and require validation through engineering review, testing, or field experience. AI estimate ≠ measured reliability.

## 8. Risk Prioritization

Prioritized by highest RPN:
1. **Motor Driver Overheating (RPN: 336):** Critical due to the possibility of hardware damage and difficulty in detection.
2. **HC-SR04 Outputs Max Distance (RPN: 240):** High severity from potential collisions.
3. **Battery Voltage Sag (RPN: 192):** Significant as it can lead to system resets.

High-priority risks include those with critical impact potential and those difficult to detect.

## 9. Recommended Mitigations

- **Failure Mode Addressed:** Motor Driver Overheating
  - **Mitigation:** Implement a thermal shutdown using a sensor and control logic to disable motors when overheating.
  - **Why It Helps:** Reduces severity, prevents damage by stopping power in overheating.
  - **Control Added:** Temperature monitoring circuit with shutdown routine.
  - **Uncertainty:** Requires testing with actual temperature conditions to determine shutdown threshold.

- **Failure Mode Addressed:** HC-SR04 Outputs Max Distance
  - **Mitigation:** Implement sensor data range validation in Arduino code to reject out-of-range readings.
  - **Why It Helps:** Detects invalid readings, reducing false commands to motors.
  - **Control Added:** Software validation routine.
  - **Uncertainty:** Requires sensor range specification.

- **Failure Mode Addressed:** Battery Voltage Sag
  - **Mitigation:** Add voltage monitoring and alert system in the Arduino firmware.
  - **Why It Helps:** Provides early warning of low voltage to prevent sudden resets.
  - **Control Added:** Voltage monitoring circuit with LED/serial alert.
  - **Uncertainty:** Voltage profile needs empirical measurement under load.

- **Failure Mode Addressed:** Motor Driver Continuous Current
  - **Mitigation:** Use watchdog timer circuit to reset driver power upon detecting PWM signal issues.
  - **Why It Helps:** Limits duration of uncontrolled current flow.
  - **Control Added:** Hardware watchdog for PWM control lines.
  - **Uncertainty:** Timeout values require empirical validation.

- **Failure Mode Addressed:** Arduino Controller Brownout Reset
  - **Mitigation:** Implement power-reset management circuits to ensure orderly shutdown and recovery.
  - **Why It Helps:** Prevents abrupt resets affecting control logic.
  - **Control Added:** Circuit to manage power restoration.
  - **Uncertainty:** Empirical validation necessary to determine threshold.

## 10. Verification Tests

### Test Name: Motor Driver Thermal Shutdown

Test Objective:
Verify that motor driver stops power delivery when overheating.

Setup:
Place thermal sensors on driver chip. Connect shutdown circuit in setup. Raise robot on a test stand.

Procedure:
1. Energize motors at full load and monitor temperature.
2. Simulate thermal limits to trigger shutdown.
3. Confirm motor power stops within expected time.

Expected Safe Behavior:
Motor power stops when temperature exceeds set threshold.

Pass Criterion:
Motor power is disabled below threshold temperature within 500 ms.

### Test Name: Sensor Data Range Validation

Test Objective:
Verify sensor range validation prevents incorrect navigation decisions.

Setup:
Raise robot, use serial port for test data input. Monitor motor control lines.

Procedure:
1. Inject out-of-range distance via serial.
2. Observe motor control responses to invalid data.
3. Check for correct motor stop logic activation.

Expected Safe Behavior:
Motors stop upon detecting invalid readings.

Pass Criterion:
Motors cease power within specified time post-invalid data input.

### Test Name: Voltage Monitoring Alert

Test Objective:
Verify voltage alert system operates correctly to prevent brownouts.

Setup:
Use voltage divider for battery level input, connect alert system to Arduino.

Procedure:
1. Simulate voltage drop across battery supply.
2. Observe alert activations (LED/serial output).
3. Verify control logic halts motors on alert.

Expected Safe Behavior:
Alert activates with timely warning, stopping motors.

Pass Criterion:
Alert triggers below set voltage, halting motors successfully.

### Test Name: PWM Signal Watchdog

Test Objective:
Verify watchdog resets PWM signal controlling motor driver.

Setup:
Configure watchdog timer circuit to reset on PWM signal timeout.

Procedure:
1. Monitor PWM signal under normal conditions.
2. Simulate signal loss to activate watchdog.
3. Check reset and motor state post-watchdog trigger.

Expected Safe Behavior:
PWM control should reset, disabling driver power.

Pass Criterion:
Motor power stops within set delay after signal loss.

### Test Name: Power-Reset Management

Test Objective:
Verify orderly system behavior on power restoration.

Setup:
Implement power-reset management on Arduino, monitor reset behavior.

Procedure:
1. Run control logic while dropping power.
2. Restore power and observe system response.
3. Check for proper recovery and continuity.

Expected Safe Behavior:
System restarts smoothly, maintaining control state.

Pass Criterion:
System resumes operation without errors or interruptions.

## 11. Engineering Limitations

Severity, Occurrence, and Detection scores are AI-estimated based on the available system description and general engineering heuristics. They are a starting point for engineering review and are not measured or validated reliability data. AI estimate ≠ measured reliability; further testing and review are essential.

Real reliability decisions must be supported by testing or historical data. Analysis limited by missing specs such as battery voltage and thermal ratings. Assumptions in confidence levels influence accuracy and applicability.

## 12. Conclusion

The highest-priority risks involve power management and sensor data integrity. Immediate focus should be on implementing effective monitoring and validation routines. Future steps involve empirical testing to fine-tune thresholds and validate controls. AI-estimated scores are for initial prioritization and need confirmation by real-world measurements and field data.
