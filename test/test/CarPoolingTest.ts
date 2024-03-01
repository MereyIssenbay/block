import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import "@nomiclabs/hardhat-ethers"
import { ethers } from "hardhat";

describe("Test for taxi contract", () => {
    async function deploy(){
        const [owner, acc1, acc2, acc3] = await ethers.getSigners()
        let amount : number = 1000
        let zeroAddress = ethers.constants.AddressZero
        let driverName: string = "Driver name"
        let consumerName: string = "Consumer name"
        let documentNumber: string = "111"
        let phoneNumber: string = "808"
        let startPoint: string = "A point"
        let endPoint: string = "B point"

        const ERC20 = await ethers.getContractFactory("ERC20TAXI")
        const erc20 = await ERC20.connect(owner).deploy()
        await erc20.deployed()

        const Contract = await ethers.getContractFactory("Carpooling")
        const contract = await Contract.deploy(erc20.address)
        await contract.deployed()

        await erc20.connect(owner).mint(acc1.address, amount)
        await erc20.connect(acc1).approve(contract.address, amount)

        return {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint}
    }

    
    describe("Deployment", () => {
        it("check constructor values of contract", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract} = await loadFixture(deploy)

            expect(await contract.mantToken()).to.be.equal(erc20.address)
        })
        it("check user approved tokens contract", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract} = await loadFixture(deploy)

            expect(await erc20.allowance(acc1.address, contract.address)).to.be.equal(amount)
        })
    })
    describe("Registration", () => {
        it("check driver registration", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber} = await loadFixture(deploy)
            
            await contract.connect(acc2).registerDriver(driverName, documentNumber)
            expect(await contract.isDriver(acc2.address)).to.be.equal(true)
            const expectedStruct = {
                fullName: driverName,
                documentNumber: documentNumber
            }

            const returnStruct = await contract.drivers(acc2.address)
            expect(returnStruct.fullName).to.be.equal(expectedStruct.fullName)
            expect(returnStruct.documentNumber).to.be.equal(expectedStruct.documentNumber)
        })
        it("check consumer registration", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber} = await loadFixture(deploy)
            
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            expect(await contract.isConsumer(acc1.address)).to.be.equal(true)
            const expectedStruct = {
                fullName: consumerName,
                phoneNumber: phoneNumber,
                balance: amount
            }

            const returnStruct = await contract.consumers(acc1.address)
            expect(returnStruct.fullName).to.be.equal(expectedStruct.fullName)
            expect(returnStruct.phoneNumber).to.be.equal(expectedStruct.phoneNumber)
            expect(returnStruct.balance).to.be.equal(expectedStruct.balance)
        })
        it("check registration requires", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber} = await loadFixture(deploy)
            
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)

            await expect(contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)).to.be.revertedWith("User is already registered")

            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await expect(contract.connect(acc2).registerDriver(driverName, documentNumber)).to.be.revertedWith("User is already registered")
        })
        it("check registration events", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber} = await loadFixture(deploy)
            
            await expect(contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount))
            .to.emit(contract, "ConsumerRegistered").withArgs(acc1.address, consumerName, phoneNumber, amount)

            await expect(contract.connect(acc2).registerDriver(driverName, documentNumber))
            .to.emit(contract, "DriverRegistered").withArgs(acc2.address, driverName, documentNumber)


        })
        it("check consumer tokens transfered to contract", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber} = await loadFixture(deploy)
            
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            
            expect(await erc20.balanceOf(contract.address)).to.be.equal(amount)
        })
    })
    describe("Create Order", () => {
        it("check order created", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            
            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            const orderCount = await contract.orderCount()

            const expectedStruct = {
                orderId: orderCount,
                consumer: acc1.address,
                startPoint: startPoint,
                endPoint: endPoint,
                amount: amount,
                accepted: false
            }
            const returnStruct = await contract.orders(orderCount)

            //антонлох
            expect(expectedStruct.orderId).to.be.equal(returnStruct.orderId)
            expect(expectedStruct.consumer).to.be.equal(returnStruct.consumer)
            expect(expectedStruct.startPoint).to.be.equal(returnStruct.startPoint)
            expect(expectedStruct.endPoint).to.be.equal(returnStruct.endPoint)
            expect(expectedStruct.amount).to.be.equal(returnStruct.amount)
            expect(expectedStruct.accepted).to.be.equal(returnStruct.accepted)
        })
        it("check consumber balance dicreased", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)

            const balanceBefore = (await contract.consumers(acc1.address)).balance
            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            expect((await contract.consumers(acc1.address)).balance).to.be.equal(balanceBefore.sub(amount))
        })
        it("checke events", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            
            await expect(contract.connect(acc1).createOrder(startPoint, endPoint, amount))
            .to.emit(contract, "OrderCreated").withArgs(1, acc1.address, startPoint, endPoint, amount)
        })
        it("check requires", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            //Driver can`t create
            await expect(contract.connect(acc2).createOrder(startPoint, endPoint, amount)).to.be.revertedWith("Only consumer function")
            //Non-registered can`t create 
            await expect(contract.connect(acc3).createOrder(startPoint, endPoint, amount)).to.be.revertedWith("Only consumer function") 
            //Not enough balance
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await expect(contract.connect(acc1).createOrder(startPoint, endPoint, amount+1)).to.be.revertedWith("Insufficient funds") 
        })
    })
    describe("Get Orders", () => {
        it("check order came correct", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            const availableOrders = await contract.connect(acc2).getOrders();

            expect(availableOrders.length).to.equal(1);
            expect(availableOrders[0].orderId).to.equal(1);
            expect(availableOrders[0].consumer).to.equal(acc1.address);
            expect(availableOrders[0].startPoint).to.equal(startPoint);
            expect(availableOrders[0].endPoint).to.equal(endPoint);
            expect(availableOrders[0].amount).to.equal(amount);
            expect(availableOrders[0].accepted).to.be.false;
        })
        it("check require", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            await expect(contract.connect(acc1).getOrders()).to.be.revertedWith("Only driver function")
        })
    })
    describe("Accept order", () => {
        it("check order accepted", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            const availableOrders = await contract.connect(acc2).getOrders();
            const orderId = availableOrders[0].orderId

            await contract.connect(acc2).acceptOrder(orderId)

            expect((await contract.orders(orderId)).accepted).to.be.equal(true)
        })
        it("check driver get his tokens", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            const availableOrders = await contract.connect(acc2).getOrders();
            const orderId = availableOrders[0].orderId

            await contract.connect(acc2).acceptOrder(orderId)

            expect((await contract.orders(orderId)).accepted).to.be.equal(true)

            const driverTokenBalance = await erc20.balanceOf(acc2.address)

            expect((await contract.orders(orderId)).amount).to.be.equal(driverTokenBalance)
        })
        it("check event", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            const availableOrders = await contract.connect(acc2).getOrders();
            const orderId = availableOrders[0].orderId

            await expect(contract.connect(acc2).acceptOrder(orderId)).to.emit(contract, "OrderUpdated").withArgs(orderId, true)

        })
    })
    describe("Reject order", () => {
        it("check order rejected", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            const availableOrders = await contract.connect(acc2).getOrders();
            const orderId = availableOrders[0].orderId

            await contract.connect(acc2).rejectOrder(orderId)
            const expectedBalance = amount - amount
            const returnBalance = (await contract.consumers((await contract.orders(orderId)).consumer)).balance   
            expect(returnBalance).to.be.equal(expectedBalance)
        })
        it("check order deleted", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            const availableOrders = await contract.connect(acc2).getOrders();
            const orderId = availableOrders[0].orderId

            await contract.connect(acc2).rejectOrder(orderId)
            const ordersAfter = await contract.connect(acc2).getOrders();
            expect(ordersAfter[0].consumer).to.equal(zeroAddress)
        })
        it("check event", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await contract.connect(acc1).createOrder(startPoint, endPoint, amount)

            const availableOrders = await contract.connect(acc2).getOrders();
            const orderId = availableOrders[0].orderId

            await expect(contract.connect(acc2).rejectOrder(orderId)).to.emit(contract, "OrderUpdated").withArgs(orderId, false)
        })
    })
    describe("Withdraw", () => {
        it("check user get his token", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)

            await contract.connect(acc1).withdraw()
            expect(await erc20.balanceOf(acc1.address)).to.be.equal(amount)

            const balance = (await contract.consumers(acc1.address)).balance
            expect((await contract.consumers(acc1.address)).balance).to.be.equal(balance)
        })
        it("check require", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, 0)
            await contract.connect(acc2).registerDriver(driverName, documentNumber)

            await expect(contract.connect(acc2).withdraw()).to.be.revertedWith("Only consumer function")
            await expect(contract.connect(acc1).withdraw()).to.be.revertedWith("No balance to withdraw")
        })
        it("check event", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, amount)

            await expect(contract.connect(acc1).withdraw()).to.emit(contract, "Withdrawal").withArgs(acc1.address, amount)
        })
    })
    describe("Recharge balance", () => {
        it("check user`s balance recharged", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, 0)

            await contract.connect(acc1).rechargeBalance(amount)
            const balance = (await contract.consumers(acc1.address)).balance

            expect(balance).to.be.equal(amount)
        })
        it("check requires", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, 0)
            await expect(contract.connect(acc2).rechargeBalance(amount)).to.be.revertedWith("Only consumer function")
        })
        it("check events", async() => {
            const {owner, acc1, acc2, acc3, amount, zeroAddress, erc20, contract, driverName, consumerName, documentNumber, phoneNumber, startPoint, endPoint} = await loadFixture(deploy)
            await contract.connect(acc1).registerConsumer(consumerName, phoneNumber, 0)

            await expect(contract.connect(acc1).rechargeBalance(amount)).to.emit(contract, "ConsumerRechargedBalance")
            .withArgs(acc1.address, amount)
        })
    })
})