import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
// import path from "path";
dotenv.config({path: __dirname+'/.env' });

const config: HardhatUserConfig = {
    solidity: {
        compilers:[
            {version: "0.8.19"},
            {version: "0.5.16"},
            {version: "0.5.0"},
            {version: "0.8.15"},
            {version: "0.8.21"}
        ]
    },
    defaultNetwork: "sepolia",
    networks:{
        hardhat:{
            loggingEnabled: false,
        },
        sepolia:{
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [ process.env.SEPOLIA_PRIVATE_KEY || "", process.env.SEPOLIA_PRIVATE_KEY_2 || ""]           
        },
    }
};

export default config;
