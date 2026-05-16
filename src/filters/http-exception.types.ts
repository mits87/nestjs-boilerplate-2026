/**
 * Origin of a normalized validation error.
 */
export enum LocationType {
  HEADER = 'header',
  REQUEST_BODY = 'requestBody',
}

/**
 * Flattened validation error shape used internally before building the public API response.
 */
export interface ReducedValidationError {
  /** Property path pointing to the invalid request field. */
  readonly location: string;
  /** Request area that produced the validation error. */
  readonly locationType: LocationType.REQUEST_BODY;
  /** Human-readable validation error message. */
  readonly message: string;
}

/**
 * Public error item returned by the HTTP exception filter.
 */
export interface ErrorResponseItem {
  /** Stable error code exposed by the API. */
  readonly code: string;
  /** Optional property path pointing to the invalid field. */
  readonly location?: string;
  /** Optional request area associated with the error. */
  readonly locationType?: LocationType.REQUEST_BODY;
  /** Human-readable error message returned to the client. */
  readonly message: string;
}
