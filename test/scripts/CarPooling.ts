import "@nomiclabs/hardhat-ethers"
import { ethers } from "hardhat";
import hre from "hardhat"

async function main() {
    const [acc1, acc2, acc3] = await ethers.getSigners()

    // const ERC20 = await ethers.getContractFactory("ERC20MANT")
    // const erc20 = await ERC20.deploy()
    // await erc20.deployed()
    // console.log(erc20.address)

    const Contract = await ethers.getContractFactory("Carpooling")
    const contract = await Contract.deploy("0xbC786A4Bd25555A1e36e9e79F919E4a91aAa8436")
    await contract.deployed()
    console.log(contract.address)



    // const filterApproval = {
    //     address: erc20.address,
    //     fromBlock: 0,
    //     toBlock: 'latest',
    //     topics: [
    //         ethers.utils.id("Approval(address,address,uint256)")
    //     ]
    // };
    
    // ethers.provider.on(filterApproval, (logs) => {
    //     try {
    //         const decodedLog = erc20.interface.decodeEventLog("Approval", logs.data, logs.topics);
    //         if(decodedLog.owner == acc2.address && decodedLog.spender == contract.address && decodedLog.amount == 5000){
    //             console.log("YEES")
    //         }
    //         // Additional actions when Approval event is emitted, e.g., update state or trigger other actions
    //     } catch (error) {
    //         console.error('Error decoding Approval event log:', error);
    //     }
    // });

    // await erc20.mint(acc2.address, 100000)

    // await erc20.connect(acc2).approve(contract.address, 10000)


    // await contract.connect(acc1).registerDriver("Driver Name", "189189")
    // await contract.connect(acc2).registerConsumer("Consumer Name", "87775050058", 10000)

    // const consumer = await contract.consumers(acc2.address)
    // // console.log(consumer)

    // const driver = await contract.drivers(acc1.address)
    // // console.log(driver)

    // await contract.connect(acc2).createOrder("Kabanbai batyr 60a/8", "Aktobe", 2000)
    // await contract.connect(acc2).createOrder("Kabanbai batyr 60a/8", "Aktobe", 2000)
    // await contract.connect(acc2).createOrder("Kabanbai batyr 60a/8", "Aktobe", 2000)
    // await contract.connect(acc2).createOrder("Kabanbai batyr 60a/8", "Aktobe", 2000)
    // await contract.connect(acc2).createOrder("Kabanbai batyr 60a/8", "Aktobe", 2000)


    // let orders = await contract.getOrders()

    // console.log(orders)

    // await contract.connect(acc1).acceptOrder(1)
    // await erc20.balanceOf(acc2.address).then(console.log)
    // await erc20.balanceOf(acc1.address).then(console.log)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
