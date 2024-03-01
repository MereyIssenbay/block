<template>
    <div class="main">
        <h1>Welcome to our Dapp!</h1>
        <div v-if="this.$store.state.userType === 'consumer'">
            <consumer-item>

            </consumer-item>
        </div>
        <div v-else-if="this.$store.state.userType === 'driver'">
            <driver-item>
                
            </driver-item>
        </div>
        <p v-else>Unknown UserType!</p>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
    data() {
        return {
        }
    },
    methods: {
        ...mapActions({
            isDriver: "isDriver"
        }),
        getType(){
            console.log(this.$store.state.userType)
        },
        async checkUserType(){
            const isDriver = await this.isDriver([this.$store.state.address])
            if(isDriver){
                this.$store.state.userType = "driver"
            }
            else if(!isDriver){
                this.$store.state.userType = "consumer"
            }
            else{
                alert("Error")
            }
        }
    },
    async mounted() {
        this.checkUserType()
    },
    watch: {
        "$store.state.address": "checkUserType",
    },  
}
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');

body {
    background-color: #f8f9fa;
}

.navbar {
    background-color: #343a40;
}

.navbar-brand,
.navbar-nav .nav-link {
    color: #ffffff !important;
}

.nav-item {
    margin-left: 30px;
}

.main {
    max-width: 800px;
    margin: 50px auto;
    text-align: center;
}

.posts {
    margin-top: 20px;
}

.post {
    background-color: #ffffff;
    border: 1px solid #ced4da;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    transition: transform 0.3s ease-in-out;
}

.post:hover {
    transform: scale(1.03);
}

.post h3 {
    color: #007bff;
}

.post p {
    color: #495057;
}
</style>