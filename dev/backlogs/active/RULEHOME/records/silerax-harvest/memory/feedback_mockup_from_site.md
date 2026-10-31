---
name: feedback-mockup-from-site
description: "A mockup element that already exists on the site is taken 1:1 from the site's code (the component), not from memory, documents or another mockup"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1db88e38-265c-444b-a48a-0ed637defb75
  modified: 2026-10-26T06:41:43.045Z
---

When I draw an element in a mockup (metrics, tabs, cards, tables, buttons, dialogs) that ALREADY exists on the site - I first open the component in `silerax/src/components/**` or the page of a finished module and carry the measures over 1:1 (spacing, padding, lines, fonts, colours). The documents (register, CANON) and the other mockups - only for what the site does not have yet. Before showing a mockup - a check against the site and the register, not after an operator note.

**Why:** 2026-10-14, the transfers mockup: the metrics were wrong three times (by eye -> tiles from 07 -> Р12 without the spacing), while `components/common/metrics-bar.tsx` was ready. The operator: „казвам нарисувай крушата на масата, ти ми рисуваш ябълката от хладилника — скандално" (I say draw the pear on the table, you draw me the apple from the fridge - scandalous); it wastes time, resources and money.

**Where the mockup proposes something new**, it may change the code; that is decided with the operator during the mockup work
(operator 2026-10-26: „идеята е мокъпите да отговарят на кода, но когато има нови предложения то те търпят промяна в кода, тези неща
се решават по време на мокъпите").

**How to apply:** every new mockup/correction - for every element: does the site have it? -> the code is the source. Related: [[feedback-surgical-edits]], [[feedback-scope-question-early]].
