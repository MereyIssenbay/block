import { createStore } from 'vuex'
import { cpABI } from "@/contracts/Carpooling.abi"
import { cpBytecode } from '@/contracts/Carpooling.bin'

import { ercABI } from '@/contracts/ERC20MANT.abi'
import { ercBytecode } from '@/contracts/ERC20MANT.bin'

//ERC20 : 0xbC786A4Bd25555A1e36e9e79F919E4a91aAa8436
//MAIN CONTRACT: 0xF60A89f7F196223C8A9D6345c9a38cDA71166843

const ethers = require('ethers')
let provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/UqJsOz1IQnRrGqV9bh7Q7ziNR2rN7Pi7")

export default createStore({
    state: {
        address: "",
        chainId: "",
        chain: "",
        deployHash: "",
        contractAddress: "0xF60A89f7F196223C8A9D6345c9a38cDA71166843",
        contract: {},
        erc20address: "0xbC786A4Bd25555A1e36e9e79F919E4a91aAa8436",
        userType: ""
    },
    getters: {
    },
    mutations: {
    },
    actions: {
        async connectWallet({ state }) {
            // проверяем, что есть метамаск и подключаем его
            if (typeof window.ethereum !== 'undefined') {
                console.log("Ethereum client installed!")
                if (ethereum.isMetaMask === true) {
                    console.log("Metamask installed!")
                    if (ethereum.isConnected() !== true) {
                        console.log("Metamask is not connected!")
                        await ethereum.enable()
                        state.isConnected = true;
                        state.buttonText = 'Connected';
                    }
                    console.log("Metamask connected!")
                    state.isConnected = true;
                    state.buttonText = 'Connected';
                }
                else {
                    alert("Metamask is not installed!")
                }
            }
            else {
                alert("Ethereum client is not installed!")
            }

            ethereum.on('disconnect', () => {
                state.isConnected = false;
                state.buttonText = 'Connect MetaMask';
            });
            // создаём провайдера
            provider = new ethers.providers.Web3Provider(ethereum)

            // подключаем аккаунт
            await ethereum.request({ method: "eth_requestAccounts" })
                .then(accounts => {
                    state.address = ethers.utils.getAddress(accounts[0])
                    state.signer = provider.getSigner()
                    console.log(`Account ${state.address} connected`)
                    alert("Connected!")
                })
            // получаем параметры сети 
            state.chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log("chainId: ", state.chainId)
            if (state.chainId == "0x1") {
                state.chain = "mainnet"
            }
            else if (state.chainId == "0x5") {
                state.chain = "goerli"
                provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/TS8hjejOOd_2UNj46exSTVtqS7-JxYrT")
                state.contract = new ethers.Contract(state.contractAddress, cpABI, provider)
            }
            else if (state.chainId == "0x539") {
                state.chain = "ganache"
                provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545")
                state.contract = new ethers.Contract(state.contractAddress, cpABI, provider)
            }
            else if (state.chainId == "0x13881") {
                state.chain = "mumbai"
                provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/wusrTgSFSsScFKTK6Nqa5rFoisfYXjPW")
                state.contract = new ethers.Contract(state.contractAddress, cpABI, provider)
            }
            else if (state.chainId == "0xaa36a7") {
                state.chain = "sepolia"
                provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/UqJsOz1IQnRrGqV9bh7Q7ziNR2rN7Pi7")
                state.contract = new ethers.Contract(state.contractAddress, cpABI, provider)
            }

            ethereum.on('accountsChanged', (accounts) => {
                state.address = ethers.utils.getAddress(accounts[0])
                state.signer = provider.getSigner()
                console.log(`accounts changed to ${state.address}`)
            })

            ethereum.on('chainChanged', async (chainId) => {
                // создаём провайдера
                provider = new ethers.providers.Web3Provider(ethereum)
                // получаем параметры сети 
                state.chainId = await window.ethereum.request({ method: 'eth_chainId' });
                console.log(`chainId changed to ${state.chainId}`)

                if (state.chainId == "0x1") {
                    state.chain = "mainnet"
                    alert(`chain changed to ${state.chain}`)
                }
                else if (state.chainId == "0x5") {
                    state.chain = "goerli"
                    provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/TS8hjejOOd_2UNj46exSTVtqS7-JxYrT")
                    alert(`chain changed to ${state.chain}`)

                }
                else if (state.chainId == "0x539") {
                    state.chain = "ganache"
                    provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545")
                    alert(`chain changed to ${state.chain}`)

                }
                else if (state.chainId == "0x13881") {
                    state.chain = "mumbai"
                    provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/wusrTgSFSsScFKTK6Nqa5rFoisfYXjPW")
                    alert(`chain changed to ${state.chain}`)
                }
                else if (state.chainId == "0xaa36a7") {
                    state.chain = "sepolia"
                    provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/UqJsOz1IQnRrGqV9bh7Q7ziNR2rN7Pi7")
                    alert(`chain changed to ${state.chain}`)
                }
            })
        },
        async registerDriver({state}, args){
            const[fullName, documentNumber] = args
            console.log(fullName, documentNumber)

            const iContract = new ethers.utils.Interface(cpABI)
            const data = iContract.encodeFunctionData("registerDriver", [fullName, documentNumber])

            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: state.address,
                    to: state.contractAddress,
                    data: data
                }]
            })
            console.log(`Tx hash: ${txHash}`)

            console.log("Registered succesfully!")
            return txHash
        },
        async registerConsumer({state}, args){
            const[fullName, phoneNumber, initalBalance] = args
            console.log(fullName, phoneNumber, initalBalance)
            const iContract = new ethers.utils.Interface(cpABI)
            const data = iContract.encodeFunctionData("registerConsumer", [fullName, phoneNumber, initalBalance])

            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: state.address,
                    to: state.contractAddress,
                    data: data
                }]
            })
            console.log(`Tx hash: ${txHash}`)

            console.log("Registered succesfully!")
            return txHash
        },
        async createOrder({state}, args){
            const[startPoint, endPoint, amount] = args

            const iContract = new ethers.utils.Interface(cpABI)
            const data = iContract.encodeFunctionData("createOrder", [startPoint, endPoint, amount])

            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: state.address,
                    to: state.contractAddress,
                    data: data
                }]
            })
            console.log(`Tx hash: ${txHash}`)

            console.log("Order created succesfully!")
            return txHash
        },
        async getOrders({state}){
            const orders = await state.contract.getOrders({from:state.address})
            console.log(orders)
            return orders
        },
        async acceptOrder({state}, args){
            const[orderId] = args

            const iContract = new ethers.utils.Interface(cpABI)
            const data = iContract.encodeFunctionData("acceptOrder", [orderId])

            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: state.address,
                    to: state.contractAddress,
                    data: data
                }]
            })
            console.log(`Tx hash: ${txHash}`)

            console.log("Order accepted succesfully!")
            return txHash
        },
        async rejectOrder({state}, args){
            const[orderId] = args

            const iContract = new ethers.utils.Interface(cpABI)
            const data = iContract.encodeFunctionData("rejectOrder", [orderId])

            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: state.address,
                    to: state.contractAddress,
                    data: data
                }]
            })
            console.log(`Tx hash: ${txHash}`)

            console.log("Order rejected succesfully!")
            return txHash
        },
        async withdraw({state}){
            const iContract = new ethers.utils.Interface(cpABI)
            const data = iContract.encodeFunctionData("withdraw")

            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: state.address,
                    to: state.contractAddress,
                    data: data
                }]
            })
            console.log(`Tx hash: ${txHash}`)

            console.log("Tokens were succesfully withdrawn")
            return txHash
        },
        async isDriver({state}, args){
            const[address] = args
            const isDriver = await state.contract.isDriver(address)
            return isDriver
        },
        async isConsumer({state}, args){
            const[address] = args
            const isConsumer = await state.contract.isConsumer(address)
            return isConsumer
        },
        async consumers({state}, args){
            const[address] = args
            const consumer = await state.contract.consumers(address)
            return consumer
        },
        async drivers({state}, args){
            const[address] = args
            const driver = await state.contract.drivers(address)
            return driver
        },
        async orders({state}, args){
            const[orderId] = args
            const order = await state.contract.orders(orderId)
            return order
        },
        async orderCount({state}){
            const orderCount = await state.contract.orderCount()
            return orderCount
        },
        async mantToken({state}){
            const tokenAddress = await state.contract.mantToken()
            return tokenAddress
        },
        async getAllowance({state}){
            const erc20contract = new ethers.Contract(state.erc20address, ercABI, provider)
            if(await erc20contract.allowance(state.address, state.contractAddress) > 0){
                return true
            }
            else{
                return false
            }
        },
        async getBalance({state}){
            const erc20contract = new ethers.Contract(state.erc20address, ercABI, provider)
            return await erc20contract.balanceOf(state.address)
        },
        async rechargeBalance({state}, args){
            const [amount] = args
            const iContract = new ethers.utils.Interface(cpABI)

            const data = iContract.encodeFunctionData("rechargeBalance", [amount])

            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: state.address,
                    to: state.contractAddress,
                    data: data
                }]
            })
            console.log(`Tx hash: ${txHash}`)

            console.log("Tokens were succesfully recharged")
            return txHash
        }
        // async listenForApprovalEvent({ state, commit }) {
        //     const erc20contract = new ethers.Contract(state.erc20address, ercABI, provider)
        //     console.log(erc20contract)

        //     const filterApproval = {
        //         address: state.erc20address,
        //         fromBlock: 0,
        //         toBlock: 'latest',
        //         topics: [
        //             ethers.utils.id("Approval(address,address,uint256)")
        //         ]
        //     };
            
        //     provider.on(filterApproval, (logs) => {
        //         try {
        //             const decodedLog = erc20contract.interface.decodeEventLog("Approval", logs.data, logs.topics);
        //             if(decodedLog.owner == state.address && decodedLog.spender == state.contractAddress){
        //                 return true
        //             }
        //             else {
        //                 return false
        //             }
        //             // Additional actions when Approval event is emitted, e.g., update state or trigger other actions
        //         } catch (error) {
        //             console.error('Error decoding Approval event log:', error);
        //         }
        //     });
        // },
    },
    modules: {
    }
})
