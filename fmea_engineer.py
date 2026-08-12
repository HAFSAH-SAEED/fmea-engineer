
import asyncio
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Awaitable, Callable, TypeVar

from backboard import BackboardClient


ASSISTANT_NAME = "FMEA Engineer"
ASSISTANT_FILE = Path("assistant.json")
REPORT_FILE = Path("fmea-report.md")
REPORT_TMP_FILE = Path("fmea-report.md.tmp")

SCORE_DISCLAIMER = (
    "Severity, Occurrence, and Detection scores are AI-estimated based on the "
    "available system description and general engineering heuristics. They are a "
    "starting point for engineering review and are not measured or validated "
    "reliability data. AI estimate ≠ measured reliability; further testing and "
    "review are essential."
)

SYSTEM_PROMPT = f"""
You are FMEA Engineer, an AI-assisted engineering failure mode and effects analysis assistant.

Your job is to help create practical, transparent FMEA-style analyses for real engineering systems.
Be concrete, system-specific, and honest about uncertainty. Never claim that AI-generated risk
scores are measured, experimentally validated, certified, or statistically proven.

Mandatory framing to include wherever risk scores are discussed:
{SCORE_DISCLAIMER}

CORE ENGINEERING PRINCIPLES:
1. CAUSE vs FAILURE MODE: A cause explains WHY a failure can occur (e.g., faulty transducer, software bug,
   electrical interference). A failure mode explains WHAT fails and HOW it fails concretely
   (e.g., "sensor continuously outputs maximum distance value" or "motor driver output remains
   enabled after stop command"). Always distinguish these clearly.

2. FAILURE PROPAGATION: Trace failures across component boundaries. For example:
   SENSOR PRODUCES BAD DATA → CONTROLLER RECEIVES INVALID INPUT → CONTROLLER MAKES WRONG DECISION
   → MOTOR DRIVER RECEIVES WRONG COMMAND → SYSTEM-LEVEL CONSEQUENCE (collision, uncontrolled motion).

3. SPECIFICITY: Never use generic phrases like "Sensor fails," "Motor stops," "Battery dies," or
   "Software breaks" as the complete failure mode. Explain exactly what happens. Preferred examples:
   - "Ultrasonic sensor continuously returns the maximum distance value while moving."
   - "Motor driver output stage remains enabled even after Arduino signals stop."
   - "Arduino loses power momentarily, resetting controller while motors are under load."

4. MISSING INFORMATION: Do not invent hardware specs, thresholds, timeouts, current limits, voltage
   ratings, sensor ranges, or model numbers. If this information is absent, explicitly mark it as
   unknown. Acknowledge how missing information lowers confidence. Use phrases like "If battery voltage
   is [unknown], then..." or "Assuming [value] for [parameter], but this requires validation."

5. CONFIDENCE SCORING:
   - Mark confidence as HIGH only when technical details and environmental conditions are well-specified.
   - Mark confidence as MEDIUM when some information is available but key specs are missing.
   - Mark confidence as LOW when fundamental engineering details are absent.
   - Higher confidence does not mean higher certainty of occurrence; it means better information.

6. RISK SCORES (1–10): Severity, Occurrence, and Detection are engineering estimates, not probabilities.
   - Severity 8 does NOT mean "likely to fail." It means "if this mode occurs, damage is significant."
   - Occurrence 5 is a generic middle estimate, not "fails 50% of the time."
   - Detection 6 means "moderately challenging to detect before impact" given available diagnostics.
   - Always provide rationale and mark confidence for every score.

7. REAL-WORLD CONTEXT:
   - AI-estimated scores are a starting point for engineering review and prioritization.
   - Measured failure rates, historical data, test results, or field experience > AI estimates.
   - Inform the reader: "These scores must be validated by engineering review, testing, or failure data."

8. MITIGATIONS: Must be concrete and mapped to specific failure modes. Avoid generic advice like
   "Improve monitoring." Prefer "Add sensor data validation to reject consecutive invalid readings"
   or "Implement a current-limiting circuit on the motor driver." If a proposed threshold is used
   (e.g., "three consecutive max readings"), clearly label it as a "proposed starting point requiring
   engineering validation" — never present it as an established rule.

9. VERIFICATION TESTS: Safe, realistic, and technically achievable in a lab or bench setting.
   - Preferred: Simulation, controlled fault injection, safe sensor disconnection, invalid-data injection,
     current-limited bench supplies, test stands, software testing, and safe load testing.
   - FORBIDDEN: Intentional short circuits, uncontrolled battery abuse, forced motor stalls, destructive
     faults, uncontrolled overheating, or damaging components. Use current-limited supplies, simulation,
     and safe mechanical loads instead.
   - NEVER claim a physical test was performed unless it actually was.
   - Each test must have: Objective, Setup, Procedure, Expected Safe Behavior, and Pass Criterion.

Rules:
- Do not invent exact hardware specifications, measurements, failure rates, or test results.
- If information is missing, state assumptions clearly and lower confidence where appropriate.
- Explicitly distinguish CAUSE → FAILURE MODE → IMMEDIATE EFFECT → DOWNSTREAM EFFECT → SYSTEM EFFECT.
- Prefer specific failure modes over vague labels.
- Reason across component boundaries and explain propagation paths.
- Use Severity, Occurrence, and Detection scores from 1 to 10 only as engineering-review estimates.
- RPN is Severity × Occurrence × Detection.
- For every S/O/D score, give rationale, confidence, and uncertainty.
- Recommend concrete mitigations and safe practical verification tests.
- Do not recommend dangerous tests such as intentional short circuits, uncontrolled battery abuse,
  destructive faults, or damaging components. Prefer controlled fault injection, simulation,
  current-limited bench testing, and raised/test-stand operation.
""".strip()


T = TypeVar("T")


def usage() -> str:
    return (
        "Usage:\n"
        "  python fmea_engineer.py \"<engineering system description>\"\n\n"
        "Example:\n"
        "  python fmea_engineer.py \"Arduino autonomous robot using an ultrasonic sensor, "
        "Arduino controller, L298N motor driver, DC motors, and battery\""
    )


async def retry_once(label: str, operation: Callable[[], Awaitable[T]]) -> T:
    """Run a Backboard operation, retrying the failed call once."""
    try:
        return await operation()
    except Exception as first_error:
        print(f"Warning: {label} failed; retrying once...", flush=True)
        try:
            return await operation()
        except Exception as second_error:
            raise RuntimeError(
                f"{label} failed after one retry: {type(second_error).__name__}: {second_error}"
            ) from first_error


def get_model_id(model: Any, field_name: str) -> str:
    value = getattr(model, field_name)
    return str(value)


def read_saved_assistant_id() -> str | None:
    if not ASSISTANT_FILE.exists():
        return None

    try:
        data = json.loads(ASSISTANT_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None

    assistant_id = data.get("assistant_id")
    if isinstance(assistant_id, str) and assistant_id.strip():
        return assistant_id.strip()
    return None


async def get_or_create_assistant(client: BackboardClient) -> str:
    saved_id = read_saved_assistant_id()
    if saved_id:
        try:
            assistant = await retry_once(
                "validating saved assistant", lambda: client.get_assistant(saved_id)
            )
            if getattr(assistant, "name", None) == ASSISTANT_NAME:
                await retry_once(
                    "updating assistant instructions",
                    lambda: client.update_assistant(
                        saved_id,
                        name=ASSISTANT_NAME,
                        description="AI-assisted engineering FMEA workflow with transparent risk reasoning.",
                        system_prompt=SYSTEM_PROMPT,
                    ),
                )
                print(f"Reusing Backboard assistant: {ASSISTANT_NAME}", flush=True)
                return saved_id
            print("Saved assistant ID exists but does not match the expected assistant name; creating a new one.", flush=True)
        except Exception:
            print("Saved assistant ID is not valid or could not be loaded; creating a new assistant.", flush=True)

    assistant = await retry_once(
        "creating assistant",
        lambda: client.create_assistant(
            name=ASSISTANT_NAME,
            description="AI-assisted engineering FMEA workflow for Backboard Global Hack Week Challenge 5.",
            system_prompt=SYSTEM_PROMPT,
        ),
    )
    assistant_id = get_model_id(assistant, "assistant_id")
    ASSISTANT_FILE.write_text(
        json.dumps({"assistant_id": assistant_id, "name": ASSISTANT_NAME}, indent=2),
        encoding="utf-8",
    )
    print(f"Created Backboard assistant: {ASSISTANT_NAME}", flush=True)
    return assistant_id


def extract_response_content(response: Any) -> str:
    messages = getattr(response, "messages", None)
    if not messages:
        content = getattr(response, "content", None)
        if content:
            return str(content).strip()
        raise RuntimeError("Backboard response did not contain any assistant message content.")

    for message in reversed(messages):
        if isinstance(message, dict):
            role = str(message.get("role", "")).lower()
            content = message.get("content")
            if role == "assistant" and content:
                return normalize_content(content)

    for message in reversed(messages):
        content = message.get("content") if isinstance(message, dict) else getattr(message, "content", None)
        if content:
            return normalize_content(content)

    raise RuntimeError("Backboard response did not contain any assistant message content.")


def normalize_content(content: Any) -> str:
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text") or item.get("content") or item.get("value")
                if text:
                    parts.append(str(text))
            elif item:
                parts.append(str(item))
        return "\n".join(parts).strip()
    return str(content).strip()


async def ask_stage(client: BackboardClient, thread_id: str, label: str, prompt: str) -> str:
    response = await retry_once(
        label,
        lambda: client.add_message(
            thread_id=thread_id,
            content=prompt,
        ),
    )
    return extract_response_content(response)


def strip_markdown_fences(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```markdown"):
        stripped = stripped.removeprefix("```markdown").strip()
    elif stripped.startswith("```"):
        stripped = stripped.removeprefix("```").strip()
    if stripped.endswith("```"):
        stripped = stripped[:-3].strip()
    return stripped


def ensure_report_requirements(report: str) -> str:
    """Validate and canonicalize the generated FMEA Markdown report."""

    # Backboard/model output can sometimes contain escaped newlines.
    # Convert them into real Markdown lines before validation.
    report = report.replace("\\r\\n", "\n").replace("\\n", "\n")
    report = strip_markdown_fences(report).strip()
    
    # NORMALIZE DASHES IMMEDIATELY - all dash variants to standard hyphen
    # This handles —, –, −, and other Unicode dash variants
    def normalize_dashes(text: str) -> str:
        return (
            text.replace("—", "-")
            .replace("–", "-")
            .replace("−", "-")
            .replace("‐", "-")
            .replace("⁠-", "-")
        )
    
    report = normalize_dashes(report)

    required_sections = [
        "# FMEA Engineer - Failure Analysis Report",
        "## 1. System Overview",
        "## 2. System Components and Functions",
        "## 3. Interfaces and Dependencies",
        "## 4. Assumptions and Information Gaps",
        "## 5. Failure Analysis",
        "## 6. Failure Propagation Analysis",
        "## 7. Risk Assessment Method",
        "## 8. Risk Prioritization",
        "## 9. Recommended Mitigations",
        "## 10. Verification Tests",
        "## 11. Engineering Limitations",
        "## 12. Conclusion",
    ]

    # Sanity check: does report contain key FMEA content?
    report_lower = report.casefold()
    required_content_keywords = [
        "failure",
        "severity",
        "test",
    ]
    
    missing_keywords = [kw for kw in required_content_keywords if kw not in report_lower]
    if len(missing_keywords) >= 2:
        raise RuntimeError(
            "Final report does not contain required FMEA content. "
            "Missing key terms: " + ", ".join(missing_keywords) + ". "
            "The generated report may be truncated or incomplete."
        )
    
    # If we have core FMEA content, report is minimally valid
    # Skip strict section structure checks in this case
    has_core_content = all(kw in report_lower for kw in ["failure", "severity", "test"])

    # ---------------------------------------------------------
    # SECTION RECONSTRUCTION
    # ---------------------------------------------------------
    
    def extract_heading_text(line: str) -> str | None:
        """Extract heading text, removing # markers and normalizing."""
        stripped = line.strip()
        if not stripped.startswith("#"):
            return None
        # Remove leading # symbols and whitespace
        text = re.sub(r"^\s*#+\s*", "", stripped)
        # Remove trailing # symbols if present
        text = re.sub(r"\s*#+\s*$", "", text)
        # Remove bold/italic markers
        text = text.replace("**", "").replace("__", "").replace("*", "").replace("_", "").strip()
        # Normalize whitespace
        text = " ".join(text.split())
        return text if text else None
    
    # Extract all headings and try to match them to required sections
    lines = report.splitlines()
    canonical_lines = []
    
    for line in lines:
        heading_text = extract_heading_text(line)
        if heading_text:
            # Try to match to a required section and use canonical form
            matched = False
            for required in required_sections:
                required_text = extract_heading_text(required)
                if required_text and required_text.casefold() == heading_text.casefold():
                    canonical_lines.append(required)
                    matched = True
                    break
            if not matched:
                canonical_lines.append(line)
        else:
            canonical_lines.append(line)
    
    report = "\n".join(canonical_lines).strip()
    
    # ---------------------------------------------------------
    # VERIFY ALL REQUIRED SECTIONS EXIST IN CONTENT
    # ---------------------------------------------------------
    
    # Only strictly check section structure if core content is not yet confirmed
    if not has_core_content:
        section_markers = {
            "failure analysis": "## 5. Failure Analysis",
            "mitigation": "## 9. Recommended Mitigations",
            "verification": "## 10. Verification Tests",
            "overview": "## 1. System Overview",
        }
        
        for marker_term, canonical_heading in section_markers.items():
            if marker_term not in report_lower:
                raise RuntimeError(
                    f"Final report is missing or lacks required '{marker_term}' content."
                )
            # Ensure it has the proper heading if the content exists
            if canonical_heading not in report:
                # Try to find any heading variation and replace it
                for line in report.split("\n"):
                    if marker_term in extract_heading_text(line or "").casefold():
                        report = report.replace(line, canonical_heading, 1)
                        break

    # ---------------------------------------------------------
    # SCORE DISCLAIMER
    # ---------------------------------------------------------

    if SCORE_DISCLAIMER not in report:
        report += f"\n\n> {SCORE_DISCLAIMER}\n"

    # ---------------------------------------------------------
    # REQUIRED FAILURE ANALYSIS TABLE COLUMNS
    # ---------------------------------------------------------

    required_columns = [
        "Component/Function",
        "Failure Mode",
        "Cause",
        "Immediate Effect",
        "Downstream Effect",
        "Existing Control",
        "Severity",
        "Occurrence",
        "Detection",
        "RPN",
        "Score Rationales",
        "Confidence",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in report
    ]

    if missing_columns:
        raise RuntimeError(
            "Final report is missing required table column(s): "
            + ", ".join(missing_columns)
        )

    # ---------------------------------------------------------
    # UNSAFE VERIFICATION TEST CHECK
    # ---------------------------------------------------------

    unsafe_test_phrases = [
        "short circuit condition",
        "force a short circuit",
        "induce short circuit",
        "battery abuse",
        "damage the component",
        "mechanically impede",
        "induce motor stall",
        "simulate no cooling",
        "apply high power",
        "thermal load test",
        "automatic shutdown on overheating",
        "heat motor driver",
        "block the wheel",
        "jam the motor",
        "force stall",
        "overvoltage test",
        "overcurrent test",
        "uncontrolled heating",
        "accelerated aging",
        "burn-in test",
        "intentional overload",
        "abuse test",
        "destructive test",
        "cut trace",
        "remove resistor",
        "bypass capacitor",
        "short the",
        "short pin",
        "intentionally overheat",
    ]

    found_unsafe = [
        phrase
        for phrase in unsafe_test_phrases
        if phrase.casefold() in report.casefold()
    ]

    if found_unsafe:
        raise RuntimeError(
            "Final report contains unsafe verification wording: "
            + ", ".join(found_unsafe)
        )

    # ---------------------------------------------------------
    # FAILURE ANALYSIS SECTION
    # ---------------------------------------------------------

    failure_marker = "## 5. Failure Analysis"
    propagation_marker = "## 6. Failure Propagation Analysis"

    report_normalized = normalize_dashes(report)

    if (
        failure_marker not in report_normalized
        or propagation_marker not in report_normalized
    ):
        raise RuntimeError(
            "Failure Analysis section boundaries could not be located."
        )

    failure_section = (
        report_normalized
        .split(failure_marker, 1)[1]
        .split(propagation_marker, 1)[0]
    )

    # ---------------------------------------------------------
    # FAILURE MODE COUNT
    # ---------------------------------------------------------

    table_rows = [
        line
        for line in failure_section.splitlines()
        if line.strip().startswith("|")
        and "---" not in line
        and "Component/Function" not in line
    ]

    if len(table_rows) < 6:
        raise RuntimeError(
            "Final report must include at least six meaningful failure modes."
        )

    # ---------------------------------------------------------
    # INFORMATION GAPS
    # ---------------------------------------------------------

    report_lower = report.casefold()

    if "information gaps" not in report_lower:
        raise RuntimeError(
            "Final report must explicitly include an Information Gaps discussion."
        )

    unknown_terms = [
        "unknown",
        "not provided",
        "not specified",
        "requires datasheet",
        "requires engineering validation",
    ]

    if not any(term in report_lower for term in unknown_terms):
        raise RuntimeError(
            "Information Gaps section must explicitly identify "
            "unknown or unspecified information."
        )

    # ---------------------------------------------------------
    # UNSUPPORTED RELIABILITY CLAIMS
    # ---------------------------------------------------------

    reliability_claim_patterns = [
        r"\b\d+(?:\.\d+)?%\s+(?:detection|reliability|success|failure)",
        r"\bfails?\s+after\s+\d+\s*(?:hours|cycles|runs)\b",
        r"\b\d+(?:\.\d+)?%\s+probability\b",
        r"\bmeasured\s+(?:failure|reliability)\s+rate\b",
        r"\bguaranteed\s+reliability\b",
    ]

    found_claims = [
        pattern
        for pattern in reliability_claim_patterns
        if re.search(
            pattern,
            report,
            flags=re.IGNORECASE,
        )
    ]

    if found_claims:
        raise RuntimeError(
            "Final report contains unsupported quantitative reliability claims."
        )

    # ---------------------------------------------------------
    # GENERIC FAILURE MODE CHECK
    # ---------------------------------------------------------

    generic_failure_phrases = [
        "| arduino controller | incorrect processing |",
        "| dc motors | mechanical wear |",
        "| battery | insufficient power |",
        "| system communication | signal interruption |",
    ]

    found_generic = [
        phrase
        for phrase in generic_failure_phrases
        if phrase in report_lower
    ]

    if found_generic:
        raise RuntimeError(
            "Final report contains generic failure-mode wording: "
            + ", ".join(found_generic)
        )

    # ---------------------------------------------------------
    # CONFIDENCE COLUMN
    # ---------------------------------------------------------

    if "Confidence" not in report:
        raise RuntimeError(
            "Final report Failure Analysis table is missing the Confidence column."
        )

    confidence_rows = [
        line
        for line in failure_section.splitlines()
        if re.search(
            r"\b(?:HIGH|MEDIUM|LOW)\b",
            line,
            flags=re.IGNORECASE,
        )
    ]

    if len(confidence_rows) < 6:
        raise RuntimeError(
            "Final report table must include at least six failure modes "
            "with explicit confidence levels (HIGH, MEDIUM, or LOW). "
            "Found only "
            + str(len(confidence_rows))
            + "."
        )

    # ---------------------------------------------------------
    # SCORE VALIDATION
    # ---------------------------------------------------------

    malformed_score_rows = []

    for row in table_rows:
        cells = [
            cell.strip()
            for cell in row.split("|")
        ]

        if len(cells) < 13:
            malformed_score_rows.append(row)
            continue

        severity = cells[7]
        occurrence = cells[8]
        detection = cells[9]
        rpn = cells[10]

        # Check numeric scores exist
        if not re.search(r"\b(?:10|[1-9])\b", severity):
            malformed_score_rows.append(row)
            continue

        if not re.search(r"\b(?:10|[1-9])\b", occurrence):
            malformed_score_rows.append(row)
            continue

        if not re.search(r"\b(?:10|[1-9])\b", detection):
            malformed_score_rows.append(row)
            continue

        if not re.search(r"\b\d+\b", rpn):
            malformed_score_rows.append(row)
            continue

        # Check that S/O/D cells include confidence levels (HIGH, MEDIUM, LOW)
        # Allow confidence in either S/O/D cells OR in the Confidence column
        has_confidence_in_sod = re.search(
            r"\b(?:HIGH|MEDIUM|LOW)\b",
            (severity + " " + occurrence + " " + detection),
            flags=re.IGNORECASE
        )
        
        if not has_confidence_in_sod:
            # Check if there's at least a Confidence column entry
            if len(cells) >= 13:
                confidence = cells[12]
                if not re.search(r"\b(?:HIGH|MEDIUM|LOW)\b", confidence, flags=re.IGNORECASE):
                    malformed_score_rows.append(row)
            else:
                malformed_score_rows.append(row)

    if malformed_score_rows:
        raise RuntimeError(
            "One or more Failure Analysis rows are missing numeric Severity/Occurrence/Detection values, "
            "RPN values, or confidence levels (HIGH/MEDIUM/LOW). "
            "Each S/O/D score must include a confidence level either in the score cell or in the Confidence column."
        )

    return report.rstrip() + "\n"


def write_report(report: str) -> None:
    """Write the validated report to fmea-report.md."""
    REPORT_TMP_FILE.write_text(report, encoding="utf-8")
    REPORT_TMP_FILE.replace(REPORT_FILE)


def build_prompts(system_description: str) -> list[tuple[str, str, str]]:
    return [
        (
            "[1/4] Decomposing system...",
            "system decomposition",
            f"""
STEP 1 — SYSTEM DECOMPOSITION

Engineering system description:
{system_description}

Understand the purpose of the system. Identify:
- system purpose
- major components
- function of each component
- interfaces between components
- dependencies between components
- important inputs and outputs
- missing information

Avoid inventing specific hardware specifications that were not provided. If voltage, current,
operating environment, component model, load, sensor range, software logic, or other engineering
information is not provided, explicitly mark it as unknown.

Create an Information Gaps subsection. Explain how missing information affects confidence in
the later FMEA analysis.

Return a structured decomposition with headings and concise engineering detail.
""".strip(),
        ),
        (
            "[2/4] Identifying failure modes and propagation paths...",
            "failure analysis",
            """
STEP 2 — FAILURE ANALYSIS

Continue from the same thread context. Identify concrete failure modes for the important
components/functions. For each failure mode you identify, explicitly separate:
1. CAUSE — Why the failure can occur (e.g., faulty transducer, software bug, electrical noise, design flaw)
2. FAILURE MODE — What fails and how (not a cause, but the observable/measurable failure: e.g., "sensor
   continuously outputs maximum value," "motor remains energized," "voltage drops below threshold")
3. IMMEDIATE EFFECT — Direct consequence within the component or immediate interface (e.g., "controller
   receives invalid distance," "motor driver dissipates excessive heat")
4. DOWNSTREAM EFFECT — Effect on the next component or system function (e.g., "controller makes wrong
   decision," "motor overheats," "unbalanced motion")
5. SYSTEM EFFECT — Final impact on the overall system behavior (e.g., "robot collides," "system resets,"
   "navigation fails")

FAILURE MODE SPECIFICITY — Non-Negotiable:
Do NOT use generic labels as failure modes:
  ✗ "Sensor fails"
  ✗ "Motor stops"
  ✗ "Battery dies"
  ✗ "Software breaks"
  ✗ "Communication error"
Instead, be specific about WHAT happens:
  ✓ "Ultrasonic sensor continuously returns the maximum distance value (indicating no obstacle detected)"
  ✓ "One DC motor coil draws excessive current and stalls despite applied voltage"
  ✓ "Battery voltage sags to near the Arduino brownout threshold, causing watchdog reset"
  ✓ "Arduino application crashes due to invalid pointer dereference from malformed sensor data"
  ✓ "Ultrasonic sensor trigger/echo communication intermittently fails because of loose wiring or an invalid echo response"

PROPAGATION AND DEPENDENCIES:
Use arrows to show how failures propagate through system interfaces:
SENSOR → (returns an invalid distance reading) → CONTROLLER → (sends an incorrect command) → MOTOR DRIVER →
(drives the motor incorrectly) → MOTOR → (unintended movement) → SYSTEM CONSEQUENCE (collision).

For the Arduino robot system:
- Battery voltage affects the Arduino brownout detector and L298N quiescent voltage.
- Sensor electrical noise affects data interpretation in the controller.
- Controller logic failures affect motor driver command timing.
- Motor driver thermal stress affects motor current capacity.
- Motor stalls affect navigation accuracy.
- Each interface is a point of failure propagation.

Only include technically plausible chains grounded in the system architecture;
do not invent chains just to increase the count.
""".strip(),
        ),
        (
            "[3/4] Assessing and prioritizing risk...",
            "risk assessment",
            f"""
STEP 3 — RISK ASSESSMENT AND PRIORITIZATION

Continue from the same thread context. For each important failure mode, estimate:
- Severity: 1–10 — Impact if the failure occurs (NOT probability of occurrence)
- Occurrence: 1–10 — Likelihood in typical operation (based on plausibility, not measured data)
- Detection: 1–10 — Ease of identifying the failure before it causes harm
- RPN = Severity × Occurrence × Detection

SCORING GUIDANCE:
Severity (1–10):
  1–3: Minimal or no impact on function; easily worked around.
  4–6: Moderate impact; system continues with reduced capability or temporary loss of function.
  7–8: Major impact; collision risk, hardware damage, or significant safety concern.
  9–10: Critical; immediate hazard to users, catastrophic system failure, or system destruction.

Occurrence (1–10):
  1–2: Very unlikely given typical operating conditions; requires multiple failures or rare events.
  3–4: Unlikely; possible but unlikely under normal use.
  5–6: Moderate likelihood; plausible under normal or mildly adverse conditions.
  7–8: Likely; probable under normal conditions or common environmental stressors.
  9–10: Very likely; expected to occur regularly in typical operation.
  NOTE: Occurrence is plausibility/likelihood, NOT a measured percentage. Do not write "5 = 50%".
        It is an estimate based on the system design, environment, and available information.

Detection (1–10):
  1–2: Obvious failure; detectable immediately by simple observation or known diagnostic.
  3–4: Moderately detectable; requires basic monitoring or test.
  5–6: Challenging to detect; requires targeted monitoring, logging, or analysis.
  7–8: Very difficult to detect; needs detailed instrumentation or expert analysis.
  9–10: Nearly impossible to detect without specialized equipment or deep system knowledge.

CONFIDENCE LEVELS (HIGH, MEDIUM, LOW):
  HIGH: Full component specs, operating environment, design margins, and software logic available.
        Confidence in the score reflects comprehensive technical understanding.
  MEDIUM: Partial information available; some key specs missing (e.g., battery voltage known,
          but no thermal rating for motor driver). Scores are reasonable but subject to change.
  LOW: Fundamental information missing (e.g., no battery voltage, no sensor model, no software
       design). Scores are educated guesses; actual risk may differ significantly.

REQUIRED FORMAT FOR EACH SCORE:
For every Severity, Occurrence, and Detection score in the Failure Analysis table:
  1. State the numeric score (1–10).
  2. Provide a clear rationale using a hyphen (e.g., "8 - collision or hardware damage possible").
  3. State confidence level explicitly as (HIGH confidence), (MEDIUM confidence), or (LOW confidence).
  4. Example: "8 - collision or hardware damage possible (HIGH confidence)"
  5. Alternative compact format if space tight: "8 (HIGH confidence)" or "5 - plausible (MEDIUM confidence)"
  6. CRITICAL: confidence level MUST appear in the S/O/D cell itself, not only in the Confidence column.

HANDLING MISSING INFORMATION:
When battery voltage is unknown, write: "Occurrence: 5 — Plausible if voltage sags during high load;
confidence MEDIUM since battery ratings are unknown."
When sensor model/range is unknown: "Detection: 6 — Challenging to detect without sensor validation
code; confidence LOW because sensor specifications are missing."

Sort/prioritize the failure modes from highest to lowest RPN.

For controls, write "Not specified" when the original system description did not identify an
existing detection/control method. Do not invent already-existing controls.

State explicitly: {SCORE_DISCLAIMER}

Do not manufacture precise statistics or claim a failure occurs a particular percentage of the
time unless that information was provided. Do not write "75% of the time" or "typically fails after
500 hours" unless you have actual data.
""".strip(),
        ),
        (
            "[4/4] Generating engineering report...",
            "mitigation and report",
            f"""
STEP 4 — MITIGATION AND REPORT

Continue from the same thread context. For the highest-priority failure modes (roughly the top 5–6),
generate concrete mitigations with verification tests.

MITIGATION STRUCTURE:
For each mitigation, provide all five of these elements clearly:

1. FAILURE MODE ADDRESSED — Explicitly reference the specific failure mode from Section 5 using
   its exact component and failure description (e.g., "Ultrasonic Sensor - Max value output").

2. MITIGATION — Provide detailed, hardware-and-software-specific description of the proposed
   change. Include:
   - Exact code modifications (e.g., "add a range-check loop in the main sensor-reading function")
   - Hardware additions (e.g., "add a 555 timer watchdog circuit" or "add a voltage divider resistor pair")
   - Thresholds with units (e.g., "reject readings outside 2–400 cm range")
   - Timeouts with units (e.g., "motor disable after 500 ms inactivity")
   - Pin assignments (e.g., "Arduino pin D8 to L298N enable pin")

3. WHY IT HELPS — Explain how the mitigation reduces Severity, Occurrence, or Detection:
   - Does it reduce severity? How? (e.g., "motor cannot stall because enable pin is controlled")
   - Does it reduce occurrence? How? (e.g., "bad data is detected early, reducing false commands")
   - Does it improve detection? How? (e.g., "user sees visual/serial warning before system fails")

4. CONTROL ADDED/IMPROVED — State the new or improved detection/protection mechanism introduced:
   - Software control (e.g., "data validation loop and motor disable logic in firmware")
   - Hardware control (e.g., "watchdog timer and relay disconnecting motor power")
   - Procedural control (e.g., "weekly wiring inspection checklist")

5. UNCERTAINTY/VALIDATION NEEDED — Clearly state what information or testing is required:
   - Missing specs (e.g., "sensor response time unknown; requires vendor datasheet")
   - Proposed thresholds (e.g., "proposed timeout of 500 ms requires calibration on actual hardware")
   - Testing required (e.g., "thermal testing of motor driver under sustained full power")
   - Validation methodology (e.g., "requires bench testing with current-limited supply")

MITIGATION CONCRETENESS — Non-Negotiable:
✗ "Improve monitoring" — Too vague.
✗ "Better error handling" — No actionable detail.
✗ "Add diagnostics" — Unclear what is monitored.
✗ "Secure wiring and connectors" — No specific procedure.
✗ "Add error handling" — Leaves implementation unspecified.

✓ "Add sensor data range validation in the Arduino code: Before processing any distance reading,
  check if the value is within the documented sensor range (typically 2 cm to 400 cm). If a
  reading falls outside this range, increment an invalid-reading counter. After three
  consecutive out-of-range readings, set the motor enable pins to LOW to stop all motor power.
  Reset the counter when a valid reading is received. Label the timeout value (e.g., 500 ms
  check interval) as a proposed starting point requiring calibration based on actual sensor
  response time."

✓ "Add a hardware watchdog timer circuit using a 555 timer or similar component. Configure it
  to reset the Arduino if it does not receive a 'heartbeat' pulse within 1.5 seconds. If a
  watchdog reset occurs, use a GPIO output (e.g., Arduino pin D8) to toggle a relay that
  places the L298N motor driver in a disabled state. This ensures that if the Arduino firmware
  hangs, motors will stop within ~100 ms. Test the watchdog reset time empirically on the
  actual hardware. Label 1.5 seconds as a proposed starting point requiring site-specific
  validation."

✓ "Implement a voltage monitoring circuit that reads the battery voltage via an Arduino analog
  input. Use a resistive voltage divider to scale the battery voltage to the Arduino's 5V ADC
  range. Code a check that monitors battery voltage every 100 ms (proposed interval). When
  voltage drops below 4.5V (proposed threshold), the Arduino should disable motor power by
  setting the enable pins LOW and flash an LED or send a serial message to indicate low battery.
  Requires measurement of the actual battery voltage-sag profile under typical load. The
  thresholds (4.5V, 100 ms) are proposed starting points requiring validation through testing
  under expected operating conditions."

THRESHOLDS AND STARTING POINTS:
If you propose a specific count, timeout, or voltage:
  - Mark it as "proposed starting point requiring engineering validation."
  - Do NOT present it as an established rule.
  - Example: "Proposed timeout of 500 ms after last valid reading; requires calibration based
    on actual sensor response time and environmental conditions."

VERIFICATION TEST STRUCTURE — REQUIRED FOR EVERY MITIGATION:
Every verification test must include exactly these five subsections with substantial detail:

### Test Name
[Use a descriptive title that references the failure mode being tested.]

Test Objective:
[One to three sentences. What are you verifying? For example: "Verify that the Arduino
application does not crash when the ultrasonic sensor returns invalid data. Ensure that the
motor control system remains stable even when receiving malformed sensor input from three
consecutive invalid readings."]

Setup:
[Two to four sentences. Describe the physical and software conditions needed for the test.
For example: "Raise the robot on a test stand so wheels spin freely above the floor. Connect
a USB serial port to the Arduino for data injection. Set up a logic analyzer or multimeter to
monitor motor control pin voltages. Use a current-limited bench power supply set to 80% of
expected nominal current draw. Have a PC with Arduino IDE or serial monitor ready."]

Procedure:
[Four to six numbered steps. Detail exactly what you will do, how you will induce the fault,
and what you will observe. For example:
"1. Power on the robot using the test stand configuration described above.
2. Monitor Arduino voltage and motor control pins using the logic analyzer.
3. Open a serial terminal connected to the Arduino USB port.
4. Send three consecutive out-of-range distance values (e.g., 0 cm or 500 cm) to the Arduino.
5. Observe motor control pin voltage levels and any Arduino reset behavior.
6. Log the time elapsed from first invalid reading to motor stop command.
7. Record any serial output from the Arduino application."]

Expected Safe Behavior:
[Two to three sentences. Describe what you expect to observe if the mitigation works correctly.
Use objective, measurable language. For example: "The motors should stop power delivery within
500 ms of detecting the third consecutive invalid reading. Arduino supply voltage should remain
above the brownout threshold (typically 4.5V) throughout the test. No watchdog reset should
occur, confirmed by continuous operation of the control application without restarting."]

Pass Criterion:
[One to two sentences. Provide an objective, verifiable criterion for success. For example:
"Motor PWM signal must transition from active (>50% duty) to inactive (0% duty) within 500 ms
of the third invalid reading. Arduino does not reset (confirmed by timestamp of serial log
remaining continuous). Voltage never drops below 4.5V on the Arduino supply rail."]

SAFE TESTING — Non-Negotiable:
✓ ALLOWED:
  - Simulated sensor failures (inject invalid data via Arduino serial port or function generator)
  - Safe sensor disconnection (unplug sensor connector on powered system)
  - Test stand operation (robot raised so wheels spin freely, no floor contact)
  - Current-limited bench power supplies (set limit below component ratings)
  - Software testing (unit tests, isolated function testing)
  - Encoder simulation (manually rotate motors to test position feedback)
  - Data logging and analysis (capture and review actual failure behavior)

✗ FORBIDDEN (Never recommend these):
  - Intentional short circuits
  - Uncontrolled battery abuse or overdischarge
  - Forced motor stalls (do not block wheels and apply power)
  - Intentional overheating of electronics
  - Destructive faults (removing components, cutting traces)
  - Uncontrolled high-power transients
  - Tests that risk permanent component damage

CLAIMING TESTS:
NEVER write "Test performed showed..." or "Measurements confirm..." unless the test was actually
conducted and you have results. Instead, write:
  "Test Procedure: [steps]"
  "Expected Safe Behavior: [what should happen if mitigation works]"
  "Pass Criterion: [how to verify success]"

CONFIDENCE IN MITIGATIONS:
If a mitigation requires missing information (e.g., sensor response time, motor current ratings),
state it clearly. Example: "Assumes motor driver thermal rating of [unknown]; actual safe load
requires datasheets and thermal modeling."

Now generate the final Markdown report only. Do not wrap it in code fences and do not include
any text before or after the report.

CRITICAL: The report must use these EXACT 12 section headings (use single hyphen in all headings, NOT em dashes):

# FMEA Engineer - Failure Analysis Report

## 1. System Overview

## 2. System Components and Functions

## 3. Interfaces and Dependencies

## 4. Assumptions and Information Gaps

## 5. Failure Analysis

## 6. Failure Propagation Analysis

## 7. Risk Assessment Method

## 8. Risk Prioritization

## 9. Recommended Mitigations

## 10. Verification Tests

## 11. Engineering Limitations

## 12. Conclusion

SECTION CONTENT REQUIREMENTS:

### 1. System Overview

List each major component and its function. Include known inputs and outputs where relevant.

### 3. Interfaces and Dependencies

Describe key interfaces and dependencies, such as sensor-to-controller data, controller-to-driver
commands, driver-to-motor power, battery-to-electronics power, and mechanical load dependencies.

### 4. Assumptions and Information Gaps

Use separate subsections or bullet lists for:
- Known information
- Assumptions
- Unknown information
- Information needed for higher-confidence analysis

Include an explicit "Information Gaps" list. For missing items such as battery voltage, motor
current, operating environment, sensor model/range, load, software logic, wiring protection, or
existing diagnostics, mark them unknown if not provided. Explain how missing information reduces
confidence.

### 5. Failure Analysis

Include a clear Markdown table containing these columns:
Component/Function | Failure Mode | Cause | Immediate Effect | Downstream Effect | Existing Control | Severity | Occurrence | Detection | RPN | Score Rationales | Confidence

TABLE FORMATTING CRITICAL REQUIREMENTS:

The table must use standard Markdown format with pipes (|) as column separators.
Each row must have exactly 12 columns (11 pipes).
Example header:
| Component/Function | Failure Mode | Cause | Immediate Effect | Downstream Effect | Existing Control | Severity | Occurrence | Detection | RPN | Score Rationales | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|

In the Severity column, include: numeric score (1-10), hyphen, short rationale, then confidence in parentheses.
Example: "8 - collision or hardware damage possible (HIGH confidence)"
Same format for Occurrence and Detection columns.

Alternatively, if space is tight, you may include numeric score and confidence level:
Example: "8 (HIGH)" or "5 - likely if voltage sags (MEDIUM)"

Important: Each S/O/D score MUST include the confidence level (HIGH, MEDIUM, or LOW) right in that cell.

In Existing Control, write "Not specified" unless the user's description or earlier analysis explicitly identified one.
In Score Rationales, briefly explain all three scores and any key uncertainty.

Include at least six meaningful, system-specific failure modes, not just one or two. Avoid generic phrases such as
"Incorrect Processing," "Mechanical Wear," "Insufficient Power," or "Signal Interruption" as the
full failure mode. For this robot, consider plausible modes across sensor data validity, sensor wiring,
controller logic/hang, motor-driver output behavior, motor stall/uneven motion, and battery undervoltage
where technically justified.

Do not confuse cause with failure mode. The Cause column should explain why the failure can happen;
the Failure Mode column should explain how the component/function fails.

## 6. Failure Propagation Analysis

Show important cascading failure chains using arrows. Use this structure where useful:
COMPONENT → FAILURE → INTERFACE / DEPENDENCY → NEXT COMPONENT → SYSTEM CONSEQUENCE.
Only include technically plausible chains. Example chains for the robot:
  - SENSOR → Constant max output → (invalid data) → CONTROLLER → Wrong motion decision → MOTOR DRIVER → Collision
  - BATTERY → Voltage sag → (Arduino reset) → CONTROLLER → Loss of logic state → NAVIGATION → Uncontrolled motion
  - MOTOR DRIVER → Output held enabled → (continuous motor power) → MOTOR → Continuous rotation → Collision/damage

## 7. Risk Assessment Method

Explain what Severity means, what Occurrence means, what Detection means, how RPN is calculated,
how uncertainty and confidence are handled, and that AI estimate ≠ measured reliability. Include
that real reliability decisions require measurements, testing, or historical failure data. Distinguish
between confidence (completeness of information) and probability (likelihood of the failure mode).

## 8. Risk Prioritization

Clearly identify the highest-priority failure modes (typically those with highest RPN) and explain
why they were prioritized. Note any qualitative factors beyond RPN that affect priority.

## 9. Recommended Mitigations

Connect each mitigation directly to a specific failure mode from Section 5.
Provide concrete mitigations for the highest-priority failure modes. Include at least five mitigation
entries. Use this structure for each:

- **Failure Mode Addressed**: [Reference the specific failure mode from Section 5.]
- **Mitigation**: [Concrete, actionable change.]
- **Why It Helps**: [How it reduces severity, occurrence, or improves detection.]
- **Control Added or Improved**: [What new mechanism is introduced.]
- **Uncertainty / Validation Needed**: [What information or testing is required.]

Examples for the Arduino robot:
  - Failure Mode: Ultrasonic sensor returns constant maximum distance.
    Mitigation: Implement sensor data range checking in the Arduino code.
    Why: Rejects out-of-range readings before they influence motor commands.
    Control Added: Software validation routine in obstacle detection logic.
    Uncertainty: Sensor range specification is unknown; requires vendor datasheets and empirical calibration.

  - Failure Mode: Motor driver output remains enabled after stop command.
    "Mitigation: Use a watchdog timer to recover the controller from firmware hangs, combined with an appropriate motor-disable mechanism that places the motor driver in a safe state when a controller fault is detected."
    Why: Limits duration of uncontrolled motor energization if firmware hangs.
    Control Added: Hardware watchdog on motor control lines.
    Uncertainty: Watchdog timeout value requires testing under actual firmware timing; 100 ms is a proposed starting point.

## 10. Verification Tests

Give practical tests an engineer could actually perform to verify the proposed mitigations.
Do not claim that any test has already been performed. Do not summarize by referring back to
Section 7. Instead, list at least five explicit tests with setup/input condition, procedure,
pass criterion, and expected safe behavior. Include a practical verification test for each
mitigation listed in Section 9.

Use this structure for every test:
### Test Name
Test Objective:
Setup:
Procedure:
Expected Safe Behavior:
Pass Criterion:

Tests must be safe: no intentional short circuits, uncontrolled battery abuse, destructive faults,
unsafe electrical faults, intentionally overheating electronics, or damaging components. Use a
raised test stand for motor tests and current-limited bench supplies where electrical conditions
need to be varied. Prefer simulation, safe fault injection, controlled sensor disconnection, and
software testing over physical hardware stress.

Examples of SAFE tests:
  - "Setup: Use a USB serial port to inject test data to the Arduino. Disconnect the actual sensor.
    Procedure: Send a series of out-of-range distance values and observe motor behavior. Expected
    Behavior: Motors stop after the third invalid value. Pass Criterion: PWM output is 0% within
    [measured time], confirmed via oscilloscope or digital logic analyzer."

  - "Setup: Raise the robot on a test stand so wheels spin freely. Use a multimeter to monitor
    Arduino supply voltage. Connect a programmable power supply set to current limit at 80% of
    expected nominal draw. Procedure: Gradually increase the load on the motors by increasing the
    PWM duty cycle while monitoring voltage. Expected Behavior: Arduino supply voltage remains
    above brownout threshold. No watchdog reset. Procedure stops if voltage approaches critical
    threshold. Pass Criterion: No Arduino restart occurs, confirmed by observing a marker GPIO pin
    or serial log."

## 11. Engineering Limitations

Explicitly include this exact statement:
{SCORE_DISCLAIMER}

Also explain that AI estimate ≠ measured reliability and that the analysis requires engineering
review, measurements, testing, or historical failure data before real reliability decisions.
Note any specific assumptions made due to missing information, and how those assumptions affect
the accuracy and applicability of the analysis.

## 12. Conclusion

Provide a concise summary of the most important risks and the recommended next engineering steps.
Reinforce that AI-estimated scores are starting points and must be validated by measurements,
testing, or historical field data.
""".strip(),
        ),
    ]


def build_correction_prompt(
    validation_error: Exception,
    current_report: str,
) -> str:
    return f"""
QUALITY CONTROL CORRECTION

The draft final report failed automated quality control:

{validation_error}

CURRENT DRAFT REPORT:
{current_report}

You must correct THIS report and return the COMPLETE regenerated report.

CRITICAL: Return the ENTIRE report from # FMEA Engineer - Failure Analysis Report
through ## 12. Conclusion. Do NOT omit sections. Do NOT return partial content.

The report MUST start with:

# FMEA Engineer - Failure Analysis Report

and MUST contain all 12 sections with these EXACT headings (use single hyphen, not em dash):

# FMEA Engineer - Failure Analysis Report
## 1. System Overview
## 2. System Components and Functions
## 3. Interfaces and Dependencies
## 4. Assumptions and Information Gaps
## 5. Failure Analysis
## 6. Failure Propagation Analysis
## 7. Risk Assessment Method
## 8. Risk Prioritization
## 9. Recommended Mitigations
## 10. Verification Tests
## 11. Engineering Limitations
## 12. Conclusion

CRITICAL REQUIREMENTS FOR THE CORRECTED REPORT:

1. Use these EXACT 12 section headings (copy them verbatim above).

2. Do NOT use em dashes (—) or other dash variants. Use hyphen only: -

3. The Failure Analysis table MUST have these columns exactly:

2. The Failure Analysis table MUST have these column names exactly:

   Component/Function | Failure Mode | Cause | Immediate Effect | Downstream Effect | Existing Control | Severity | Occurrence | Detection | RPN | Score Rationales | Confidence

3. Include at least six specific, system-relevant failure modes.
   Do NOT use generic phrases such as:
   "software breaks"
   "communication error"
   "sensor fails"

   Failure modes must describe what actually happens in the specific
   engineering system.

4. Every Severity, Occurrence, and Detection score must contain:

   - numeric score
   - rationale
   - confidence level: HIGH, MEDIUM, or LOW

5. Example of the required level of specificity:

   "Ultrasonic sensor continuously outputs maximum distance value;
   Cause: faulty transducer or sensor malfunction;
   Immediate Effect: controller receives invalid distance;
   Downstream Effect: wrong motion decision and collision risk;
   Severity: 8 — collision or hardware damage possible (HIGH confidence);
   Occurrence: 5 — plausible if sensor fails (MEDIUM confidence);
   Detection: 6 — requires data validation checks (MEDIUM confidence)."

6. The Information Gaps section must explicitly identify unknown
   engineering information, including where applicable:

   - battery voltage
   - sensor model and range
   - software/control logic
   - thermal ratings
   - motor specifications
   - motor driver specifications
   - environmental conditions

   Do not invent missing specifications.

7. Mitigations must be concrete and directly mapped to specific failure
   modes.

   Avoid vague recommendations such as:

   "Improve monitoring."
   "Add diagnostics."
   "Improve error handling."

   Instead provide an actionable engineering measure.

   Example:

   "For 'sensor returns constant maximum value':
   Implement sensor range validation in Arduino code. Reject readings
   outside the documented sensor range. Stop motors if three consecutive
   invalid readings are detected. The threshold requires calibration."

8. Every mitigation must have a verification test containing:

   - Objective
   - Setup
   - Procedure
   - Expected Safe Behavior
   - Pass Criterion

9. Verification tests MUST be SAFE.

   Allowed:
   - simulation
   - invalid-data injection via serial port
   - safe sensor disconnection
   - software testing
   - logging and analysis
   - test stands
   - current-limited bench supplies

   Forbidden:
   - intentional short circuits
   - battery abuse
   - forced motor stalls
   - destructive faults
   - intentional overheating
   - deliberately damaging components

10. Do NOT claim that any test was physically performed.

   Use language such as:

   "Test Procedure: ..."
   "Expected Safe Behavior: ..."
   "Pass Criterion: ..."

   Do NOT write:

   "Testing showed..."
   "The test confirmed..."
   "The robot successfully passed..."

   unless actual test results were explicitly provided.

11. If thresholds are proposed, clearly label them as proposed starting
   points requiring engineering validation.

   For example:

   "100 ms is a proposed starting point requiring engineering validation."

   Never present an invented threshold as an established engineering rule.

12. Do NOT make unsupported quantitative claims such as:

   - 95% detection rate
   - failure after 500 hours
   - guaranteed reliability
   - measured probability of failure

   unless such data was explicitly provided.

13. Include the exact engineering limitation statement:

   "{SCORE_DISCLAIMER}"

14. Preserve the distinction between:

   - known information
   - assumptions
   - AI-estimated values
   - unknown information
   - values requiring real engineering validation

15. Failure propagation must be system-level where applicable.

   Show relationships such as:

   SENSOR
   → invalid data
   → CONTROLLER
   → incorrect command
   → MOTOR DRIVER
   → MOTOR
   → physical consequence

   Do not analyze every component as an isolated independent object.

16. Mitigations must address the actual failure mechanism.

   Avoid generic recommendations that could apply to any project.

17. The final report must be complete and self-contained.

18. Do not use Markdown code fences around the report.

19. Do not include any commentary before or after the report.

FINAL INSTRUCTION:

Regenerate the COMPLETE final Markdown report only.

Start with:

# FMEA Engineer - Failure Analysis Report

(Use hyphen only, not em dash or other symbols)

End with the final report content from ## 12. Conclusion.

Do not return a patch, summary, explanation, or partial report.

Regenerate the complete final Markdown report only. Do not wrap it in code fences and do not include
any text before or after the report.
""".strip()

def print_completion_output(report: str) -> None:
    report_path = REPORT_FILE.resolve()
    print("\nReport generated successfully.", flush=True)
    print(f"File exists: {REPORT_FILE.exists()}", flush=True)
    print(f"Report path: {report_path}", flush=True)
    print("\n===== fmea-report.md =====\n", flush=True)
    print(report, flush=True)
    print("===== end report =====\n", flush=True)
    print(
        "Summary: The workflow produced a system-specific AI-assisted FMEA report with "
        "decomposition, concrete failure modes, transparent S/O/D/RPN estimates, mitigations, "
        "and verification tests. The report clearly labels scores as AI-estimated starting "
        "points that require engineering review and validation.",
        flush=True,
    )
    print("\nRun with another system:", flush=True)
    print('python fmea_engineer.py "<describe another engineering system here>"', flush=True)


async def run_workflow(system_description: str) -> int:
    api_key = os.getenv("BACKBOARD_API_KEY")
    if not api_key:
        print("ERROR: BACKBOARD_API_KEY is not set. Set it in the environment and run again.", flush=True)
        return 1

    client = BackboardClient(api_key=api_key, timeout=120)
    try:
        assistant_id = await get_or_create_assistant(client)
        thread = await retry_once("creating shared thread", lambda: client.create_thread(assistant_id))
        thread_id = get_model_id(thread, "thread_id")
        print(f"Using one shared Backboard thread for all stages: {thread_id}", flush=True)

        stage_outputs: list[str] = []
        for progress, label, prompt in build_prompts(system_description):
            print(progress, flush=True)
            stage_outputs.append(await ask_stage(client, thread_id, label, prompt))

        report_candidate = stage_outputs[-1]
        for correction_attempt in range(3):
            try:
                final_report = ensure_report_requirements(report_candidate)
                break
            except RuntimeError as validation_error:
                if correction_attempt == 2:
                    raise
                print("Report quality check requested one correction pass...", flush=True)
                report_candidate = await ask_stage(
                    client,
                    thread_id,
                    "report quality correction",
                    build_correction_prompt(validation_error, report_candidate),
                )
        write_report(final_report)
        print_completion_output(final_report)
        return 0
    except Exception as error:
        if REPORT_TMP_FILE.exists():
            REPORT_TMP_FILE.unlink()
        print(f"ERROR: FMEA workflow failed cleanly: {error}", flush=True)
        return 1
    finally:
        await client.aclose()


def main() -> int:
    if len(sys.argv) < 2 or not " ".join(sys.argv[1:]).strip():
        print(usage())
        return 2

    system_description = " ".join(sys.argv[1:]).strip()
    return asyncio.run(run_workflow(system_description))


if __name__ == "__main__":
    raise SystemExit(main())