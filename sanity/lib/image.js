import createImageUrlBuilder from '@sanity/image-url'
import { dataset, projectId } from '../env.js'

const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source) => builder.image(source)


