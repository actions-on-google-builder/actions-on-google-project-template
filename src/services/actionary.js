//#region debugging
const DEBUG_NS = "actions-on-google:actionary";
process.env.DEBUG = `${DEBUG_NS}:*`;
process.env.DEBUG_DEPTH = 2;
process.env.DEBUG_COLORS = true;
process.env.DEBUG_SHOW_HIDDEN = true;
const Debug = require("debug");
//#endregion

const path = require("path");
const fs = require("fs");

const i18n = require('@manekinekko/actions-on-google-i18n');
const sdk = require("actions-on-google");
const DialogflowApp = sdk.DialogflowApp;
const ActionsSdkApp = sdk.ActionsSdkApp;
const moment = require("moment");


const assert = (predicate, expecting, actual) => {
  if (predicate === false) {
    throw new Error(
      `[Actionary] Assertion failed: Expecting "${expecting}". Got "${actual}"`
    );
    return false;
  }
};

class Actionary {
  constructor({ request, response, sessionStarted }) {
    this.reqRes = { request, response, sessionStarted };
    this.assistant = null;
    this.actionMap = new Map();
  }

  use(type) {
    assert(
      typeof type === "function" &&
        /(DialogflowApp|ActionsSdkApp)/.test(type.name),
      "ActionsSdkApp|DialogflowApp",
      typeof type
    );

    this.assistant = new type(this.reqRes);
    this.patch(this.assistant);
    return this;
  }

  i18n(config = null) {
    let _i18n = i18n;
    if (config) {
      _i18n = i18n.configure({
        directory: `${__dirname}/src/locales`,
        defaultFile: `${__dirname}/src/locales/index.json`,
        defaultLocale: 'en-US',
      });
    }
    _i18n.use(this.assistant);
  }

  patch(instance) {
    instance.hasScreen = () => {
      return instance.hasSurfaceCapability(
        instance.SurfaceCapabilities.SCREEN_OUTPUT
      );
    };
    instance.hasAudio = () => {
      return instance.hasSurfaceCapability(
        instance.SurfaceCapabilities.AUDIO_OUTPUT
      );
    };

    instance.getDateTimeFromRequest = () => {
      // clean DialogFlow time format
      let ts = instance.body_.timestamp.split(".")[0];
      ts = +moment(ts).add(1, "hour");
      return ts;
    };

    instance.error = Debug(`${DEBUG_NS}:error`);
    instance.debug = Debug(`${DEBUG_NS}:debug`);
  }

  setActions(actions) {
    assert(Array.isArray(actions), "Array", typeof actions);

    actions.map(action => {
      const file = action.replace(/\./g, path.sep) + ".js";
      this.setAction(action, file);
    });
    return this;
  }

  setAction(actionName, file) {
    const filePath = path.join(process.cwd(), "src", "actionary", `${file}`);
    assert(fs.existsSync(filePath), "File", "NOT_FOUND");

    this.actionMap.set(actionName, require(filePath));
    return this;
  }

  start() {
    assert(
      typeof this.assistant === "object",
      "ActionsSdkApp|DialogflowApp",
      typeof this.assistant
    );

    this.assistant.handleRequest(this.actionMap);
  }
}

const ActionaryMock = {
  SurfaceCapabilities: {
    SCREEN_OUTPUT: 1
  },
  hasScreen() {
    return true;
  },
  hasSurfaceCapability() {
    return false;
  },
  getArgument(key) {
    return key;
  },
  ask(text) {},
  tell(text) {},
  askWithList(text) {
    this.text = text;
  },
  getContextArgument() {
    return {
      key: "value"
    };
  },
  // i18n
  __(key, context={}) {},
};

module.exports = {
  Actionary,
  ActionaryMock
};