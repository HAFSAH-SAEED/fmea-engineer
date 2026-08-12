import sys

sys.stdout = open("internal_run_output.txt", "w", encoding="utf-8")
sys.stderr = sys.stdout

import fmea_engineer

sys.argv = [
    "fmea_engineer.py",
    "An Arduino-based autonomous robot using an ultrasonic distance sensor, Arduino controller, L298N motor driver, DC motors, and a battery. The robot uses the sensor to detect obstacles and the controller decides how the motors should move.",
]

try:
    code = fmea_engineer.main()
    print(f"\nEXIT_CODE={code}", flush=True)
finally:
    sys.stdout.close()
