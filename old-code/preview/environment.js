
const path = require('path')
var { config } = { config: {} }

config = {

  domain: 'preview.example.domain.com',

  workspace: {
    workspace: {
      //  baseUrl: "/preview",
      name: "preview",
      port: 5000
    },
    projects: [
      {
        baseUrl: "/ng2-rest-client",
        name: "ng2-rest-client",
        $db: false,
        port: 4001
      },
      {
        baseUrl: "/ng2-rest-server",
        name: "ng2-rest-server",
        $db: {
          database: "tmp/db.sqlite3",
          type: "sqlite",
          synchronize: true,
          dropSchema: true,
          logging: false
        },
        port: 4002
      }
    ]
  }

}
module.exports = exports = { config };
