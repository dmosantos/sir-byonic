<template>
    <div :class="$style.mainTemplate">

        <AppMain :class="$style.appMain">
            <slot />
        </AppMain>

        <div :class="$style.overlay" />

        <svg :class="$style.logoBg">
            <use :xlink:href="`${require('@/assets/logo-onium-computers.svg')}#logo`" />
        </svg>
        
    </div>
</template>

<script>

import AppMain from './section/AppMain';

export default {

    name: 'MainTemplate',

    components: {
        AppMain
    }

}

</script>

<style lang="scss" module>

.main-template {

    width: 100%;

}

.app-main {

    position: relative;
    z-index: 10;

}

.overlay {

    animation: blink .05s linear infinite alternate;
    background-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 75%, rgba(0,255,0,.025) 85%, rgba(0,255,0,.025) 100%);
    background-size: 100% .3rem;
    background-repeat: repeat;
    box-shadow: inset 0 0 50px 30px rgba(0, 0, 0, .7);
    position: fixed;
    height: 100%;
    top: 0;
    filter: sepia(100%);
    pointer-events: none;
    width: 100%;
    z-index: 50;

}

.logoBg {

    fill: #ffffff;
    display: block;
    height: 100%;
    left: 0;
    opacity: .03;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1;

}

@keyframes blink {

    from {

        background-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 25%, rgba(0,255,0,.025) 35%, rgba(0,255,0,.025) 100%);
        opacity: 1;

    }

    to {

        background-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35%, rgba(0,255,0,.02) 45%, rgba(0,255,0,.02) 100%);
        opacity: .7;

    }
    
}

</style>