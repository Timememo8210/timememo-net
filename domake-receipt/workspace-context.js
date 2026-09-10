// Explicit local demo context, not authentication or authority over a property.
export const users = [
  { id: "local-reviewer", display_name: "Local reviewer", role: "local_reviewer", is_demo: false },
  { id: "demo-alice", display_name: "Alice Morgan", role: "homeowner", is_demo: true },
  { id: "demo-ben", display_name: "Ben Carter", role: "homeowner", is_demo: true },
  { id: "demo-james", display_name: "James Turner", role: "pro", is_demo: true },
];
export const properties = [
{"uid": "round2-uk-01", "name": "22 Fictional Orchard Close", "address": "22 Fictional Orchard Close, Exampleford, ZZ1 2BB", "owner": "Alice Morgan"},
{"uid": "round2-uk-02", "name": "7 Imaginary Willow Walk", "address": "7 Imaginary Willow Walk, Samplemere, ZZ2 3CC", "owner": "Ben Carter"},
{"uid": "round2-uk-03", "name": "41 Makebelieve Crescent", "address": "41 Makebelieve Crescent, South Exampleton, ZZ3 4DD", "owner": "Alice Morgan"},
{"uid": "round2-uk-04", "name": "19 Imaginary Ridge Avenue", "address": "19 Imaginary Ridge Avenue, Cedar Example, ZZ4 5EE", "owner": "Ben Carter"},
{"uid": "round2-uk-05", "name": "8 Pretend Hawthorn Row", "address": "8 Pretend Hawthorn Row, Ember Example, ZZ5 6FF", "owner": "Alice Morgan"},
{"uid": "round2-uk-06", "name": "63 Fictional Bay Street", "address": "63 Fictional Bay Street, North Example, ZZ6 7GG", "owner": "Ben Carter"},
{"uid": "round2-uk-07", "name": "5 Pretend Rose Square", "address": "5 Pretend Rose Square, Inkwell Example, ZZ7 8HH", "owner": "Alice Morgan"},
{"uid": "round2-uk-08", "name": "12 Invented Meadow Gardens", "address": "12 Invented Meadow Gardens, Green Example, ZZ8 9JJ", "owner": "Ben Carter"},
{"uid": "round2-uk-09", "name": "Flat 4B", "address": "Flat 4B, The Fictional Mews, 128 Willow-by-the-Water Lane, North Exampleton, Greater Examplefordshire, ZZ9 1KK, United Kingdom", "owner": "Alice Morgan"},
  { uid: "demo-bristol-14", name: "14 Example Mews", address: "14 Example Mews, Bristol, BS1 2AB", owner: "Alice Morgan" },
  { uid: "demo-bath-22", name: "22 Sample Close", address: "22 Sample Close, Bath, BA1 1AA", owner: "Alice Morgan" },
  { uid: "demo-york-8", name: "8 Fictional Lane", address: "8 Fictional Lane, York, YO1 1AA", owner: "Ben Carter" },
];
export function contextFor(userId, propertyUid) {
  return { account: structuredClone(users.find(x => x.id === userId) || users[0]), property: properties.find(x => x.uid === propertyUid) || null };
}
export function applyContext(record, context) {
  record.account = structuredClone(context.account);
  if (context.property) { record.property.id = context.property.name; record.property.uid = context.property.uid; }
  return record;
}
export function propertyKey(record) {
  // Shared demo properties are linked explicitly, never inferred from a name/address.
  return record.property.uid || "unlinked:" + record.id;
}
export function csvCell(value) {
  let s = value == null ? "" : String(value);
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
