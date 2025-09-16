import * as z from 'zod'

export function getJsonSchema(schema: z.ZodObject) {
  return JSON.stringify(z.toJSONSchema(schema, { io: 'input' }), null, 2)
}
