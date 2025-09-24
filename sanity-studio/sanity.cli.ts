import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_API_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_API_DATASET!,
  },  
  deployment: {
    appId: process.env.SANITY_STUDIO_APP_ID!,
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
