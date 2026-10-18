# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially pulling one coin off a stack. Testing used scripted pointer events at 1024×768 and 375×812.
- On phones, dimes and pennies are about 25px across; usable with a mouse, small for a finger.

Notes:
- Files changed: apps/money/index.html (new app). No existing app was modified.
- Behavior: A free money mat for counting, making amounts and making change (Grade 4 Lessons 10, 25, 26, 28).
  - A brushed-metal cash drawer has two rows of compartments: bills ($20, $10, $5, $1) above coins (25¢, 10¢, 5¢, 1¢). Tap a compartment to set a piece on the mat (it lands on a matching stack if one is there), or drag a piece out.
  - Coins are copper and silver discs at true relative sizes (dime < penny < nickel < quarter), with engraved values; dimes and quarters have reeded edges. Bills are generic play money (paper, border, "$5" seal and corner numerals, no portraits).
  - Like pieces dropped together fan into a stack. Grabbing the top piece pulls it off; grabbing anywhere else moves the stack. Dropping a piece or stack on the drawer puts it away. ↺ clears the mat.
  - Double-tap (or Enter/Space) trades:
    - A single piece breaks into change: $20 → 2 tens, $10 → 2 fives, $5 → 5 ones, $1 → 4 quarters, 25¢ → 2 dimes + 1 nickel, 10¢ → 2 nickels, 5¢ → 5 pennies.
    - A stack worth exactly one bigger piece becomes it: 5 pennies → nickel, 10 dimes or 4 quarters → $1, 5 ones → $5, 2 tens → $20.
    - Anything else (a penny, 2 dimes) shakes.
  - The eye button shows an optional total, written as dollars and cents: "$4.22". Off by default.
- Doctrine principles applied:
  - Values printed on coins and bills are part of the object, as on real money; there are no directions.
  - Trades are the student's deliberate move, matching the base-ten mat.
  - No answer checking. The record is optional and follows the object.
- Desktop behavior (1024×768): $4.22 built from the drawer. 4 quarters → $1 and $1 → 4 quarters keep the total. A quarter pulled off its stack breaks into 2 dimes + a nickel. 2 dimes refuse. 10 dimes stacked → $1. $20 → 2 tens. Putting pennies away drops the total to $4.20. No console errors.
- Mobile behavior (375×812): The drawer fits with no horizontal scroll. Bills are 80px wide, coins 25–34px.
- Accessibility notes: Compartments are buttons; Enter adds a piece. Stacks are focusable: arrow keys move them (Shift moves farther), Enter or Space trades, Delete puts away. A polite live region lists the pieces, plus the total only while the record is shown.
- Remaining risks:
  - No half-dollar or dollar coin, so a stack of 2 quarters (50¢) cannot trade up.
  - Stacks cap at 25 pennies, 20 nickels/dimes/ones, 12 quarters and 10 larger bills; extras sit beside the stack.

Acceptance Tests:
- Tapping a compartment sets that piece on the mat; repeated taps stack. PASS
- The top piece pulls off a stack. PASS
- A single piece breaks into change; the total is unchanged. PASS
- A stack worth exactly one bigger piece trades up; otherwise it shakes. PASS
- A piece or stack dropped on the drawer is put away. PASS
- The record shows the total in dollars and cents. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS
