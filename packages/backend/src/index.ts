import { HttpRouter, HttpServer, HttpServerResponse } from '@effect/platform'
import { listen } from './listen'

const router = HttpRouter.empty.pipe(
  HttpRouter.get('/', HttpServerResponse.text('Hello, world!'))
)

const app = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress
)

listen(app, 3333)
