import type { Metadata } from "next";
import { ConfigService } from "@/lib/config/ConfigService";
import { BarThemeWrapper } from "@/components/providers/BarThemeWrapper";
import { theme } from "@/lib/theme";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { config, business } = await ConfigService.getConfig(slug);
  if (!business) {
    return { title: "Negocio no encontrado" };
  }
  const title = config.seo?.title || config.branding?.name || business.name || "Loyalty MVP";
  const description = config.seo?.description || "Fidelización";
  const icons = config.branding?.favicon_url ? { icon: config.branding.favicon_url } : undefined;
  return { title, description, icons };
}

export default async function BarLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Siempre renderizar hijos: la carga del negocio se hace también en cliente (useBusinessConfig).
  // Así evitamos mostrar "Negocio no encontrado" por fallos puntuales de red o caché en el servidor.
  return <BarThemeWrapper slug={slug}>{children}</BarThemeWrapper>;
}
