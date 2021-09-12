<template>
    <header :class="$style.appHeader">

        <!-- App Logo -->
        <div :class="$style.appLogo">
            SIR-BYONIC v17.5.77
        </div>

    </header>
</template>

<script>

export default {

    name: 'AppHeader'

}

</script>

<style lang="scss" module>

.app-header {

    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-color);
    left: 0;
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 10;

}

.app-logo {

    padding: 1rem 2rem;

}

</style>