import BodyParser from 'koa-body'
import qs from 'qs'
import cors from '@koa/cors';

const qsMiddleware = async (ctx, next) => {
  const { querystring } = ctx.request
  ctx.qs = qs.parse(querystring)
  await next()
}

const bodyMiddleware = BodyParser()

const corsMiddleware = cors()

const paginationMiddleware = async (ctx, next) => {
  await next()

  const { body } = ctx.response
  if (!body) return

  const { links } = body
  if (!links || links.length === 0) return

  const cur = links.filter(l => l.rel === 'cur')
  if (cur.length === 0) return

  const query = cur[0].link.split('?')
  if (!query || query.length < 2) return

  const api = query[0]
  const queryString = query[1]

  const { limit: limitStr, offset: offsetStr } = qs.parse(queryString)

  const limit = parseInt(limitStr, 10)
  const offset = parseInt(offsetStr, 10)

  if (offset - limit >= 0) {
    links.push({
      rel: 'prev',
      link: `${api}?limit=${limit}&offset=${offset - limit}`
    })
  }

  links.push({
    rel: 'next',
    link: `${api}?limit=${limit}&offset=${offset + limit}`
  })

  body.links = links

  ctx.body = body
}

export {
  bodyMiddleware,
  paginationMiddleware,
  qsMiddleware,
  corsMiddleware
}
