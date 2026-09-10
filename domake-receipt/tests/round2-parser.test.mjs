import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Works both from domake-research and after copying into the site's tests/.
const localParser = new URL('../extraction.js', import.meta.url);
const parserURL = existsSync(fileURLToPath(localParser))
  ? localParser
  : new URL('../timememo-net/domake-receipt/extraction.js', import.meta.url);
const { extractText } = await import(parserURL.href);
const uk = (text, confidence = 95) => extractText(text, confidence, { locale: 'en-GB' });
const receipt = (body) => `SERVICE RECEIPT\nCompany: Willow Test Plumbing Ltd\nWork: Repair kitchen mixer tap\n${body}`;

test('explicit UK context interprets slash dates and pounds while preserving original evidence', () => {
  const source = receipt('Service date: 04/09/2026\nIssue date: 05/09/2026\nTotal: £1,264.50');
  const result = uk(source);
  assert.equal(result.service.date, '2026-09-04');
  assert.equal(result.document.issue_date, '2026-09-05');
  assert.equal(result.amount.total, 1264.50);
  assert.equal(result.amount.currency, 'GBP');
  assert.equal(result.evidence.find(e => e.field === 'service.date').quote, 'Service date: 04/09/2026');
  assert.equal(result.evidence.find(e => e.field === 'amount.total').quote, 'Total: £1,264.50');
  assert.equal(result.review.status, 'draft');
});

test('UK-looking addresses and English text cannot silently select UK parsing', () => {
  const source = receipt('Service address: 10 Fictional Road, Bristol\nService date: 04/09/2026\nTotal: £264.00');
  for (const options of [undefined, { locale: 'en' }, { locale: 'en-US' }]) {
    const result = extractText(source, 95, options);
    assert.equal(result.service.date, null);
    assert.equal(result.amount.currency, null);
  }
  assert.equal(uk(receipt('Total: 264.00')).amount.currency, null);
  assert.equal(uk(receipt('Total: $264.00')).amount.currency, null);
});

test('UK dates reject impossible dates without borrowing invoice or future-service dates', () => {
  assert.equal(uk(receipt('Service date: 29/02/2024')).service.date, '2024-02-29');
  for (const value of ['29/02/2026', '31/04/2026', '04/09/26', '04.09.2026', '04/09/2026 SS']) {
    const result = uk(receipt(`Service date: ${value}\nInvoice date: 2026-09-10\nNext service due: 10/09/2027`));
    assert.equal(result.service.date, null, value);
    assert.equal(result.document.issue_date, '2026-09-10');
  }
  const generic = uk(receipt('Date: 10/09/2026\nNext annual service due: 10/09/2027'));
  assert.equal(generic.service.date, null);
  assert.equal(generic.document.issue_date, null);
});

test('amount parsing preserves zero and rejects corrupted OCR, currency conflicts and infinity', () => {
  assert.equal(uk(receipt('Total: £0.00')).amount.total, 0);
  for (const line of ['Total: £1 80 00', 'Total: E75 00', 'Total: £24O.00', 'Total: £1,24.00', 'Total: £264.00 SS', 'Total: USD 264.00 GBP', 'Total: USD £264.00', `Total: GBP ${'9'.repeat(400)}`]) {
    const result = uk(receipt(line));
    assert.equal(result.amount.total, null, line);
    assert.equal(result.amount.currency, null, line);
  }
});

test('conflicting totals remain unresolved while repeated identical totals and explicit grand totals are usable', () => {
  for (const body of ['Total: GBP 264.00\nTotal: GBP 240.00', 'Total: GBP 264.00\nTotal: USD 264.00']) {
    assert.equal(uk(receipt(body)).amount.total, null);
  }
  assert.equal(uk(receipt('Total: GBP 264.00\nTotal: GBP 264.00')).amount.total, 264);
  assert.equal(uk(receipt('Total: GBP 240.00\nGrand total: GBP 264.00')).amount.total, 264);
  assert.equal(uk(receipt('Grand total: £264.OO\nTotal: GBP 240.00')).amount.total, null);
});

test('invoice cost stays distinct from VAT, deposit and balance', () => {
  const result = uk(receipt('Net subtotal £1,350.00\nVAT £270.00\nInvoice total (including VAT) £1,620.00\nDeposit already paid £500.00\nAmount due £1,120.00\nPayment status: Partially paid'));
  assert.equal(result.amount.total, 1620);
  assert.equal(result.amount.currency, 'GBP');
  assert.equal(result.amount.payment_status, 'partial');
  const dueOnly = uk(receipt('UNPAID - AMOUNT DUE £420.00\nNo payment received.'));
  assert.equal(dueOnly.amount.total, null);
  assert.notEqual(dueOnly.amount.payment_status, 'paid');
});

test('total paid becomes invoice cost only with unambiguous full-payment evidence', () => {
  assert.equal(uk(receipt('Total paid £264.00\nPayment received in full by card.\nAmount due: £0.00')).amount.total, 264);
  assert.equal(uk(receipt('Total paid £50.00')).amount.total, null);
});

test('negated and partial payment evidence cannot promote paid amount to invoice total', () => {
  for (const evidence of ['Not paid in full', 'UNPAID INVOICE', 'Payment status: Partially paid', 'Paid in full\nBalance due: £100.00']) {
    const result = uk(receipt(`Total paid £50.00\n${evidence}`));
    assert.equal(result.amount.total, null, evidence);
  }
});

test('quoted cost is retained as an estimate and proposed workers remain unconfirmed', () => {
  const result = uk('ROOFING QUOTATION\nProposed technician: Felix Hart\nWork: Replace roof tiles\nQuote total\n£1,440.00\nNo payment received.');
  assert.equal(result.document.type, 'estimate');
  assert.equal(result.amount.total, 1440);
  assert.equal(result.service.completion_status, 'planned');
  assert.equal(result.amount.payment_status, 'unknown');
  assert.equal(result.provider.person_name, null);
  assert.equal(result.service.date, null);
  assert.equal(result.review.status, 'draft');
});

test('explicit attending-worker labels retain company/worker/customer separation', () => {
  for (const label of ['Attending technician', 'Attending repair technician', 'Engineer', 'Installer', 'Work carried out by']) {
    const result = uk(receipt(`${label}: Toby Wren\nCustomer: Harriet Moss\nPrepared by: Owen Reed\nSigned by: Harriet Moss`));
    assert.equal(result.provider.person_name, 'Toby Wren', label);
    assert.equal(result.provider.organization_name, 'Willow Test Plumbing Ltd');
    assert.equal(result.provider.name, 'Willow Test Plumbing Ltd');
    assert.ok(result.evidence.find(e => e.field === 'provider.person_name').quote.includes(label));
  }
});

test('an explicit worker at the end of a combined OCR row can be recovered without choosing the customer', () => {
  const result = uk(receipt('For: Harriet Moss Work carried out by: Toby Wren'));
  assert.equal(result.provider.person_name, 'Toby Wren');
});

test('empty worker labels do not consume the next customer or engineer label as a name', () => {
  assert.equal(uk(receipt('Technician:\nCustomer | Harriet Moss')).provider.person_name, null);
  assert.equal(uk(receipt('Technician:\nTotal GBP 264.00')).provider.person_name, null);
  const explicit = uk(receipt('Technician:\nEngineer: Nia Fenwick'));
  assert.equal(explicit.provider.person_name, 'Nia Fenwick');
});

test('proposed and negated worker roles are not attending-worker evidence across supported separators', () => {
  for (const line of ['Proposed technician: Felix Hart', 'Planned engineer: Felix Hart', 'Not technician: Felix Hart', 'Proposed technician | Felix Hart']) {
    assert.equal(uk(receipt(line)).provider.person_name, null, line);
  }
});

test('combined worker/customer rows never store the second field inside a person name', () => {
  const result = uk(receipt('Attending technician: Toby Wren Customer: Harriet Moss'));
  assert.ok([null, 'Toby Wren'].includes(result.provider.person_name), JSON.stringify(result.provider.person_name));
});

test('a customer company name cannot establish that an ambiguous contractor is an individual', () => {
  const result = uk('SERVICE RECEIPT\nContractor: Bright Spark\nCustomer: Independent Home Group\nWork: Repair kitchen mixer tap');
  assert.equal(result.provider.name, 'Bright Spark');
  assert.equal(result.provider.person_name, null);
  assert.equal(result.provider.organization_name, null);
});

test('clear continuation text belongs to work while customer and financial rows do not', () => {
  const source = 'SERVICE RECEIPT\nWork: Replace kitchen mixer tap\nand remove leaking waste trap\nCustomer | Harriet Moss\nTotal: £264.00';
  const result = uk(source);
  assert.equal(result.service.summary, 'Replace kitchen mixer tap and remove leaking waste trap');
  assert.equal(result.service.category, 'plumbing');
  assert.equal(result.service.change_type, 'replacement');
  assert.equal(result.evidence.find(e => e.field === 'service.summary').quote, 'Work: Replace kitchen mixer tap\nand remove leaking waste trap');
});

test('observed OCR pollution is retained as raw evidence but not assigned to identity or work', () => {
  const source = 'SERVICE RECEIPT\nTechnician: James Turner = SS\nWork: Replace kitchen mixer tap <==... SS\nTotal: £264.00 SS';
  const result = uk(source);
  assert.equal(result.provider.person_name, null);
  assert.equal(result.service.summary, null);
  assert.equal(result.service.category, 'unknown');
  assert.equal(result.amount.total, null);
  assert.equal(result.extraction.text, source);
});

test('invalid confidence cannot be converted into a low displayed score while extracting confident fields', () => {
  for (const confidence of [NaN, Infinity, -Infinity, '95', 34]) {
    const result = uk(receipt('Technician: Toby Wren\nService date: 10/09/2026\nTotal: £264.00'), confidence);
    assert.equal(result.extraction.status, 'no_text');
    assert.equal(result.provider.name, null);
    assert.equal(result.amount.total, null);
  }
});

test('restaurant payment text without a receipt heading is unrelated, while plumbing work at a restaurant is retained', () => {
  const meal = uk('KITCHEN RESTAURANT\nServer: Isla Finch\nTwo burgers £28.00\nTOTAL PAID £43.45\nCARD PAYMENT ACCEPTED');
  assert.equal(meal.extraction.status, 'unrelated');
  assert.equal(meal.provider.person_name, null);
  assert.equal(meal.property.service_address, null);
  const repair = uk('SERVICE INVOICE\nCompany: Willow Test Plumbing Ltd\nWork: Repair kitchen plumbing at the restaurant\nTotal: £264.00');
  assert.equal(repair.extraction.relevance, 'home_service');
});
