/** Severity of an event (ADR 0022). `warn` and above are always stored; `info` is sampled. */
export type Severity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface CatalogEntry {
  severity: Severity;
  /** What happened, in Portuguese (shown in the Super Admin panel). */
  description: string;
  /** What to do about it, when there is something to do. */
  action?: string;
}

/**
 * Every event code of the system: AREA.CATEGORY.EVENT (ADR 0022).
 * A new code enters here first; logging an unknown code does not compile.
 */
export const EVENT_CATALOG = {
  'APP.REQUEST.COMPLETED': { severity: 'info', description: 'Requisição concluída.' },
  'APP.ACTION.COMPLETED': { severity: 'info', description: 'Ação do servidor concluída.' },
  'APP.ACTION.FAILED': {
    severity: 'warn',
    description:
      'Ação recusada com um erro conhecido (validação, conflito, permissão, status da empresa).',
  },
  'APP.UNHANDLED.ERROR': {
    severity: 'critical',
    description: 'Erro não tratado no servidor.',
    action: 'Abrir o evento, ver a mensagem e corrigir o código.',
  },
  'APP.COMPANY.PROVISIONED': {
    severity: 'info',
    description: 'Empresa cadastrada pelo Super Admin; convite do Proprietário na fila.',
  },
  'AUTH.LOGIN.SUCCEEDED': { severity: 'info', description: 'Login concluído.' },
  'AUTH.LOGIN.FAILED': { severity: 'warn', description: 'PIN ou senha errados.' },
  'AUTH.LOGIN.LOCKED': {
    severity: 'warn',
    description: 'Login bloqueado por excesso de tentativas.',
    action: 'Se repetir para muitos IDs, pode ser ataque: ver a aba Segurança.',
  },
  'AUTH.ACCESS.CREATED': {
    severity: 'info',
    description: 'Acesso ao app criado para um funcionário (ID + PIN).',
  },
  'AUTH.PIN.RESET': {
    severity: 'info',
    description: 'PIN de um funcionário redefinido; as sessões dele foram encerradas.',
  },
  'AUTH.INVITE.EXISTING_USER': {
    severity: 'info',
    description: 'O e-mail convidado já tem login; a participação é ligada no aceite.',
  },
  'SEC.RLS.DENIED': {
    severity: 'error',
    description: 'O banco recusou um acesso por permissão (RLS ou privilégio).',
    action: 'Ver quem tentou e de onde: pode ser erro no app ou tentativa de acesso indevido.',
  },
  'SEC.RATE.LIMITED': { severity: 'warn', description: 'Excesso de requisições: limite atingido.' },
  'SEC.INPUT.REJECTED': { severity: 'warn', description: 'Entrada recusada pela validação.' },
  'SEC.CSP.VIOLATION': {
    severity: 'warn',
    description: 'O navegador bloqueou um script ou recurso não autorizado.',
  },
  'SEC.CRON.UNAUTHORIZED': {
    severity: 'error',
    description: 'Chamada à rota da fila sem o segredo correto.',
    action: 'Se não foi um teste seu, alguém está tentando disparar a fila.',
  },
  'PERF.REQUEST.SLOW': { severity: 'warn', description: 'Requisição ou ação acima de 3 segundos.' },
  'DB.QUERY.SLOW': { severity: 'warn', description: 'Consulta lenta no banco.' },
  'JOB.RUN.COMPLETED': { severity: 'info', description: 'Tarefa da fila concluída.' },
  'JOB.RUN.FAILED': {
    severity: 'error',
    description: 'Tarefa da fila falhou; nova tentativa agendada.',
  },
  'JOB.RUN.GAVE_UP': {
    severity: 'critical',
    description: 'Tarefa da fila esgotou as tentativas.',
    action: 'Ver o erro na aba Fila e reexecutar depois de corrigir.',
  },
  'JOB.HANDLER.MISSING': {
    severity: 'critical',
    description: 'Tarefa de um tipo sem executor no servidor.',
    action: 'Registrar o executor do tipo ou corrigir quem criou a tarefa.',
  },
  'SYNC.OFFLINE.CONFLICT': {
    severity: 'info',
    description: 'Registro offline em conflito, enviado ao admin.',
  },
  'MAIL.SEND.FAILED': { severity: 'error', description: 'Falha ao enviar e-mail.' },
} as const satisfies Record<string, CatalogEntry>;

export type EventCode = keyof typeof EVENT_CATALOG;

export const SEVERITY_RANK: Record<Severity, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};
