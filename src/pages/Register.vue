<template>
    <div class="wrapper">
        <div id="registrationForm">
            <h2>Registration</h2>
            <form @submit.prevent="register">
                <div>
                    <label for="userType">Select User Type:</label>
                    <select id="userType" name="userType" v-model="userType" @change="handleChangeUserType">
                        <option value="driver">Driver</option>
                        <option value="consumer" selected>Consumer</option>
                    </select>
                </div>
                <div class="input-box">
                    <input v-model="name" type="text" placeholder="Enter your name" required>
                </div>
                <div class="input-box">
                    <input v-model="phoneNumber" v-if="userType == 'consumer'" type="text" placeholder="Enter phone number"
                        required>
                    <input v-model="documentNumber" v-else-if="userType == 'driver'" type="text"
                        placeholder="Enter document number" required>
                </div>
                <div class="input-box" v-if="userType == 'consumer'">
                    <input v-model="tokensAmount" type="number" placeholder="Enter tokens amount" required>
                    <p v-if="tokensAmount == 0"> Can`t be zero tokens</p>
                </div>
                <div class="input-box" v-if="userType == 'consumer' && !isApproved" style="margin-bottom: 80px;">
                    <p class="warning">
                        Approve your tokens to <a
                            href="https://sepolia.etherscan.io/address/0xF60A89f7F196223C8A9D6345c9a38cDA71166843">contract
                            address </a> at
                        <a href="https://sepolia.etherscan.io/address/0xbC786A4Bd25555A1e36e9e79F919E4a91aAa8436"> MANT
                            token</a>
                    </p>
                    <div class="input-box button">
                        <input @click="refresh" value="Refresh">
                    </div>
                </div>
                <div class="input-box" v-if="userType == 'consumer' && isApproved" style="margin-bottom: -30px;">
                    <p class="approval-status">Tokens approved!</p>
                </div>
                <div class="input-box button">
                    <input @click="connectWallet" value="Connect Metamask">
                </div>
                <div class="input-box">
                    <p for="userType">Your address: {{ $store.state.address }}</p>
                </div>
                <div class="input-box button">
                    <input type="submit" value="Register Now">
                </div>
                <div class="text">
                    <h3>Do you have an account? <a href="#" @click="haveAccount">Connect your account</a></h3>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'RegView',
    data() {
        return {
            userType: "consumer",
            name: "",
            phoneNumber: "",
            documentNumber: "",
            isApproved: false,
            tokensAmount: 0,
        }
    },
    methods: {
        ...mapActions({
            connectWallet: "connectWallet",
            registerDriver: "registerDriver",
            registerConsumer: "registerConsumer",
            getAllowance: "getAllowance"
        }),
        handleChangeUserType() {
            console.log(this.userType)
        },
        async haveAccount() {
            await this.connectWallet()
            console.log(this.userType)
            this.$store.state.userType = this.userType
            this.$router.push(`/`)
        },
        async register() {
            if (this.userType == "driver") {
                console.log([this.name, this.documentNumber])
                this.$store.state.userType = this.userType
                await this.registerDriver([this.name, this.documentNumber])
                console.log("Good")
                this.$router.push(`/`)
            }
            else if (this.userType == "consumer") {
                console.log(this.name, this.phoneNumber)
                this.$store.state.userType = this.userType
                await this.registerConsumer([this.name, this.phoneNumber, this.tokensAmount])
                console.log("Good")
                this.$router.push(`/`)
            }
            else {
                alert("Invalid type")
            }
        },
        async refresh() {
            console.log(this.isApproved)
            this.isApproved = await this.getAllowance()
            console.log(this.isApproved)
        }
    },
    async mounted() {
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

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Poppins:400,500,600,700&display=swap');

.connectBtn {
    margin-top: 25px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
}

body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f4f4f4;
}

.wrapper {
    margin-top: 100px;
    margin-left: 730px;
    position: relative;
    max-width: 450px;
    width: 100%;
    background: #fff;
    padding: 34px;
    border-radius: 6px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}


.wrapper h2 {
    position: relative;
    font-size: 22px;
    font-weight: 600;
    color: #333;
}

.wrapper h2::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 28px;
    border-radius: 12px;
    background: #4070f4;
}

.wrapper form {
    margin-top: 30px;
}

.wrapper form .input-box {
    height: 52px;
    margin: 18px 0;
}

form .input-box input {
    height: 100%;
    width: 100%;
    outline: none;
    padding: 0 15px;
    font-size: 17px;
    font-weight: 400;
    color: #333;
    border: 1.5px solid #C7BEBE;
    border-bottom-width: 2.5px;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.input-box input:focus,
.input-box input:valid {
    border-color: #4070f4;
}

form .policy {
    display: flex;
    align-items: center;
}

form h3 {
    color: #707070;
    font-size: 14px;
    font-weight: 500;
    margin-left: 10px;
}

.input-box.button input {
    color: #fff;
    letter-spacing: 1px;
    border: none;
    background: #4070f4;
    cursor: pointer;
}

.input-box.button input:hover {
    background: #0e4bf1;
}

form .text h3 {
    color: #333;
    width: 100%;
    text-align: center;
}

form .text h3 a {
    color: #4070f4;
    text-decoration: none;
}

form .text h3 a:hover {
    text-decoration: underline;
}
</style>