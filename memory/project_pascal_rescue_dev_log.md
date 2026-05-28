## Project Overview
- **Game Name:** The Rescue of Pascal Building
- **Target Audience:** Year 7 Students (The Marlborough Science Academy)
- **Objective:** Rescue math teachers from the "Maths Demon" by solving topic-specific puzzles aligned with the school's core values.

## Current Status (2026-05-28)

### Completed Tasks:
1.  **Major Game Architecture Overhaul**:
    - Reverted to a **Floor-based progression system** as per Alex's request.
    - Successfully mapped the 5 MSA School Values (**Dignity, Kindness, Compassion, Courage, Endeavour**) to Floors 1-5.
    - Implemented linear unlocking: Completing a floor's boss unlocks the next floor.
2.  **UI/UX & Accessibility Fixes**:
    - **Scrollbar Implementation**: Fixed the issue where the 1st Floor was unreachable due to container overflow. Added `overflow-y: auto` to the map screen.
    - **Rendering Fix**: Resolved the bug where question text was not appearing on the battle screen.
3.  **Curriculum-Aligned Content Expansion**:
    - **Floor 1 (Number Room)**: Fully implemented Rooms 101, 102, 103 covering Multiples, Negatives, and Fractions.
    - **Floor 2 (Algebra Room)**: Implemented Rooms 201 and 202 covering Expressions and Equations.
    - **HQ Final Battle**: Prepared the logic for the ultimate challenge to rescue the **Head of Math**.
4.  **Value Badge System**:
    - Integrated the 5 Core Value badges into the UI with glowing "Earned" effects in the badge tray.
5.  **Multilingual cleanup**:
    - Removed all Chinese text from the UI and logic to fit the UK secondary school environment.
6.  **Safety Protocol**:
    - Established and followed the **"CRITICAL RULE: AUTOMATIC BACKUPS"** by committing to Git before every major file modification.

### Technical Details:
- **Location:** `C:/Users/Lam/Desktop/SzeMan/Game/PascalRescue/`
- **Updated Files:** `index.html`, `script.js`, `style.css`.
- **New Logic:** Implemented a two-stage room clearing process: 3-4 "Minion" questions followed by a 1 "Teacher Rescue" challenge per classroom.

## Next Steps:
1.  **Fill Floor 3 & 4 Content**: Populate the Ratio & Shape (3F) and Data (4F) rooms with curriculum-specific questions.
2.  **Sound & Visual Polish**: Add feedback sound effects and improve the battle animations.
3.  **Deployment**: Prepare for GitHub Pages hosting once the full curriculum content is confirmed.
