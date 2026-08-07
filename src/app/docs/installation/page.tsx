import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Installation Guide — Pryrox Documentation",
  description:
    "Server setup, PostgreSQL, NestJS backend, Next.js frontend, environment variables, database migrations, and VSDC connection for Pryrox.",
};

export default function InstallationPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link href="/docs" className="text-sm text-blue-600 hover:underline">← Documentation</Link>
      </div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Installation Guide</h1>
      <p className="text-neutral-600 mb-8">For IT personnel and system administrators. Covers server provisioning, dependencies, deployment, and VSDC connection.</p>

      <div className="space-y-10 text-sm text-neutral-700">

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">System Requirements</h2>
          <table className="w-full border-collapse text-sm">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Component</th><th className="p-2 text-left">Minimum</th><th className="p-2 text-left">Recommended</th></tr></thead>
            <tbody>
              {[
                ["CPU", "2 cores", "4 cores"],
                ["RAM", "4 GB", "8 GB"],
                ["Storage", "20 GB SSD", "50 GB SSD"],
                ["OS", "Ubuntu 20.04 / Windows Server 2019", "Ubuntu 22.04 LTS"],
                ["Node.js", "18.17 LTS", "20 LTS"],
                ["PostgreSQL", "14", "15 or 16"],
                ["Java (for VSDC)", "JDK 11", "JDK 17"],
              ].map(([c, m, r], i) => (
                <tr key={c} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="p-2 border-b border-neutral-200 font-medium">{c}</td>
                  <td className="p-2 border-b border-neutral-200">{m}</td>
                  <td className="p-2 border-b border-neutral-200 text-neutral-500">{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Database Setup</h2>
          <pre className="bg-neutral-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`sudo -u postgres psql

CREATE DATABASE pryrox_db;
CREATE USER pryrox_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE pryrox_db TO pryrox_user;
\\q`}</pre>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Backend Installation (NestJS)</h2>
          <pre className="bg-neutral-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`cd /opt
git clone https://github.com/pryrolab-eng/pryro-phramacy.git pryrox
cd pryrox/backend
npm install
cp .env.example .env
# Edit .env with your values
npm run build
npm run start:prod`}</pre>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Frontend Installation (Next.js)</h2>
          <pre className="bg-neutral-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`cd /opt/pryrox/frontend
npm install
cp .env.example .env
npm run build
npm run start`}</pre>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Environment Variables</h2>
          <table className="w-full border-collapse text-sm">
            <thead><tr className="bg-neutral-900 text-white"><th className="p-2 text-left">Variable</th><th className="p-2 text-left">Required</th><th className="p-2 text-left">Description</th></tr></thead>
            <tbody>
              {[
                ["DATABASE_URL", "Yes", "PostgreSQL connection string"],
                ["DIRECT_URL", "Yes", "Direct (non-pooled) PostgreSQL URL for migrations"],
                ["AUTH_SECRET", "Yes", "JWT signing secret (min 32 chars)"],
                ["SMTP_HOST / PORT / USER / PASS / FROM", "Yes", "SMTP server for email notifications"],
                ["NEXT_PUBLIC_APP_URL", "Yes", "Public application URL"],
                ["RRA_VSDC_BASE_URL", "EBM", "Local VSDC WAR URL (e.g. http://localhost:8080)"],
              ].map(([v, r, d], i) => (
                <tr key={v} className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="p-2 border-b border-neutral-200 font-mono text-xs">{v}</td>
                  <td className="p-2 border-b border-neutral-200">{r}</td>
                  <td className="p-2 border-b border-neutral-200 text-neutral-600">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">Database Migrations</h2>
          <pre className="bg-neutral-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{`cd /opt/pryrox/backend
npx prisma migrate deploy
npx prisma generate`}</pre>
          <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 text-sm text-amber-800 rounded-r">
            <strong>Warning:</strong> Never use <code>prisma db push --accept-data-loss</code> on production — it can delete data.
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-200 pb-2 mb-4">VSDC Connection Setup</h2>
          <ol className="space-y-2">
            <li>Deploy the VSDC WAR to Apache Tomcat: <code className="bg-neutral-100 px-1 rounded">cp vsdc.war /opt/tomcat/webapps/</code></li>
            <li>Verify it's running: <code className="bg-neutral-100 px-1 rounded">curl http://localhost:8080/initializer/selectInitInfo</code></li>
            <li>In Pryrox, go to <strong>Settings → EBM / VSDC Integration</strong> and enter TIN, VSDC URL, branch ID, device serial, and device number.</li>
            <li>Click <strong>Save and Initialize</strong>. The system retrieves the SDC ID and MRC from the VSDC.</li>
          </ol>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-500 flex-wrap gap-4">
        <span>Pryrox Installation Guide · Version 1.0</span>
        <Link href="/docs" className="text-blue-600 hover:underline">← All documentation</Link>
      </div>
    </div>
  );
}
