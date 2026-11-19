import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | Fiães SC",
  description: "Documentação interativa da API Fiães SC",
};

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div
        id="swagger-ui"
        style={{
          backgroundColor: "white",
        }}
      />

      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.15.0/swagger-ui.min.js" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.15.0/swagger-ui.min.css"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onload = () => {
              window.ui = SwaggerUIBundle({
                url: '/api/docs/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIBundle.SwaggerUIStandalonePreset,
                ],
                plugins: [
                  SwaggerUIBundle.plugins.DownloadUrl,
                ],
                layout: 'BaseLayout',
                defaultModelsExpandDepth: 1,
                defaultModelExpandDepth: 1,
              });
            };
          `,
        }}
      />
    </div>
  );
}
