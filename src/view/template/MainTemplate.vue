<template>
    <div :class="$style.mainTemplate">

        <AppHeader />
        
        <AppMain>
            <slot />
        </AppMain>

        <div :class="$style.overlay" />
        
    </div>
</template>

<script>

import AppHeader from './section/AppHeader';
import AppMain from './section/AppMain';

export default {

    name: 'MainTemplate',

    components: {
        AppHeader,
        AppMain
    }

}

</script>

<style lang="scss" module>

.main-template {

    width: 100%;

}

.overlay {

    animation: blink .05s linear infinite alternate;
    background-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 49%, rgba(0,255,0,.025) 51%, rgba(0,255,0,.025) 100%);
    background-size: 100% .25rem;
    background-repeat: repeat;
    box-shadow: inset 0 0 150px 30px rgba(0, 0, 0, .6);
    position: fixed;
    height: 100%;
    top: 0;
    filter: sepia(100%);
    pointer-events: none;
    width: 100%;
    z-index: 50;

}

@keyframes blink {

    from {

        background-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 49%, rgba(0,255,0,.025) 51%, rgba(0,255,0,.025) 100%);
        opacity: 1;

    }

    to {

        background-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 49%, rgba(0,255,0,.02) 51%, rgba(0,255,0,.02) 100%);
        opacity: .8;

    }
    
}

</style>