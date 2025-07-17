import {
  HttpMiddleware,
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from '@effect/platform';
import { BunHttpServer, BunRuntime } from '@effect/platform-bun';
import {
  Clock,
  Effect,
  Layer,
  Logger,
  LogLevel,
  Schema,
  Schedule,
} from 'effect';
import { WebSocketResponse } from '@todo/shared';

const ApiRouter = HttpRouter.empty.pipe(
  HttpRouter.get('/', HttpServerResponse.text('Hello, world!')),
  HttpRouter.get(
    '/ws',
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;

      yield* Effect.log('ws upgrade requested');

      const socket = yield* request.upgrade;

      // Handle incoming messages
      const messageHandler = socket.run((data) =>
        Effect.gen(function* () {
          const message =
            typeof data === 'string' ? data : new TextDecoder().decode(data);
          yield* Effect.log(`[ws] received: ${message}`);

          const timestamp = yield* Clock.currentTimeMillis;

          const response: WebSocketResponse = {
            timestamp,
            message,
          };

          const encoded = yield* Schema.encode(WebSocketResponse)(response);

          yield* Effect.scoped(
            Effect.gen(function* () {
              const write = yield* socket.writer;
              yield* write(JSON.stringify(encoded));
            }),
          );
        }),
      );

      // Broadcast timestamp every 5 seconds
      const timestampBroadcast = Effect.repeat(
        Effect.gen(function* () {
          const timestamp = yield* Clock.currentTimeMillis;
          const response: WebSocketResponse = {
            timestamp,
            message: 'Timestamp',
          };

          const encoded = yield* Schema.encode(WebSocketResponse)(response);

          yield* Effect.scoped(
            Effect.gen(function* () {
              const write = yield* socket.writer;
              yield* write(JSON.stringify(encoded));
            }),
          );
        }),
        Schedule.fixed('1 seconds'),
      );

      // Run both handlers concurrently
      yield* Effect.all([messageHandler, timestampBroadcast], {
        concurrency: 'unbounded',
        discard: true,
      });

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
