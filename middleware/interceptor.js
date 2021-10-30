import Logger from '../util/logger.js'

const requestInterceptor = async ({ request }, next) => {
  Logger.log('\n\n')
  Logger.log(request.method, request.URL.pathname)
  Logger.log('Headers:', request.header)
  await next()
}

const responseInterceptor = async (ctx, next) => {
  await next()
  if (ctx.URL.pathname.includes('api')) {
    ctx.set({
      'Content-Type': 'application/json'
    })
  }
}

export {
  requestInterceptor,
  responseInterceptor
}
