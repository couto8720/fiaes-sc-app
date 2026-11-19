export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
  errors: string[];
}

export function validatePassword(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  const feedback: string[] = [];
  let score = 0;

  // Verificações básicas
  if (!password) {
    errors.push("Password é obrigatória");
    return { isValid: false, score: 0, feedback, errors };
  }

  // 1. Comprimento mínimo (12 caracteres)
  if (password.length < 12) {
    errors.push(`Password deve ter no mínimo 12 caracteres (tem ${password.length})`);
  } else {
    score += 25;
    feedback.push("✓ Comprimento adequado (12+ caracteres)");
  }

  // 2. Letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push("Password deve conter pelo menos uma letra maiúscula (A-Z)");
  } else {
    score += 20;
    feedback.push("✓ Contém letra maiúscula");
  }

  // 3. Letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push("Password deve conter pelo menos uma letra minúscula (a-z)");
  } else {
    score += 20;
    feedback.push("✓ Contém letra minúscula");
  }

  // 4. Número
  if (!/[0-9]/.test(password)) {
    errors.push("Password deve conter pelo menos um número (0-9)");
  } else {
    score += 15;
    feedback.push("✓ Contém número");
  }

  // 5. Caractere especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(
      "Password deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{}';:\"\\|,.<>/?)"
    );
  } else {
    score += 20;
    feedback.push("✓ Contém caractere especial");
  }

  // 6. Sem padrões comuns fracos
  const commonPatterns = [
    "123456",
    "password",
    "qwerty",
    "admin",
    "letmein",
    "welcome",
    "monkey",
  ];

  if (commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
    errors.push("Password contém um padrão comum e é muito fraca");
    score = Math.max(0, score - 30);
  }

  // 7. Sem sequências óbvias (abc, 123, etc)
  const hasSequence = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
    password
  );

  if (hasSequence) {
    feedback.push("⚠ Password contém sequência óbvia");
    score = Math.max(0, score - 10);
  }

  // Verificar se é válida
  const isValid = errors.length === 0;

  return {
    isValid,
    score: Math.max(0, Math.min(100, score)),
    feedback,
    errors,
  };
}

export function getPasswordStrengthLevel(score: number): {
  level: "muito_fraca" | "fraca" | "media" | "forte" | "muito_forte";
  color: string;
} {
  if (score < 20) {
    return { level: "muito_fraca", color: "bg-red-600" };
  } else if (score < 40) {
    return { level: "fraca", color: "bg-orange-600" };
  } else if (score < 60) {
    return { level: "media", color: "bg-yellow-600" };
  } else if (score < 80) {
    return { level: "forte", color: "bg-green-600" };
  } else {
    return { level: "muito_forte", color: "bg-green-700" };
  }
}

export function getPasswordStrengthLabel(level: string): string {
  const labels: Record<string, string> = {
    muito_fraca: "Muito Fraca",
    fraca: "Fraca",
    media: "Média",
    forte: "Forte",
    muito_forte: "Muito Forte",
  };

  return labels[level] || "Desconhecida";
}
