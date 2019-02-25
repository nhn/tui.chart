# A minimal requirejs configuration
require.config
  baseUrl: '/base'
  deps: ['test']
  callback: ->
    window.__karma__.start()
