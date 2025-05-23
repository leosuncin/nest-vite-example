export interface JwtPayload {
  /**
   * The "exp" (expiration time) claim identifies the expiration time on
   * or after which the JWT MUST NOT be accepted for processing.  The
   * processing of the "exp" claim requires that the current date/time
   * MUST be before the expiration date/time listed in the "exp" claim.
   * Implementers MAY provide for some small leeway, usually no more than
   * a few minutes, to account for clock skew.
   *
   * Its value MUST be a number containing a NumericDate value.
   *
   * Use of this claim is OPTIONAL.
   *
   * @type {number}
   */
  exp: number;
  /**
   * The "iat" (issued at) claim identifies the time at which the JWT was
   * issued.  This claim can be used to determine the age of the JWT.  Its
   * value MUST be a number containing a NumericDate value.
   *
   * Use of this claim is OPTIONAL.
   *
   * @type {number}
   */
  iat: number;
  /**
   * The "sub" (subject) claim identifies the principal that is the
   * subject of the JWT.  The claims in a JWT are normally statements
   * about the subject.  The subject value MUST either be scoped to be
   * locally unique in the context of the issuer or be globally unique.
   * The processing of this claim is generally application specific.
   *
   * The "sub" value is a case-sensitive string containing a StringOrURI
   * value.
   *
   * Use of this claim is OPTIONAL.
   * @type {string}
   */
  sub: string;
  /**
   * The "aud" (audience) claim identifies the recipients that the JWT is
   * intended for.  Each principal intended to process the JWT MUST
   * identify itself with a value in the audience claim.  If the principal
   * processing the claim does not identify itself with a value in the
   * "aud" claim when this claim is present, then the JWT MUST be
   * rejected.  In the general case, the "aud" value is an array of case-
   * sensitive strings, each containing a StringOrURI value.
   *
   * In a multi-tenant system, this claim can be used to identify the tenant.
   *
   * Use of this claim is OPTIONAL.
   * @type {string}
   */
  aud: string;
  /**
   * The "iss" (issuer) claim identifies the principal that issued the
   * JWT.  The processing of this claim is generally application specific.
   * The "iss" value is a case-sensitive string containing a StringOrURI
   * value.
   *
   * Use of this claim is OPTIONAL.
   * @type {string}
   */
  iss: string;

  [claim: string]: string | number;
}
