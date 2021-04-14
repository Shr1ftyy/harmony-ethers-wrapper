"use strict";
import { Formatter } from "@ethersproject/providers";
import { getAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import { isHexString, hexDataSlice}  from "@ethersproject/bytes";


export class HarmonyFormatter extends Formatter{
    callAddress(value: any): string {
        if (!isHexString(value, 32)) { return null; }
        const address = getAddress(hexDataSlice(value, 12));
        return (address === AddressZero) ? null: address;
    }

}