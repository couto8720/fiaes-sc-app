"use client";

import Link from "next/link";

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-azul-escuro to-azul-claro p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-azul-escuro mb-4">
            📚 API Documentation
          </h1>

          <p className="text-gray-700 mb-6">
            Fiães SC API is a RESTful API for managing tournaments, games, teams, and standings.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <h2 className="font-semibold text-blue-900 mb-2">
              🔍 Interactive OpenAPI Specification
            </h2>
            <p className="text-blue-800 mb-4">
              The full OpenAPI 3.1.0 specification is available. You can use any of these tools:
            </p>
            <ul className="text-blue-800 space-y-2">
              <li>
                📄{" "}
                <Link
                  href="/api/docs/openapi.json"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Raw OpenAPI JSON (/api/docs/openapi.json)
                </Link>
              </li>
              <li>
                🌐{" "}
                <a
                  href="https://swagger.io/tools/swagger-ui/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Swagger UI Online
                </a>
                {" "} (paste the OpenAPI spec)
              </li>
              <li>
                🔑{" "}
                <a
                  href="https://www.postman.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Postman
                </a>
                {" "} (import from URL or JSON)
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-azul-escuro mb-3">
                🏆 Endpoints
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    GET /api/health
                  </code>
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    GET /api/torneios
                  </code>
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    GET /api/torneios/[id]
                  </code>
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    GET /api/torneios/[id]/jogos
                  </code>
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-azul-escuro mb-3">
                🔐 Authentication
              </h3>
              <p className="text-gray-700 mb-3">
                Use Bearer token authentication:
              </p>
              <code className="bg-gray-100 px-3 py-2 rounded block text-sm mb-3">
                Authorization: Bearer {'<your-token>'}
              </code>
              <p className="text-sm text-gray-600">
                Get your token from /admin/login
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">
              ✅ Health Check
            </h3>
            <p className="text-green-800 text-sm mb-3">
              Monitor API status at:
            </p>
            <Link
              href="/api/health"
              className="text-green-600 hover:underline font-mono text-sm"
            >
              /api/health
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
