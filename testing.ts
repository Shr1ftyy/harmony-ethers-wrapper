"use strict";

import {HarmonyProviderV1} from './src/provider';
import { JsonRpcProvider } from "@ethersproject/providers";

const provider = new HarmonyProviderV1("https:/\/api.harmony.one");
// let r = '';
// provider.send('getBalance', ['one166c4yt606c5pd02jwr5wc7mkyd3lmktvutvqrw', '0x1']).then(r=>console.log(r)).catch(err=>console.log(err));

async function main(){
    let block = 0;
    await provider.getBlockNumber().then((r)=>{
        console.log(r);
        block = r;
    }).catch(err=>console.log(err));
    await provider.getBlock(11_720_574).then(c=>console.log(c)).catch(err=>console.log(err));

    provider.getBalance('0x9EDE2bE8a7bba06E6CD4Eef08b31fC7Ca82Cb0D1').then(r=>console.log(r)).catch(err=>console.log(err));
    provider.getGasPrice().then(r=>console.log(r)).catch(err=>console.log(err));
    provider.getNetwork().then(r=>console.log(r)).catch(err=>console.log(err));
}
 
main();