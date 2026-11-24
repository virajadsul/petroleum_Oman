// Demo data for the prototype. Everything lives in memory; refresh the page to reset.

export const SITES = ['Muscat Central Hub', 'Sohar Port Yard', 'Duqm Free Zone'];

export const STOCK = [
  { sku: 'PIP-958-L80', name: 'Casing pipe 9-5/8" L-80', category: 'Pipes', location: 'Yard A · Row 2 · Bay 8', qty: 320, min: 100, unit: 'joints', price: 890 },
  { sku: 'VAL-6A-01', name: 'High-pressure gate valve (API 6A)', category: 'Valves', location: 'Yard B · Row 4 · Bay 12', qty: 18, min: 5, unit: 'pcs', price: 4250 },
  { sku: 'BOP-SEAL', name: 'Blowout preventer seal kit', category: 'Drilling', location: 'Yard B · Row 1 · Bay 3', qty: 4, min: 2, unit: 'kits', price: 12850 },
  { sku: 'ESP-PUMP', name: 'Electric submersible pump', category: 'Pumps', location: 'Yard B · Row 3 · Bay 6', qty: 2, min: 3, unit: 'units', price: 38500 },
  {
    sku: 'CHM-X200', name: 'Drilling mud additive X-200', category: 'Chemicals', location: 'Hazmat store · Row 1 · Bay 4', qty: 40, min: 50, unit: 'drums', price: 185.5,
    hazmat: { hazard: 'Flammable liquid — UN 1993, Class 3', expiry: '2026-12-08',
      rules: ['Wear chemical gloves, goggles and FR coverall', 'Store below 30 °C, away from heat and sparks', 'Spill: contain with sand, never water; report to HSE'] },
  },
  { sku: 'PPE-FRC', name: 'Fire-resistant coverall (H2S rated)', category: 'Safety gear', location: 'Store A · Shelf 2', qty: 450, min: 150, unit: 'pcs', price: 48.5 },
];

// status: 'arrived' (waiting for QA/QC) | 'stored' | 'rejected'. bayan = Oman customs declaration no. (imports only)
export const SHIPMENTS = [
  { id: 'SHP-884', supplier: 'Tenaris — via Sohar Port', bayan: 'BYN-2026-118842', sku: 'PIP-958-L80', qty: 60, status: 'arrived' },
  { id: 'SHP-885', supplier: 'Baroid Oman — via Duqm', bayan: 'BYN-2026-119307', sku: 'CHM-X200', qty: 100, status: 'arrived' },
  { id: 'SHP-879', supplier: 'Cameron ME — Muscat', sku: 'VAL-6A-01', qty: 6, status: 'stored' },
];

// status: 'waiting' | 'dispatched'
export const REQUESTS = [
  { id: 'REQ-904', rig: 'Fahud Rig-04', sku: 'BOP-SEAL', qty: 1, urgent: true, status: 'waiting' },
  { id: 'REQ-905', rig: 'Nimr Rig-11', sku: 'PPE-FRC', qty: 40, status: 'waiting' },
  { id: 'REQ-906', rig: 'Qarn Alam Rig-07', sku: 'ESP-PUMP', qty: 3, status: 'waiting' }, // more than in stock, on purpose
  { id: 'REQ-899', rig: 'Lekhwair Rig-02', sku: 'VAL-6A-01', qty: 2, status: 'dispatched', gatePass: 'GP-0490', truck: '48213 RA', driver: 'Said Al-Balushi' },
];

export const HISTORY = [
  { time: 'Yesterday', text: 'SHP-879 passed QA/QC and stored: 6 pcs High-pressure gate valve' },
  { time: 'Yesterday', text: 'REQ-899 dispatched to Lekhwair Rig-02 with gate pass GP-0490' },
];

// Key screen text in English and Arabic. Item names and log lines stay in English.
export const T = {
  en: {
    title: 'Oman Petroleum — Warehouse Management', prototype: 'Prototype', site: 'Warehouse', reset: 'Reset demo', lang: 'عربي',
    tabs: ['Overview', '1. Receive', '2. Stock', '3. Dispatch to rigs', 'History'],
    howTitle: 'How this warehouse works', howText: 'Every item follows the same three steps. The number on each step shows the work that is waiting.',
    receive: 'Receive', receiveCard: 'Goods arrive from suppliers. Check them, then put them on a shelf.',
    stock: 'Stock', stockCard: 'See what is in the warehouse, where it is kept, and what is running low.',
    dispatch: 'Dispatch to rigs', dispatchCard: 'Oil rigs request items. Approve, take them off the shelf, and send them with a gate pass.',
    stockValue: 'Stock value', items: 'Different items', dispatchedCount: 'Dispatched to rigs', attention: 'Needs attention',
    receiveTitle: 'Step 1 · Receive and inspect (QA/QC)', receiveText: 'A truck has arrived. Each shipment must pass QA/QC inspection before it is released to stock.',
    waitingQA: 'Waiting for QA/QC inspection', inspect: 'Inspect', finished: 'Finished',
    stockTitle: 'Step 2 · Stock', stockText: 'What is in the warehouse right now, and where to find it.', search: 'Search items',
    cols: ['Item', 'Where', 'Quantity', 'Value'],
    dispatchTitle: 'Step 3 · Dispatch to rigs', dispatchText: 'Rigs in the field ask for items. Approving a request takes the items out of stock and creates a gate pass for the truck.',
    waitingReq: 'Waiting requests', approve: 'Approve and dispatch', reorder: 'Raise reorder PR', dispatched: 'Dispatched',
    historyTitle: 'History', historyText: 'Every action is recorded here, newest first.',
  },
  ar: {
    title: 'إدارة مستودعات البترول — عُمان', prototype: 'نموذج أولي', site: 'المستودع', reset: 'إعادة العرض', lang: 'EN',
    tabs: ['نظرة عامة', '١. الاستلام', '٢. المخزون', '٣. الصرف للحفارات', 'السجل'],
    howTitle: 'كيف يعمل هذا المستودع', howText: 'كل صنف يمر بنفس الخطوات الثلاث. الرقم على كل خطوة يوضح الأعمال المنتظرة.',
    receive: 'الاستلام', receiveCard: 'تصل البضائع من الموردين. افحصها ثم ضعها على الرف.',
    stock: 'المخزون', stockCard: 'اعرف ما في المستودع، وأين يُحفظ، وما الذي أوشك على النفاد.',
    dispatch: 'الصرف للحفارات', dispatchCard: 'تطلب الحفارات أصنافاً. اعتمد الطلب واصرفها مع تصريح خروج.',
    stockValue: 'قيمة المخزون', items: 'عدد الأصناف', dispatchedCount: 'المصروف للحفارات', attention: 'يحتاج إلى متابعة',
    receiveTitle: 'الخطوة ١ · الاستلام وفحص الجودة', receiveText: 'وصلت شاحنة. يجب أن تجتاز كل شحنة فحص الجودة قبل إدخالها إلى المخزون.',
    waitingQA: 'بانتظار فحص الجودة', inspect: 'فحص', finished: 'المنتهية',
    stockTitle: 'الخطوة ٢ · المخزون', stockText: 'ما يوجد في المستودع الآن وأين تجده.', search: 'البحث عن صنف',
    cols: ['الصنف', 'الموقع', 'الكمية', 'القيمة'],
    dispatchTitle: 'الخطوة ٣ · الصرف للحفارات', dispatchText: 'تطلب الحفارات في الحقول أصنافاً. اعتماد الطلب يخصمها من المخزون وينشئ تصريح خروج للشاحنة.',
    waitingReq: 'الطلبات المنتظرة', approve: 'اعتماد وصرف', reorder: 'رفع طلب شراء', dispatched: 'المصروفة',
    historyTitle: 'السجل', historyText: 'كل إجراء يُسجَّل هنا، الأحدث أولاً.',
  },
};
