// Input schemas per field type, NFKC normalization and masks (ADR 0019).
// Same schema on the client and the server.
export { digitsOnly, normalizeText } from './normalize';
export {
  companyCode,
  invoiceRegNo,
  kanaText,
  romanizeKana,
  suggestCompanyCode,
  toKatakana,
} from './company';
export {
  formatEmployeeLoginId,
  formatLandlinePhone,
  formatMobilePhone,
  formatPostalCode,
  formatYen,
} from './format';
export {
  addDays,
  businessDate,
  email,
  employeeLoginId,
  freeText,
  isTrivialPin,
  landlinePhone,
  loginPassword,
  longText,
  mobilePhone,
  newPassword,
  optional,
  pin,
  postalCode,
  todayInTokyo,
  yen,
} from './fields';
