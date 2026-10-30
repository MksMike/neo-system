/** Dados fictícios para o protótipo (ADR 0015: nada real). Domínio de genba da Sugita. */

export interface Kpi {
  label: string;
  value: number;
  format: 'int' | 'yen';
  delta: number;
  deltaLabel: string;
  spark: number[];
  icon: 'users' | 'clock' | 'yen' | 'site';
}

export const KPIS: Kpi[] = [
  {
    label: 'No genba hoje',
    value: 46,
    format: 'int',
    delta: 8.2,
    deltaLabel: 'vs. ontem',
    spark: [38, 41, 40, 43, 39, 44, 42, 45, 43, 46],
    icon: 'users',
  },
  {
    label: 'Confirmações pendentes',
    value: 12,
    format: 'int',
    delta: -25,
    deltaLabel: 'vs. ontem',
    spark: [22, 19, 21, 17, 18, 15, 16, 14, 16, 12],
    icon: 'clock',
  },
  {
    label: 'A faturar no mês',
    value: 4280500,
    format: 'yen',
    delta: 12.4,
    deltaLabel: 'vs. setembro',
    spark: [3.1, 3.4, 3.3, 3.6, 3.5, 3.9, 3.8, 4.1, 4.0, 4.28],
    icon: 'yen',
  },
  {
    label: 'Genbas ativos',
    value: 18,
    format: 'int',
    delta: 5.9,
    deltaLabel: 'vs. setembro',
    spark: [14, 15, 15, 16, 15, 17, 16, 17, 17, 18],
    icon: 'site',
  },
];

/** 人工 (dias trabalhados) por semana: período atual × mesmo período do ano anterior. */
export const WEEKS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12'];
export const UNITS_CURRENT = [182, 196, 188, 205, 214, 209, 226, 231, 224, 240, 248, 252];
export const UNITS_PREVIOUS = [170, 175, 181, 178, 190, 194, 188, 199, 205, 201, 210, 215];

/** Participação de cada cliente nos 人工 do mês. */
export const CLIENT_SHARE = [
  { name: '大成建設', value: 412 },
  { name: '鹿島建設', value: 288 },
  { name: '清水建設', value: 196 },
  { name: '竹中工務店', value: 121 },
  { name: 'Outros', value: 84 },
];

export type GenbaStatus = 'confirmado' | 'pendente' | 'em-andamento' | 'cancelado';

export interface GenbaRow {
  id: string;
  site: string;
  client: string;
  sub: string;
  people: number;
  meeting: string;
  status: GenbaStatus;
}

export const GENBA_TODAY: GenbaRow[] = [
  {
    id: 'G-1042',
    site: '品川工場',
    client: '大成建設',
    sub: 'UCH',
    people: 3,
    meeting: '07:30',
    status: 'confirmado',
  },
  {
    id: 'G-1043',
    site: '横浜ベイ',
    client: '鹿島建設',
    sub: 'YKH',
    people: 8,
    meeting: '07:00',
    status: 'pendente',
  },
  {
    id: 'G-1044',
    site: '川崎物流センター',
    client: '清水建設',
    sub: 'SFK',
    people: 7,
    meeting: '08:00',
    status: 'confirmado',
  },
  {
    id: 'G-1045',
    site: '浜松町ビル',
    client: '竹中工務店',
    sub: 'TKN',
    people: 4,
    meeting: '08:30',
    status: 'em-andamento',
  },
  {
    id: 'G-1046',
    site: '豊洲タワー',
    client: '大成建設',
    sub: 'UCH',
    people: 6,
    meeting: '07:45',
    status: 'confirmado',
  },
  {
    id: 'G-1047',
    site: '大井埠頭',
    client: '鹿島建設',
    sub: 'YKH',
    people: 5,
    meeting: '06:30',
    status: 'pendente',
  },
  {
    id: 'G-1048',
    site: '羽田整備場',
    client: '清水建設',
    sub: 'SFK',
    people: 2,
    meeting: '09:00',
    status: 'cancelado',
  },
  {
    id: 'G-1049',
    site: '新木場倉庫',
    client: '大成建設',
    sub: 'MRK',
    people: 4,
    meeting: '07:30',
    status: 'confirmado',
  },
  {
    id: 'G-1050',
    site: '晴海埠頭',
    client: '竹中工務店',
    sub: 'TKN',
    people: 3,
    meeting: '08:00',
    status: 'em-andamento',
  },
  {
    id: 'G-1051',
    site: '蒲田工場',
    client: '鹿島建設',
    sub: 'YKH',
    people: 4,
    meeting: '07:15',
    status: 'pendente',
  },
  {
    id: 'G-1052',
    site: '月島ビル',
    client: '清水建設',
    sub: 'SFK',
    people: 3,
    meeting: '08:15',
    status: 'confirmado',
  },
];
