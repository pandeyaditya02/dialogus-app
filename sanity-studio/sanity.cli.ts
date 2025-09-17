import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'w77riyw5',
    dataset: 'production'
  },
  deployment: {
    appId: 'aq502ruilhlxzf0brwqcvmqa',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
