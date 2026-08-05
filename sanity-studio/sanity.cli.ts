import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_API_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_API_DATASET!,
  },  
  deployment: {
    appId: process.env.SANITY_STUDIO_APP_ID!,
    autoUpdates: true,
  },
})
