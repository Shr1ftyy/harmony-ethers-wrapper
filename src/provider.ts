"use strict";

/*
TODO:
- figure out how to modify certain classes from ethers to support getBalance with 'one', 
only eth addresses are currently supported by ethers' provider/base-provider and address  
- look into types

*/

import { JsonRpcProvider } from "@ethersproject/providers";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);


// const errorGas = [ "call", "estimateGas" ];


export class HarmonyProviderV1 extends JsonRpcProvider{

    prepareRequest(method: string, params: any): [ string, Array<any> ] {
        switch (method) {
            // going to add more stuff here

            default:
                let [rpc_method, rpc_params] = super.prepareRequest(method, params);
        
                if (rpc_method.startsWith("eth")) {
                    rpc_method = rpc_method.replace("eth", "hmy");
                }
        
                return [rpc_method, rpc_params];
        }
    }

}
