# FMEA Engineer

### AI-Assisted Failure Analysis for Engineering Systems

**FMEA Engineer** is an AI-assisted engineering analysis tool that combines my interests in **Computer Engineering, AI, embedded systems, and robotics**.

It transforms an engineering system description into a structured **Failure Mode and Effects Analysis (FMEA)**. Using **Python and Backboard**, the system identifies failure modes, traces failure propagation, prioritizes risks, recommends mitigations, and generates a structured engineering report.

The reference system is an **Arduino autonomous robot** using an ultrasonic sensor, Arduino controller, L298N motor driver, DC motors, and battery.

## Why I Built This

I wanted to explore how AI can assist engineers in reasoning about **system failures**, rather than simply generating code or text.

The project focuses on connecting AI-assisted reasoning with real engineering concepts such as risk assessment, failure propagation, and verification.

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
Engineering Report
```

## Key Features

* System decomposition
* Failure mode identification
* Failure propagation analysis
* Severity, Occurrence & Detection assessment
* RPN-based risk prioritization
* Mitigation recommendations
* Safe verification planning
* Explicit assumptions and information gaps
* Automated Markdown report generation

## Example Failure Chain

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

## Risk Assessment

FMEA Engineer evaluates:

* **Severity**
* **Occurrence**
* **Detection**
* **Risk Priority Number (RPN)**

```text
RPN = Severity × Occurrence × Detection
```

Risk scores are **AI-assisted engineering estimates**, not measured reliability data.

## Technology Stack

* Python
* Backboard SDK
* Backboard Assistant
* Backboard Threads
* Markdown

Engineering concepts include **FMEA, embedded systems, robotics, sensor systems, motor control, and engineering verification**.

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

## Setup

### Install Dependencies

```bash
pip install backboard-sdk
```

### Run

```powershell
python fmea_engineer.py "Arduino autonomous robot using an ultrasonic sensor, Arduino controller, L298N motor driver, DC motors, and battery"
```

The generated report is saved as:

```text
fmea-report.md
```

## Limitations

The analysis depends on the information provided about the system. Unknown specifications are treated as **information gaps rather than invented values**.

This project supports engineering reasoning but does not replace engineering review, physical testing, or safety certification.

## Future Development

* Interactive engineering interface
* Failure-propagation visualization
* Risk dashboards
* Additional robotic and embedded systems
* Integration with real engineering test data

## Author

**Hafsa Saeed**

Computer Engineering | AI | Embedded Systems | Robotics

**Built to explore the intersection of AI-assisted reasoning and engineering decision-making.**
