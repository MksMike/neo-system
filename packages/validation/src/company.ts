import { z } from 'zod';
import { normalizeText } from './normalize';

/** Company code (R00-01): 3 to 12 capital letters and digits, e.g. `SUGITA`. */
export const companyCode = z
  .string()
  .transform((v) => normalizeText(v).toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9]{3,12}$/, 'validation.companyCode'));

/** 適格請求書発行事業者登録番号: `T` + 13 digits. Typing only the digits is enough. */
export const invoiceRegNo = z
  .string()
  .transform((v) => {
    const compact = normalizeText(v).toUpperCase().replace(/[\s-]/g, '');
    return /^\d{13}$/.test(compact) ? `T${compact}` : compact;
  })
  .pipe(z.string().regex(/^T\d{13}$/, 'validation.invoiceRegNo'));

const HIRAGANA = /[ぁ-ゖ]/g;

/** Hiragana becomes katakana: `すぎた` → `スギタ`. */
export function toKatakana(value: string): string {
  return value.replace(HIRAGANA, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

/** Name in katakana (会社名カナ). Hiragana is converted; letters and digits are allowed. */
export function kanaText(options: { max: number }) {
  return z
    .string()
    .transform((v) => toKatakana(normalizeText(v)))
    .pipe(
      z
        .string()
        .max(options.max, 'validation.tooLong')
        .regex(/^[ァ-ヺー・ A-Za-z0-9&.()-]*$/, 'validation.kana'),
    );
}

// Hepburn romanization, enough to suggest a code from the kana name.
const DIGRAPHS: Record<string, string> = {
  キャ: 'KYA',
  キュ: 'KYU',
  キョ: 'KYO',
  ギャ: 'GYA',
  ギュ: 'GYU',
  ギョ: 'GYO',
  シャ: 'SHA',
  シュ: 'SHU',
  ショ: 'SHO',
  ジャ: 'JA',
  ジュ: 'JU',
  ジョ: 'JO',
  チャ: 'CHA',
  チュ: 'CHU',
  チョ: 'CHO',
  ニャ: 'NYA',
  ニュ: 'NYU',
  ニョ: 'NYO',
  ヒャ: 'HYA',
  ヒュ: 'HYU',
  ヒョ: 'HYO',
  ビャ: 'BYA',
  ビュ: 'BYU',
  ビョ: 'BYO',
  ピャ: 'PYA',
  ピュ: 'PYU',
  ピョ: 'PYO',
  ミャ: 'MYA',
  ミュ: 'MYU',
  ミョ: 'MYO',
  リャ: 'RYA',
  リュ: 'RYU',
  リョ: 'RYO',
  ファ: 'FA',
  フィ: 'FI',
  フェ: 'FE',
  フォ: 'FO',
  ティ: 'TI',
  ディ: 'DI',
  ウィ: 'WI',
  ウェ: 'WE',
  ウォ: 'WO',
  ヴァ: 'VA',
  ヴィ: 'VI',
};

const SINGLE: Record<string, string> = {
  ア: 'A',
  イ: 'I',
  ウ: 'U',
  エ: 'E',
  オ: 'O',
  カ: 'KA',
  キ: 'KI',
  ク: 'KU',
  ケ: 'KE',
  コ: 'KO',
  ガ: 'GA',
  ギ: 'GI',
  グ: 'GU',
  ゲ: 'GE',
  ゴ: 'GO',
  サ: 'SA',
  シ: 'SHI',
  ス: 'SU',
  セ: 'SE',
  ソ: 'SO',
  ザ: 'ZA',
  ジ: 'JI',
  ズ: 'ZU',
  ゼ: 'ZE',
  ゾ: 'ZO',
  タ: 'TA',
  チ: 'CHI',
  ツ: 'TSU',
  テ: 'TE',
  ト: 'TO',
  ダ: 'DA',
  ヂ: 'JI',
  ヅ: 'ZU',
  デ: 'DE',
  ド: 'DO',
  ナ: 'NA',
  ニ: 'NI',
  ヌ: 'NU',
  ネ: 'NE',
  ノ: 'NO',
  ハ: 'HA',
  ヒ: 'HI',
  フ: 'FU',
  ヘ: 'HE',
  ホ: 'HO',
  バ: 'BA',
  ビ: 'BI',
  ブ: 'BU',
  ベ: 'BE',
  ボ: 'BO',
  パ: 'PA',
  ピ: 'PI',
  プ: 'PU',
  ペ: 'PE',
  ポ: 'PO',
  マ: 'MA',
  ミ: 'MI',
  ム: 'MU',
  メ: 'ME',
  モ: 'MO',
  ヤ: 'YA',
  ユ: 'YU',
  ヨ: 'YO',
  ラ: 'RA',
  リ: 'RI',
  ル: 'RU',
  レ: 'RE',
  ロ: 'RO',
  ワ: 'WA',
  ヲ: 'O',
  ン: 'N',
  ヴ: 'VU',
  ァ: 'A',
  ィ: 'I',
  ゥ: 'U',
  ェ: 'E',
  ォ: 'O',
  ャ: 'YA',
  ュ: 'YU',
  ョ: 'YO',
};

/** Katakana to capital Hepburn letters; anything else is dropped. Long vowels are not doubled. */
export function romanizeKana(value: string): string {
  const kana = toKatakana(value);
  let out = '';
  let doubleNext = false;
  for (let i = 0; i < kana.length; i += 1) {
    const pair = kana.slice(i, i + 2);
    const ch = kana.charAt(i);
    let romaji = DIGRAPHS[pair];
    if (romaji) i += 1;
    else if (ch === 'ッ') {
      doubleNext = true;
      continue;
    } else romaji = SINGLE[ch] ?? (/[A-Za-z0-9]/.test(ch) ? ch.toUpperCase() : '');
    if (doubleNext && romaji) romaji = (romaji.startsWith('CH') ? 'T' : romaji.charAt(0)) + romaji;
    doubleNext = false;
    out += romaji;
  }
  return out;
}

// Legal forms are not part of the name: 株式会社杉田工業 → 杉田工業.
const LEGAL_FORMS = [
  /株式会社|有限会社|合同会社|合資会社|合名会社|一般社団法人|\(株\)|\(有\)|㈱|㈲/g,
  /カブシキガイシャ|カブシキカイシャ|ユウゲンガイシャ|ユウゲンカイシャ|ゴウドウガイシャ|ゴウドウカイシャ/g,
  /\b(CO|LTD|INC|CORP|KK|LLC|GK)\b\.?/gi,
];

function withoutLegalForm(value: string): string {
  return LEGAL_FORMS.reduce((text, form) => text.replace(form, ' '), normalizeText(value));
}

/**
 * Suggests a company code (R00-01) from the name: Latin letters of the name, or else the kana
 * name romanized. Only the first word when it is long enough. Empty when nothing fits.
 */
export function suggestCompanyCode(name: { legalName?: string; kana?: string }): string {
  const fromWords = (text: string) => {
    const words = text
      .split(/[^A-Za-z0-9]+/)
      .map((w) => w.toUpperCase())
      .filter(Boolean);
    const first = words[0] ?? '';
    const code = first.length >= 3 ? first : words.join('');
    return code.slice(0, 12);
  };

  const latin = fromWords(withoutLegalForm(name.legalName ?? ''));
  if (latin.length >= 3) return latin;
  const kana = withoutLegalForm(name.kana ?? '')
    .split(/\s+/)
    .map(romanizeKana)
    .join(' ');
  const romanized = fromWords(kana);
  return romanized.length >= 3 ? romanized : '';
}
