export function rethrowNavigationError(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string"
  ) {
    const digest = (error as { digest: string }).digest;
    if (
      digest.startsWith("NEXT_REDIRECT") ||
      digest.startsWith("NEXT_NOT_FOUND") ||
      digest.startsWith("NEXT_HTTP_ERROR_FALLBACK")
    ) {
      throw error;
    }
  }
}
