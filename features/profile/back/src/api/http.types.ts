/**
 * Tipos HTTP agnósticos al framework.
 */

export type HttpRequest<TBody = unknown> = {
  body: TBody;
  headers?: Record<string, string | undefined>;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
};

export type HttpResponse = {
  status: (code: number) => HttpResponse;
  json: (data: unknown) => void;
};

export type HttpHandler<TBody = unknown> = (
  req: HttpRequest<TBody>,
  res: HttpResponse,
) => void | Promise<void>;

export type HttpRouter = {
  post: <TBody = unknown>(path: string, handler: HttpHandler<TBody>) => void;
  get?: <TBody = unknown>(path: string, handler: HttpHandler<TBody>) => void;
};
