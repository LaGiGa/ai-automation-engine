import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'AI Automation Engine - Pipeline de Extração Estruturada',
  description: 'Pipeline corporativo de extração estruturada de documentos e notas fiscais com Gemini/OpenAI (Zod Schema), validação matemática de totais, persistência JSONB no Supabase e dispatcher de webhooks com retries.',
  openGraph: {
    title: 'AI Automation Engine - Pipeline de Extração Estruturada',
    description: 'Pipeline corporativo de extração estruturada de documentos e notas fiscais com Gemini/OpenAI (Zod Schema), validação matemática de totais, persistência JSONB no Supabase e dispatcher de webhooks com retries.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Automation Engine - Pipeline de Extração Estruturada',
    description: 'Pipeline corporativo de extração estruturada de documentos e notas fiscais com Gemini/OpenAI (Zod Schema), validação matemática de totais, persistência JSONB no Supabase e dispatcher de webhooks com retries.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
