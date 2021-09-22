export type GQLRequest = {
  url: string
  method: string
  headers: Headers
  json: () => Promise<any>
}
