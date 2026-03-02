export type TtsErrorCode =
  | 'INVALID_INPUT'
  | 'CONFIG_MISSING'
  | 'RATE_LIMIT'
  | 'UPSTREAM'
  | 'UNKNOWN'

export class TtsError extends Error {
  public readonly code: TtsErrorCode
  public readonly status: number
  public override readonly cause?: unknown

  constructor(params: { message: string; code: TtsErrorCode; status: number; cause?: unknown }) {
    super(params.message)
    this.name = 'TtsError'
    this.code = params.code
    this.status = params.status
    this.cause = params.cause
  }
}

export function asTtsError(error: unknown): TtsError {
  if (error instanceof TtsError) return error
  return new TtsError({
    message: error instanceof Error ? error.message : 'Unknown TTS error',
    code: 'UNKNOWN',
    status: 500,
    cause: error
  })
}
