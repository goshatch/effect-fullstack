import {
  HttpMiddleware,
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from '@effect/platform';
import { BunHttpServer, BunRuntime } from '@effect/platform-bun';
import { Clock, Effect, Layer, Logger, LogLevel } from 'effect';

const ApiRouter = HttpRouter.empty.pipe(
  HttpRouter.get('/', HttpServerResponse.text('Hello, world!')),
  HttpRouter.get(
    '/ws',
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;

      yield* Effect.log('ws upgrade requested');

      const socket = yield* request.upgrade;

      yield* socket.run((data) =>
        Effect.gen(function* () {
          const message =
            typeof data === 'string' ? data : new TextDecoder().decode(data);
          yield* Effect.log(`[ws] received: ${message}`);

          yield* Effect.scoped(
            Effect.gen(function* () {
              const write = yield* socket.writer;
              yield* write(`[ws] echo: ${message}`);
            }),
          );
        }),
      );

      return HttpServerResponse.empty();
    }),
  ),
);

const TimerMiddleware = HttpMiddleware.make((app) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const { method, url } = request;

    const start = yield* Clock.currentTimeNanos;
    const response = yield* app;
    const end = yield* Clock.currentTimeNanos;

    yield* Effect.log(`${method} ${url} took ${end - start}ns`);

    return response;
  }),
);

const HttpLive = ApiRouter.pipe(
  HttpRouter.use(TimerMiddleware),
  HttpServer.serve(HttpMiddleware.logger),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 3333 })),
);

BunRuntime.runMain(
  Layer.launch(HttpLive).pipe(Logger.withMinimumLogLevel(LogLevel.Debug)),
);
