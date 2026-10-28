import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isProd = process.env.NODE_ENV === 'production';

// Static security headers (ADR 0023). The Content-Security-Policy carries a per-request
// nonce, so it is set in src/proxy.ts.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), geolocation=(self)' },
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
];

const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // In development Next.js prints every Server Function call with its arguments, which would put
  // passwords and personal data in the terminal (ADR 0022: no secrets in logs).
  logging: { serverFunctions: false },
  // The dev badge would sit over the bottom of the side menu (left); production never shows it.
  devIndicators: { position: 'bottom-right' },
  reactStrictMode: true,
  transpilePackages: ['@neo/ui', '@neo/validation'],
  headers() {
    return Promise.resolve([{ source: '/:path*', headers: securityHeaders }]);
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(config);
