import { createClient } from '@sanity/client'

import { apiVersion, dataset, projectId } from '../env.js'

export const client = createClient({
  projectId: projectId,
  dataset: dataset,
  apiVersion: apiVersion,
  useCdn: true,
})


