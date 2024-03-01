<template>
    <div class="container mt-5">
        <div class="row">
            <!-- <div class="col-md-6" style="margin-left: 200px;"> -->
            <p class="lead">Hello Consumer!</p>
            <button class="btn btn-primary" @click="getConsumer" style="width: 120px; margin: auto;">Refresh</button>
            <div class="card" style="margin-top: 20px; margin-left: 10px;">
                <div class="card-body">
                    <div class="mt-3 text-left">
                        <h5>Адрес: {{ $store.state.address }}</h5>
                        <h4>ФИО: {{ this.consumer.fullName }}</h4>
                        <h4>Номер телефона: {{ this.consumer.phoneNumber }}</h4>
                        <h4>Ваш текущий баланс: {{ this.consumer.balance }}</h4>
                        <div class="input-box" v-if="this.consumer.balance == 0">
                            <p class="warning">
                                Approve your tokens to <a
                                    href="https://sepolia.etherscan.io/address/0xF60A89f7F196223C8A9D6345c9a38cDA71166843">contract
                                    address </a> at
                                <a href="https://sepolia.etherscan.io/address/0xbC786A4Bd25555A1e36e9e79F919E4a91aAa8436">
                                    MANT token</a>
                                and recharge balance
                            </p>
                            <input v-model="tokensAmount" type="number" placeholder="Enter tokens amount" required>
                            <button class="btn btn-primary" @click="reBalance"> recharge balance </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card" style="margin-top: 20px; margin-left: 10px;">
                <div class="card-body">
                    <form @submit.prevent="create">
                        <h2>Create order</h2>
                        <div class="form-group mt-3">
                            <label for="fullName">Start point:</label>
                            <input v-model="startPoint" type="text" class="form-control" id="startPoint" required>
                        </div>
                        <div class="form-group">
                            <label for="phoneNumber">End point:</label>
                            <input v-model="endPoint" type="text" class="form-control" id="endPoint" required>
                        </div>
                        <div class="form-group">
                            <label for="additionalInfo">Amount:</label>
                            <input v-model="amount" type="number" class="form-control" id="amount" required>
                            <p v-if="amount > this.consumer.balance"> Not enough tokens!</p>
                        </div>
                        <button type="submit" class="btn btn-success" style="margin-top: 15px;">Create order</button>
                    </form>
                </div>
            </div>
            <!-- </div> -->
        </div>
    </div>
</template>


<script>
import { mapActions } from 'vuex'
export default {
    name: "consumer-item",
    data() {
        return {
            consumer: {},
            startPoint: "",
            endPoint: "",
            amount: 0,
            isApproved: false,
            tokensAmount: 0
        }
    },
    methods: {
        ...mapActions({
            consumers: "consumers",
            createOrder: "createOrder",
            getAllowance: "getAllowance",
            rechargeBalance: "rechargeBalance"
        }),
        async getConsumer() {
            this.consumer = await this.consumers([this.$store.state.address])
            console.log(this.consumer)
        },
        async create() {
            await this.createOrder([this.startPoint, this.endPoint, this.amount])
            this.startPoint = ""
            this.endPoint = ""
            this.amount = 0
        },
        async reBalance(){
            await this.rechargeBalance([this.tokensAmount])
        }
    },
    async mounted() {
        await this.getConsumer()
        console.log(this.isApproved)
        this.isApproved = await this.getAllowance()
        if (this.isApproved == false) {
            while (this.isApproved != true) {
                this.isApproved = await this.getAllowance()
            }
        }
        console.log(this.isApproved)
    }
}
</script>

<style></style>