import {JsonRpcProvider} from "@ethersproject/providers";

const provider = new JsonRpcProvider("https://api.harmony.one");

export function getBalanceByBlockNumber(address, block){
	var result;
	provider.send('hmy_getBalanceByBlockNumber', [address, block]).then(r=>result=r);

	return result
}

// module.exports = getBalanceByBlockNumber; 
