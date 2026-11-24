# Oman Petroleum — Warehouse Management (prototype)

Client brief: *"Ready warehouse management software for a petroleum firm in Oman."*

A warehouse does three things, so the app has three steps:

1. **Receive**: goods arrive from a supplier, someone ticks the inspection checks, and the goods go on a shelf. Stock goes **up**.
2. **Stock**: what is in the warehouse, where it is, and what is below its minimum level.
3. **Dispatch to rigs**: an oil rig asks for items, the request is approved, and a gate pass is printed for the truck. Stock goes **down**.

**Overview** shows the work waiting at each step. **History** records every action.

## Demo script (2 minutes)
1. Overview: point at the 3 steps and the "Needs attention" list.
2. Receive → click the red HAZMAT badge (safety sheet + expiry) → Inspect SHP-885 → tick the QA/QC checks (incl. Bayan customs) → Pass. The low-stock warning for the mud additive goes away.
3. Dispatch → Fahud Rig-04 (urgent, red edge) → Approve → enter truck + driver → Confirm and print gate pass (OMR + 5% VAT).
4. REQ-906 doesn't have enough stock → Raise reorder PR.
5. History: every action is logged. Toggle عربي in the header to show Arabic support.

## Run
```
npm install
npm run dev      # http://localhost:3000
```

## Files
- `app/page.js`: the whole UI
- `data/demoData.js`: demo items, shipments and rig requests (in memory; **Reset demo** reloads it)
- `_old_version/`: the previous, larger prototype, kept for reference
"# petroleum_Oman" 
