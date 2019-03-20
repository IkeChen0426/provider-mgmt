<template>
  <div id="guide"></div>
</template>

<script>
import Cookies from 'js-cookie'
import * as Driver from 'driver.js' // import driver.js
import 'driver.js/dist/driver.min.css' // import driver.js css
import steps from './defineSteps'

export default {
  name: 'Guide',
  mounted () {
    if (!Cookies.get('guided')) {
      const driver = new Driver()

      driver.defineSteps(steps)
      driver.start()

      Cookies.set('guided', true)
    }
  }
}
</script>
