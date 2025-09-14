import * as z from 'zod'

export function getJsonSchema(schema: z.ZodObject) {
  return JSON.stringify(z.toJSONSchema(schema), null, 2)
}
