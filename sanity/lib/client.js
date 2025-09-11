import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env.js'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})


