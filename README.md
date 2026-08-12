# FMEA Engineer

### AI-Assisted Failure Analysis for Engineering Systems

> "Engineering becomes more powerful when AI can help us reason about how systems fail."

FMEA Engineer is an **AI-assisted engineering analysis tool** I built to explore the intersection of **Computer Engineering, AI, embedded systems, and robotics**.

It transforms an engineering system description into a structured **Failure Mode and Effects Analysis (FMEA)**. Using **Python and Backboard**, the system identifies potential failures, traces how they propagate through the system, prioritizes risks, and recommends mitigation and verification approaches.

The reference system is an **Arduino autonomous robot** using an ultrasonic sensor, Arduino controller, L298N motor driver, DC motors, and battery.

## Why I Built This

I wanted to explore how AI could be applied to a real engineering problem rather than simply generating code or text.

In an engineering system, one component failure can affect several other components. FMEA Engineer focuses on understanding these relationships and following a failure from its initial cause to its possible system-level consequence.

I wanted the system to answer questions such as:

* What can fail?
* Why can it fail?
* What happens when it fails?
* How can the risk be prioritized?
* How could the failure be safely verified?
* What information is still unknown?

## Workflow

```text
System Description
        ↓
System Decomposition
        ↓
Failure Modes & Propagation
        ↓
Risk Assessment
        ↓
Mitigation & Verification
        ↓
Engineering Report
```

A shared **Backboard thread** is used across the reasoning stages so that each stage builds on the previous analysis.

## Example Failure Propagation

```text
Sensor Failure
      ↓
Invalid Data
      ↓
Controller Decision
      ↓
Motor Driver
      ↓
Motor Output
      ↓
System Consequence
```

This allows the analysis to consider not only individual component failures, but also how failures can propagate through an interconnected system.

## Key Features

* System decomposition and dependency analysis
* AI-assisted failure mode identification
* Failure propagation analysis
* Severity, Occurrence, and Detection assessment
* Risk Priority Number (RPN) calculation
* Risk prioritization
* Engineering mitigation recommendations
* Safe verification planning
* Explicit assumptions and information gaps
* Automated Markdown report generation

## Risk Assessment

The system evaluates:

* **Severity**
* **Occurrence**
* **Detection**
* **Risk Priority Number (RPN)**

```text
RPN = Severity × Occurrence × Detection
```

The scores are **AI-assisted engineering estimates**, not measured reliability data.

## Technology Stack

* Python
* Backboard SDK
* Backboard Assistant
* Backboard Threads
* Markdown

The project applies concepts from **FMEA, embedded systems, robotics, sensor systems, motor control, risk analysis, and engineering verification**.

## Project Structure

```text
fmea-engineer/
├── fmea_engineer.py
├── debug_run.py
├── assistant.json
├── fmea-report.md
├── quality_checks.txt
├── README.md
└── .gitignore
```

## Getting Started

### Install Dependencies

```bash
pip install backboard-sdk
```

### Run the Analysis

```powershell
python fmea_engineer.py "Arduino autonomous robot using an ultrasonic sensor, Arduino controller, L298N motor driver, DC motors, and battery"
```

The generated report is saved as:

```text
fmea-report.md
```

## Engineering Limitations

The analysis depends on the information provided about the system.

Unknown specifications are treated as **information gaps rather than invented values**.

Examples include:

* Battery specifications
* Sensor model and range
* Motor ratings
* Motor-driver ratings
* Thermal limits
* Firmware and control logic
* Environmental conditions

This project supports **engineering reasoning**, but it does not replace engineering review, physical testing, or safety certification.

## Future Development

* Interactive engineering interface
* Failure-propagation visualization
* Risk dashboards
* Support for additional robotic and embedded systems
* Integration with real engineering test data

## What This Project Represents

FMEA Engineer is part of my exploration of how **AI can be combined with Computer Engineering and robotics to solve practical engineering problems**.

Rather than treating AI as only a coding assistant, this project explores its potential as a tool for **structured engineering reasoning and decision support**.

## Author

**Hafsa Saeed**

Computer Engineering | AI | Embedded Systems | Robotics

**Built to explore the intersection of AI-assisted reasoning and engineering decision-making.**
