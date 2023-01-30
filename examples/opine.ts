import { opine, OpineRequest } from 'https://deno.land/x/opine@2.3.3/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'https://esm.sh/@graphql-tools/schema@9.0.14'
import { gql } from 'https://deno.land/x/graphql_tag@0.1.0/mod.ts'
import { readAll } from 'https://deno.land/std@0.175.0/streams/read_all.ts'

type Request = OpineRequest & { json: () => Promise<any> }

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: (
      _root: undefined,
      _args: unknown,
      ctx: { request: Request },
      info: { fieldName: string },
    ) => {
      return `Hello World from ${ctx.request.originalUrl}!. You have called ${info.fieldName}`
    },
  },
}

const dec = new TextDecoder()

const schema = makeExecutableSchema({ resolvers, typeDefs })

const app = opine()

app
  .use('/graphql', async (req, res) => {
    const request = req as Request

    request.json = async () => {
      const rawBody = await readAll(req.raw)
      return JSON.parse(dec.decode(rawBody))
    }

    const resp = await GraphQLHTTP<Request>({
      schema,
      context: (request) => ({ request }),
      graphiql: true,
    })(request)

    for (const [k, v] of resp.headers.entries()) res.headers?.append(k, v)

    res.status = resp.status

    res.send(await resp.text())
  })
  .listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
