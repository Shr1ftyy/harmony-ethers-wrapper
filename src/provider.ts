"use strict";

import { TransactionRequest} from "@ethersproject/abstract-provider";
import { isHexString } from "@ethersproject/bytes";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getStatic } from "@ethersproject/properties";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);


const errorGas = [ "call", "estimateGas" ];

function checkError(method: string, error: any, params: any): any {
  // Undo the "convenience" some nodes are attempting to prevent backwards
  // incompatibility; maybe for v6 consider forwarding reverts as errors
  if (method === "call" && error.code === Logger.errors.SERVER_ERROR) {
    const e = error.error;
    if (e && e.message.match("reverted") && isHexString(e.data)) {
      return e.data;
    }
  }

  let message = error.message;
  if (error.code === Logger.errors.SERVER_ERROR && error.error && typeof(error.error.message) === "string") {
    message = error.error.message;
  } else if (typeof(error.body) === "string") {
    message = error.body;
  } else if (typeof(error.responseText) === "string") {
    message = error.responseText;
  }
  message = (message || "").toLowerCase();

  const transaction = params.transaction || params.signedTransaction;

  // "insufficient funds for gas * price + value + cost(data)"
  if (message.match(/insufficient funds/)) {
    logger.throwError("insufficient funds for intrinsic transaction cost", Logger.errors.INSUFFICIENT_FUNDS, {
      error, method, transaction
    });
  }

  // "nonce too low"
  if (message.match(/nonce too low/)) {
    logger.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {
      error, method, transaction
    });
  }

  // "replacement transaction underpriced"
  if (message.match(/replacement transaction underpriced/)) {
    logger.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {
      error, method, transaction
    });
  }

  if (errorGas.indexOf(method) >= 0 && message.match(/gas required exceeds allowance|always failing transaction|execution reverted/)) {
    logger.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
      error, method, transaction
    });
  }

  throw error;
}

function timer(timeout: number): Promise<any> {
  return new Promise(function(resolve) {
    setTimeout(resolve, timeout);
  });
}

function getResult(payload: { error?: { code?: number, data?: any, message?: string }, result?: any }): any {
  if (payload.error) {
    // @TODO: not any
    const error: any = new Error(payload.error.message);
    error.code = payload.error.code;
    error.data = payload.error.data;
    throw error;
  }

  return payload.result;
}

function getLowerCase(value: string): string {
  if (value) { return value.toLowerCase(); }
  return value;
}



export class HarmonyProvider extends JsonRpcProvider{
  prepareRequest(method: string, params: any): [ string, Array<any> ] {
  switch (method) {
      case "getBlockNumber":
    return [ "hmy_blockNumber", [] ];

      case "getGasPrice":
    return [ "eth_gasPrice", [] ];

      case "getBalance":
    return [ "hmy_getBalance", [ getLowerCase(params.address), params.blockTag ] ];

      case "getTransactionCount":
    return [ "hmy_getTransactionCount", [ getLowerCase(params.address), params.blockTag ] ];

      case "getCode":
    return [ "hmy_getCode", [ getLowerCase(params.address), params.blockTag ] ];

      case "getStorageAt":
    return [ "hmy_getStorageAt", [ getLowerCase(params.address), params.position, params.blockTag ] ];

      case "sendTransaction":
    return [ "hmy_sendRawTransaction", [ params.signedTransaction ] ]

      case "getBlock":
    if (params.blockTag) {
          return [ "hmy_getBlockByNumber", [ params.blockTag, !!params.includeTransactions ] ];
    } else if (params.blockHash) {
          return [ "hmy_getBlockByHash", [ params.blockHash, !!params.includeTransactions ] ];
    }
    return null;

      case "getTransaction":
    return [ "hmy_getTransactionByHash", [ params.transactionHash ] ];

      case "getTransactionReceipt":
    return [ "hmy_getTransactionReceipt", [ params.transactionHash ] ];

      case "call": {
    const hexlifyTransaction = getStatic<(t: TransactionRequest, a?: { [key: string]: boolean }) => { [key: string]: string }>(this.constructor, "hexlifyTransaction");
    return [ "hmy_call", [ hexlifyTransaction(params.transaction, { from: true }), params.blockTag ] ];
      }

      case "estimateGas": {
    const hexlifyTransaction = getStatic<(t: TransactionRequest, a?: { [key: string]: boolean }) => { [key: string]: string }>(this.constructor, "hexlifyTransaction");
    return [ "hmy_estimateGas", [ hexlifyTransaction(params.transaction, { from: true }) ] ];
      }

      case "getLogs":
    if (params.filter && params.filter.address != null) {
          params.filter.address = getLowerCase(params.filter.address);
    }
    return [ "hmy_getLogs", [ params.filter ] ];

      default:
    break;
  }

  return null;
  }
}
