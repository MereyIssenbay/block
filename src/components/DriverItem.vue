<template>
    <div class="container mt-5">
        <div class="row">
            <!-- <div class="col-md-3"> -->
            <p class="lead">Hello Driver!</p>
            <button class="btn btn-primary" @click="refresh" style="width: 120px; margin: auto;">Refresh</button>
            <div class="card" style="margin-top: 20px; margin-left: 10px;">
                <div class="card-body">
                    <div class="mt-3 text-left">
                        <h5>Адрес: {{ $store.state.address }}</h5>
                        <h4>ФИО: {{ this.driver.fullName }}</h4>
                        <h4>Номер документа: {{ this.driver.documentNumber }}</h4>
                        <h4>Ваш текущий баланс: {{ this.balance }}</h4>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" @click="getConsumerOrders"
                style="width: 140px; margin: auto; margin-top: 20px;">Refresh orders</button>
            <!-- </div> -->
            <div v-for="order in orders">
                <div class="card" style="margin-top: 20px; margin-left: 10px;" v-if="!order.accepted && order.consumer !== '0' && order.startPoint !== ''">
                    <div class="card-body">
                        <h3>Order ID: {{ order.orderId }}</h3>
                        <h4>Consumer: {{ order.consumer }}</h4>
                        <h4>Start point: {{ order.startPoint }}</h4>
                        <h4>End point: {{ order.endPoint }}</h4>
                        <h4>Amount: {{ order.amount }}</h4>
                        <h4>Is Accepted: {{ order.accepted }}</h4>
                        <button class="btn btn-success" @click="accept(order.orderId)"
                            style="width: 120px; margin: auto; margin-right: 10px;">Accept</button>
                        <button class="btn btn-danger" @click="reject(order.orderId)"
                            style="width: 120px; margin: auto;">Reject</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
    name: "driver-item",
    data() {
        return {
            driver: {},
            balance: "",
            orders: []
        }
    },
    methods: {
        ...mapActions({
            drivers: "drivers",
            getBalance: "getBalance",
            getOrders: "getOrders",
            acceptOrder: "acceptOrder",
            rejectOrder: "rejectOrder"
        }),
        async getDriver() {
            this.driver = await this.drivers([this.$store.state.address])
            console.log(this.driver)
        },
        async getDriverBalance() {
            this.balance = await this.getBalance()
        },
        async getConsumerOrders() {
            this.orders = await this.getOrders()
        },
        async accept(orderId) {
            await this.acceptOrder([orderId])
        },
        async reject(orderId) {
            await this.rejectOrder([orderId])
        },
        async refresh() {
            await this.getDriver()
            await this.getDriverBalance()
        }
    },
    async mounted() {
        await this.getDriverBalance()
        await this.getConsumerOrders()
    }
}
</script>

<style></style>