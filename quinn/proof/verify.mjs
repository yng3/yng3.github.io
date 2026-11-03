/* QUINN public proof lab — fixed synthetic example. No keys, payments or network APIs. */
const te = new TextEncoder();
const E_FIELDS = [
  'schema','controller_id','worker_id','request_id','capability','consent_id',
  'budget_ceiling','payload_sha256','issued_at','expires_at','nonce','signature'
].sort();
const R_FIELDS = [
  'schema','controller_id','request_id','worker_id','worker_key_id',
  'envelope_sha256','payload_sha256','capability','consent_id','attempt_id',
  'outcome','cost_units','result_sha256','signature'
].sort();
const ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{3,79}$/;
const CAP = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/;
const HEX = /^[0-9a-f]{64}$/;
function requireCondition(yes, code) { if (!yes) throw new Error(code); }
function sortedFields(value, expected, code) {
  requireCondition(value && Object.getPrototypeOf(value) === Object.prototype, code);
  const keys = Object.keys(value).sort();
  requireCondition(keys.length === expected.length && keys.every((k,i) => k === expected[i]), code);
}
function canonical(value) {
  if (value === null || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'string') return JSON.stringify(value).replace(/[\u007f-\uffff]/g, c =>
    '\\u' + c.charCodeAt(0).toString(16).padStart(4,'0'));
  if (typeof value === 'number') {
    requireCondition(Number.isSafeInteger(value), 'INVALID_INTEGER');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  requireCondition(value && Object.getPrototypeOf(value) === Object.prototype, 'INVALID_JSON');
  return '{'+Object.keys(value).sort().map(k => canonical(k)+':'+canonical(value[k])).join(',')+'}';
}
function unsigned(value) { return Object.fromEntries(Object.entries(value).filter(([key])=> key !== 'signature')); }
function b64urlBytes(value, expected) {
  requireCondition(typeof value==='string' && /^[A-Za-z0-9_-]+$/.test(value), 'INVALID_BASE64URL');
  requireCondition(value.length===Math.ceil(expected*8/6), 'INVALID_BASE64URL_LENGTH');
  const bytes=Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4)),c=>c.charCodeAt(0));
  requireCondition(bytes.length===expected && toB64url(bytes)===value,'NONCANONICAL_BASE64URL');
  return bytes;
}
function toB64url(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
async function digest(bytes) { return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)); }
async function shaHex(bytes) { return Array.from(await digest(bytes),b=>b.toString(16).padStart(2,'0')).join(''); }
async function checkSignature(bytes32, signatureText, payload) {
  const key=await crypto.subtle.importKey('raw',bytes32,{name:'Ed25519'},false,['verify']);
  return crypto.subtle.verify({name:'Ed25519'},key,b64urlBytes(signatureText,64),te.encode(payload));
}
function validateEnvelope(e) {
  sortedFields(e,E_FIELDS,'ENVELOPE_SCHEMA');
  requireCondition(e.schema==='quinn-remote-admission/v0.1','ENVELOPE_VERSION');
  for(const k of ['controller_id','worker_id','request_id','consent_id'])requireCondition(typeof e[k]==='string' && ID.test(e[k]),'ENVELOPE_ID');
  requireCondition(typeof e.capability==='string' && CAP.test(e.capability),'ENVELOPE_CAPABILITY');
  requireCondition(typeof e.payload_sha256==='string' && HEX.test(e.payload_sha256),'ENVELOPE_HASH');
  requireCondition(Number.isSafeInteger(e.issued_at)&&Number.isSafeInteger(e.expires_at)&&e.expires_at>e.issued_at&&e.expires_at-e.issued_at<=300,'ENVELOPE_TIME');
  requireCondition(Number.isSafeInteger(e.budget_ceiling)&&e.budget_ceiling>=0&&e.budget_ceiling<=1e9,'ENVELOPE_UNITS');
  b64urlBytes(e.nonce,24);b64urlBytes(e.signature,64);
}
function validateReceipt(r) {
  sortedFields(r,R_FIELDS,'RECEIPT_SCHEMA');
  requireCondition(r.schema==='quinn-remote-evidence/v0.1','RECEIPT_VERSION');
  for(const k of ['controller_id','worker_id','request_id','consent_id','attempt_id'])requireCondition(typeof r[k]==='string'&&ID.test(r[k]),'RECEIPT_ID');
  requireCondition(typeof r.capability==='string'&&CAP.test(r.capability),'RECEIPT_CAPABILITY');
  for(const k of ['worker_key_id','envelope_sha256','payload_sha256','result_sha256'])requireCondition(typeof r[k]==='string'&&HEX.test(r[k]),'RECEIPT_HASH');
  requireCondition(['completed','failed'].includes(r.outcome),'RECEIPT_OUTCOME');
  requireCondition(Number.isSafeInteger(r.cost_units)&&r.cost_units>=0&&r.cost_units<=1e9,'RECEIPT_UNITS');
  b64urlBytes(r.signature,64);
}
/**
 * Cryptographically checks one self-contained prototype fixture. Neither an
 * admission journal nor independent public-key provenance is available.
 * Successful result never means authorized / executed / paid / machine-attested.
 */
export async function verifyFixture(f) {
  requireCondition(f&&f.fixture_schema==='quinn-proof-demo/v0.1','FIXTURE_VERSION');
  requireCondition(typeof f.payload_text==='string'&&te.encode(f.payload_text).length<=65536,'PAYLOAD_LENGTH');
  requireCondition(typeof f.result_text==='string'&&te.encode(f.result_text).length<=65536,'RESULT_LENGTH');
  const e=f.envelope, r=f.receipt;
  validateEnvelope(e);validateReceipt(r);
  const controllerKey=b64urlBytes(f.controller_public_key_b64u,32);
  const workerKey=b64urlBytes(f.worker_public_key_b64u,32);
  requireCondition(await checkSignature(controllerKey,e.signature,'QUINN-REMOTE-ADMISSION-v0.1\n'+canonical(unsigned(e))), 'CONTROLLER_SIGNATURE');
  requireCondition(e.payload_sha256===await shaHex(te.encode(f.payload_text)),'PAYLOAD_BINDING');
  requireCondition(r.worker_key_id===await shaHex(workerKey),'WORKER_KEY_BINDING');
  requireCondition(r.envelope_sha256===await shaHex(te.encode(canonical(e))),'ENVELOPE_BINDING');
  for(const field of ['controller_id','worker_id','request_id','capability','consent_id','payload_sha256']) {
    requireCondition(r[field]===e[field],'REQUEST_BINDING');
  }
  requireCondition(r.result_sha256===await shaHex(te.encode(f.result_text)),'RESULT_BINDING');
  requireCondition(r.cost_units<=e.budget_ceiling,'UNIT_CEILING');
  requireCondition(await checkSignature(workerKey,r.signature,'QUINN-REMOTE-EVIDENCE-v0.1\n'+canonical(unsigned(r))), 'WORKER_SIGNATURE');
  return {valid:true,kind:'SELF_CONSISTENT_PROTOTYPE',controller_signature:true,worker_signature:true,
    request_binding:true,result_binding:true,budget_claim_within_ceiling:true,
    note:'Self-contained demonstration; keys are supplied with the sample and NOT externally trusted. Not proof of consent, execution, billing or host identity.'};
}
