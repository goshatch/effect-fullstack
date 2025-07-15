import type { HttpPlatform, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Layer } from "effect";

export const listen = (
  app: Layer.Layer<
    never,
    never,
    HttpPlatform.HttpPlatform | HttpServer.HttpServer
  >,
  port: number
) =>
  BunRuntime.runMain(
    Layer.launch(Layer.provide(app, BunHttpServer.layer({ port })))
  )
