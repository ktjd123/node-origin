import colors from "chalk";
import moment from "moment";

export enum logStatusEnum {
  SUCCESS,
  WARN,
  ERROR,
  INFO
}

const msgGen = (status: logStatusEnum, msg: string) => {
  let msgToShow = "";

  // SHOW TIME
  const currentDate = moment().format("YYYY-MM-DD hh:mm:ss");
  msgToShow += colors.cyan(`[${currentDate}] `);

  switch (status) {
    case logStatusEnum.SUCCESS:
      msgToShow += colors.green("[SUCCESS] ");
      break;
    case logStatusEnum.WARN:
      msgToShow += colors.yellowBright("[WARNING] ");
      break;
    case logStatusEnum.ERROR:
      msgToShow += colors.red("[ERROR] ");
      break;
    case logStatusEnum.INFO:
      msgToShow += colors.gray("[INFO] ");
      break;
  }

  msgToShow += msg;

  return msgToShow;
};

export const logger = {
  success: async (msg: string) => {
    console.log(msgGen(logStatusEnum.SUCCESS, msg));
  },
  info: async (msg: string) => {
    console.log(msgGen(logStatusEnum.INFO, msg));
  },
  warn: async (msg: string) => {
    console.warn(msgGen(logStatusEnum.WARN, msg));
  },
  error: async (msg: string) => {
    console.error(msgGen(logStatusEnum.ERROR, msg));
  }
};
