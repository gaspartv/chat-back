export interface IPayload {
  iat?: number;
  exp?: number;
  sign: ISign;
}

export interface ISign {
  sub: string;
}
