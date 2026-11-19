export type OAuthProvider = "google" | "microsoft";

export const OAUTH_PROVIDERS = {
  google: {
    name: "Google",
    icon: "🔵",
    color: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300",
  },
  microsoft: {
    name: "Microsoft",
    icon: "🟦",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
  },
} as const;
