const { Actionary } = require("./src/services/actionary");

const ACTIONS = [
  "cloud.actions.hello_world",
];

exports.agent = function(request, response) {
  console.log("starting the agent...");

  new Actionary({ request, response })
    .use(Actionary.sdk.DialogflowApp)
    .setActions(ACTIONS)
    .i18n()
    .start();
};