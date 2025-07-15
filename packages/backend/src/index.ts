import { HttpMiddleware, HttpRouter, HttpServer, HttpServerResponse } from '@effect/platform'
import { BunHttpServer, BunRuntime } from '@effect/platform-bun'
import { Clock, Effect, Layer, Logger, LogLevel } from 'effect'

const ApiRouter = HttpRouter.empty.pipe(
  HttpRouter.get('/', HttpServerResponse.text('Hello, world!'))
)

const TimerMiddleware = HttpMiddleware.make((app) =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeNanos
    const response = yield* app
    const end = yield* Clock.currentTimeNanos
    yield* Effect.log(`Request took ${end - start}ns`)
    return response
  }))

const HttpLive = ApiRouter.pipe(
  HttpRouter.use(TimerMiddleware),
  HttpServer.serve(
    HttpMiddleware.logger
  ),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 3333 }))
)

BunRuntime.runMain(
  Layer.launch(HttpLive).pipe(
    Logger.withMinimumLogLevel(LogLevel.Debug)
  )
)
