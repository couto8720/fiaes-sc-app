import { NextResponse } from "next/server";

// Serve OpenAPI schema as JSON
export async function GET() {
  const openapi = {
    openapi: "3.1.0",
    info: {
      title: "Fiães SC API",
      description: "API para gestão de torneios, jogos e equipas do Fiães Sport Clube",
      version: "1.0.0",
      contact: {
        name: "Suporte Fiães SC",
        email: "admin@fiaes.pt",
      },
      license: {
        name: "Proprietário",
      },
    },
    servers: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://fiaes.pt"}/api`,
        description: "Produção",
      },
      {
        url: "http://localhost:3000/api",
        description: "Desenvolvimento",
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      "/health": {
        get: {
          summary: "Verificação de saúde da API",
          description: "Verifica o estado de saúde da aplicação e dos serviços",
          tags: ["Sistema"],
          security: [],
          responses: {
            "200": {
              description: "API saudável",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "healthy" },
                      timestamp: { type: "string", format: "date-time" },
                      services: {
                        type: "object",
                        properties: {
                          database: { type: "string", enum: ["ok", "error"] },
                          auth: { type: "string", enum: ["ok", "error"] },
                        },
                      },
                      version: { type: "string" },
                    },
                  },
                },
              },
            },
            "503": {
              description: "Serviço indisponível",
            },
          },
        },
      },
      "/torneios": {
        get: {
          summary: "Listar todos os torneios",
          tags: ["Torneios"],
          responses: {
            "200": {
              description: "Lista de torneios",
            },
          },
        },
      },
      "/torneios/{id}/jogos": {
        get: {
          summary: "Listar jogos de um torneio",
          tags: ["Jogos"],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "200": {
              description: "Lista de jogos",
            },
          },
        },
      },
      "/torneios/{id}/equipas": {
        get: {
          summary: "Listar equipas de um torneio",
          tags: ["Equipas"],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "200": {
              description: "Lista de equipas",
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtido após autenticação",
        },
      },
    },
    tags: [
      { name: "Sistema", description: "Endpoints de saúde e sistema" },
      { name: "Torneios", description: "Gestão de torneios" },
      { name: "Jogos", description: "Gestão de jogos e resultados" },
      { name: "Equipas", description: "Gestão de equipas" },
    ],
  };

  return NextResponse.json(openapi, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
