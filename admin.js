const AdminBro = require("admin-bro");
const AdminBroExpress = require("admin-bro-expressjs");
const AdminBroMongoose = require("admin-bro-mongoose");
const bcrypt = require('bcrypt')
const User = require("./models/User");

AdminBro.registerAdapter(AdminBroMongoose);

const adminBro = new AdminBro({
  rootPath: "/admin",
  resources: [
    {
      resource: User,
      options: {
        properties: {
          encryptedPassword: { isVisible: false },
          name: {
            isVisible: { list: true, filter: true, show: true, edit: true },
          },
          email: {
            isVisible: { list: true, filter: true, show: true, edit: true },
          },
          password: {
            isVisible: { list: false, filter: false, show: false, edit: true },
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if(request.payload.password) {
                request.payload.record = {
                  ...request.payload.record,
                  encryptedPassword: await bcrypt.hash(request.payload.password, 10),
                  password: undefined,
                }
              }
              return request
            },
          }
      },
    },
  }
  ],
  branding: {
    logo: "",
    companyName: "",
    softwareBrothers: false,
  },
});

module.exports = adminRouter = AdminBroExpress.buildRouter(adminBro);
