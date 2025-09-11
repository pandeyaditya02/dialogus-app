import { defineLive } from 'next-sanity'
import { client } from './client.js'

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: 'vX',
  }),
})


