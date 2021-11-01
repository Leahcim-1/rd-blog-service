import Koa from 'koa'
import { dev, prod } from './config.js'
import {
  bodyMiddleware,
  qsMiddleware,
  paginationMiddleware,
  corsMiddleware,
  requestInterceptor,
  responseInterceptor
} from './middleware/index.js'
import router from './router/index.js'

const app = new Koa()
const env = process.env.NODE_ENV
const isDev = env === 'dev'
const HOST = isDev ? dev.host : prod.host
const PORT = isDev ? dev.port : prod.port

/* <- Middleware Below -> */

// Request Interceptor
app.use(requestInterceptor)

// Query String Parsing
app.use(qsMiddleware)

// CORS
app.use(corsMiddleware)

// Pose Body Parsing
app.use(bodyMiddleware)

// Response Interceptor
app.use(responseInterceptor)

// Response Pagination
app.use(paginationMiddleware)

/*
 * Server Listening
 */
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(PORT, HOST, () => {
  console.log('\n')
  console.log('-'.repeat(50))
  console.log('\nBlog Service')
  console.log('\nThis is Bender, the bending machine.\n')
  console.log(`Your damn server is starting at http://${HOST}:${PORT}\n`)
  console.log('-'.repeat(50))
})
