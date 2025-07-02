import express, { Response } from 'express'
import { Request as JWTRequest } from 'express-jwt'
import cors from 'cors'
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import path from 'path'
import https from 'https'
import ax from 'axios'

const axios = ax.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
})

import { getConfig } from './config'
import { EvaluationRequest, EvaluationsRequest } from './interface'

dotenvExpand.expand(dotenv.config())

const app: express.Application = express()
app.use(express.json())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.options('*', cors())

const authzOptions = getConfig()

const PORT = authzOptions.port ?? 8080
const policyRoot = authzOptions.policyRoot ?? 'todoApp'

async function executeIsRequest(request: EvaluationRequest): Promise<boolean> {
  const payload = {
    "identity_context": {
      "type": "IDENTITY_TYPE_SUB",
      "identity": request.subject.id,
    },
    "policy_context": {
      "decisions": ["allowed"],
      "path": `${policyRoot}.${request.action.name}`,
    },
    "resource_context": {
      ...request.resource
    },
  }
  console.log(`Executing is request with payload: ${JSON.stringify(payload)}`)

  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
  }
  if (authzOptions.authorizerApiKey) {
    headers["Authorization"] = `basic ${authzOptions.authorizerApiKey}`
  }

  try {
    const response = await axios.post(
      `${authzOptions.authorizerServiceUrl}/api/v2/authz/is`,
      JSON.stringify(payload),
      {
        headers,
      }
    )
    if (response.status !== 200) {
      console.error(`Error from Authorizer: ${response.statusText}`)
      return false
    }
    if (!response.data || !response.data.decisions || !Array.isArray(response.data.decisions)) {
      console.error(`Unexpected response format from Authorizer: ${JSON.stringify(response.data)}`)
      return false
    }
    const decision = response.data.decisions[0]
    return decision.decision === 'allowed' && decision.is
  } catch (error) {
    console.error(`Error making request to Authorizer: ${(error as Error).message}`)
    return false
  }
}

async function evaluationHandler(req: JWTRequest, res: Response) {
  const decision = await executeIsRequest(req.body as EvaluationRequest)
  const response = JSON.stringify({
    decision,
  })

  res.status(200).send(response)
}

async function evaluationsHandler(req: JWTRequest, res: Response) {
  const request: EvaluationsRequest = req.body
  const evaluations = request.evaluations?.map((e) => ({
    subject: e.subject ?? request.subject,
    action: e.action ?? request.action,
    resource: e.resource ?? request.resource,
    context: e.context ?? request.context,
  })) ?? [request]
  try {
    const evalResponse = await Promise.all(
      evaluations.map(async (e) => {
        const decision = await executeIsRequest(e as EvaluationRequest)
        return { decision }
      })
    )
    res.status(200).json({ evaluations: evalResponse })
  } catch (error) {
    console.error(error)
    res.status(422).send({ error: (error as Error).message })
  }
}

app.post('/access/v1/evaluation', evaluationHandler)
app.post('/access/v1/evaluations', evaluationsHandler)

// main endpoint serves react bundle from /build
app.use(express.static(path.join(__dirname, '..', 'build')))
// serve all /ui client-side routes from the /build bundle
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
})
