<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" @click="connectWallet">Connect wallet</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" @click="$router.push('/register')">Sign Up</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { mapActions } from 'vuex'
export default {
    name: 'navbar',
    data() {
        return {
        };
    },
    methods: {
        ...mapActions({
            connectWallet: "connectWallet",
        }),
    },
};
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
</style>