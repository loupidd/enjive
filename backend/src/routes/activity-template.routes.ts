import type { FastifyInstance } from "fastify"
import { authenticate, requireMinRole } from "../middlewares/auth.middleware.js"
import { activityTemplateRepository } from "../repositories/activity-template.repository.js"
import { successResponse, paginationMeta } from "../types/api.js"
import { Role } from "../types/enums.js"
import { z } from "zod"

const createSchema = z.object({
  equipmentType:  z.string().min(1).max(100).trim(),
  classification: z.string().min(1).max(100).trim(),
  interval:       z.string().min(1).max(50).trim(),
  name:           z.string().min(1).max(200).trim(),
  type:           z.string().min(1).max(100).trim(),
  answerType:     z.enum(["Qualitative","Quantitative","Custom"]).default("Qualitative"),
  unit:           z.string().max(50).optional().default(""),
  optimum:        z.string().max(50).optional().default(""),
  min:            z.string().max(50).optional().default(""),
  max:            z.string().max(50).optional().default(""),
  sort:           z.coerce.number().int().min(1).default(1),
  status:         z.enum(["Enable","Disable"]).default("Enable"),
})

const updateSchema = createSchema.partial().omit({ equipmentType:true, classification:true, interval:true })

const bulkSchema = z.object({
  items: z.array(createSchema).min(1).max(100),
})

const querySchema = z.object({
  equipmentType:  z.string().optional(),
  classification: z.string().optional(),
  interval:       z.string().optional(),
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().positive().max(500).default(200),
})

export async function activityTemplateRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate)

  // GET /api/v1/activity-templates
  fastify.get("/", async (req, reply) => {
    const q = querySchema.parse(req.query)
    const { items, total } = await activityTemplateRepository.findAll(q)
    return reply.send(successResponse(items, undefined, paginationMeta(total, q.page, q.limit)))
  })

  // POST /api/v1/activity-templates
  fastify.post("/", { preHandler: requireMinRole(Role.TECHNICIAN) }, async (req, reply) => {
    const data = createSchema.parse(req.body)
    const item = await activityTemplateRepository.create(data)
    return reply.status(201).send(successResponse(item, "Activity template created"))
  })

  // POST /api/v1/activity-templates/bulk
  fastify.post("/bulk", { preHandler: requireMinRole(Role.MANAGER) }, async (req, reply) => {
    const { items } = bulkSchema.parse(req.body)
    const result = await activityTemplateRepository.bulkCreate(items)
    return reply.status(201).send(successResponse(result, `${items.length} templates created`))
  })

  // PATCH /api/v1/activity-templates/:id
  fastify.patch("/:id", { preHandler: requireMinRole(Role.TECHNICIAN) }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateSchema.parse(req.body)
    const item = await activityTemplateRepository.update(id, data)
    return reply.send(successResponse(item, "Updated"))
  })

  // DELETE /api/v1/activity-templates/:id
  fastify.delete("/:id", { preHandler: requireMinRole(Role.MANAGER) }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await activityTemplateRepository.remove(id)
    return reply.send(successResponse(null, "Deleted"))
  })
}
