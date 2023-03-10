<template>
  <div>
    <header class="mb-3 border-bottom bg-white bg-opacity-25">
      <div class="container">
        <div class="d-flex flex-row align-items-center nav">
          <div class="me-auto">
            <a href="/" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-1 bi bi-airplane"></i>
              <span class="fs-4 ms-2 d-none d-md-block">{{ $t('headlines.title') }}</span>
            </a>
          </div>
          <div>
            <router-link v-if="auth" to="/approve" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-4 bi bi-calendar-check"></i>
              <span class="ms-1 d-none d-md-block">{{ $t('headlines.approve') }}</span>
            </router-link>
          </div>
          <div>
            <router-link v-if="auth" to="/examine" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-4 bi bi-pencil-square"></i>
              <span class="ms-1 d-none d-md-block">{{ $t('headlines.examine') }}</span>
            </router-link>
          </div>
          <div v-if="auth" class="dropdown">
            <a class="nav-link link-dark d-flex align-items-center dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button">
              <i class="fs-4 bi bi-person-circle"></i>
              <span class="ms-1 d-none d-md-block">{{ user.name }}</span>
            </a>
            <ul class="dropdown-menu" style="min-width: 0px">
              <li>
                <router-link to="/settings" class="nav-link link-dark d-flex align-items-center dropdown-item">
                  <i class="fs-4 bi bi-gear"></i>
                  <span class="ms-1">{{ $t('headlines.settings') }}</span>
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="nav-link link-dark d-flex align-items-center dropdown-item" href="#" @click="logout">
                  <i class="fs-4 bi bi-box-arrow-left"></i>
                  <span class="ms-1">{{ $t('headlines.logout') }}</span>
                </a>
              </li>
            </ul>
          </div>
          <div v-else>
            <router-link to="/login" class="nav-link link-dark d-flex align-items-center">
              <i class="fs-4 bi bi-box-arrow-in-right"></i>
              <span class="ms-1 d-none d-md-block">{{ $t('headlines.login') }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <div v-if="loadState !== 'LOADED'" class="position-absolute top-50 start-50 translate-middle">
      <div class="spinner-grow me-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="spinner-grow me-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="spinner-grow" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="position-relative">
      <div class="position-absolute top-0 end-0" style="height: 100%">
        <div class="position-sticky top-0 pt-2 pe-2" style="z-index: 1100">
          <div
            v-for="(alert, index) of alerts"
            :key="alert.id"
            :class="'alert alert-' + alert.type + ' alert-dismissible ms-auto'"
            role="alert"
            style="z-index: 1100; max-width: 250px"
          >
            <strong>
              <i v-if="alert.type == 'danger'" class="bi bi-x-octagon-fill"></i>
              <i v-if="alert.type == 'success'" class="bi bi-check-circle-fill"></i>
              {{ alert.title }}{{ alert.title && alert.message ? ': ' : '' }}
            </strong>
            {{ alert.message }}
            <div class="progress position-absolute top-0 end-0" style="height: 5px; width: 100%">
              <div :class="'progress-bar bg-' + alert.type" role="progressbar" id="alert-progress" aria-label="Danger example"></div>
            </div>
            <button type="button" class="btn-close" @click="alerts.splice(index, 1)"></button>
          </div>
        </div>
      </div>
      <router-view :class="loadState === 'LOADED' ? 'd-block' : 'd-none'" />
    </div>

    <footer class="py-3 border-top">
      <div class="container">
        <div class="d-flex align-items-center">
          <a href="/" class="text-decoration-none link-dark lh-1">
            <i class="fs-3 bi bi-airplane"></i>
          </a>
          <span class="ps-2 text-muted">?? {{ new Date().getFullYear() }} {{ $t('headlines.title') }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      alerts: [],
      auth: false,
      user: {},
      travels: [],
      currencies: [],
      loadState: 'UNLOADED',
      loadingPromise: null,
      bp: { sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 },
      stateColors: {
        appliedFor: { color: '#cae5ff', text: 'black' },
        approved: { color: '#89bbfe', text: 'black' },
        underExamination: { color: '#6f8ab7', text: 'white' },
        refunded: { color: '#615d6c', text: 'white' },
      },
    }
  },
  methods: {
    async load() {
      if (this.loadState === 'UNLOADED') {
        this.loadState = 'LOADING'
        this.loadingPromise = new Promise(async (resolve) => { // eslint-disable-line no-async-promise-executor
          this.user = await this.getter('user')
          if (Object.keys(this.user).length > 0) {
            this.auth = true
          }
          this.travels = await this.getter('travel')
          this.currencies = await this.getter('currency')
          this.loadState = 'LOADED'
          resolve()
        })
        await this.loadingPromise
      } else if (this.loadState === 'LOADING') {
        await this.loadingPromise
      }
    },
    async logout() {
      try {
        const res = await axios.delete(process.env.VUE_APP_BACKEND_URL + '/api/logout', {
          withCredentials: true,
        })
        if (res.status === 200) {
          this.auth = false
          this.user = {}
          this.$router.push('/login')
        }
      } catch (error) {
        this.addAlert({ message: error.response.data.message, title: 'ERROR', type: 'danger' })
        console.log(error.response.data)
      }
    },
    async getter(endpoint, params = {}) {
      try {
        const res = await axios.get(process.env.VUE_APP_BACKEND_URL + '/api/' + endpoint, {
          params: params,
          withCredentials: true,
        })
        if (res.status === 200) {
          return res.data.data
        }
      } catch (error) {
        if (error.response.status === 401) {
          this.$router.push('login')
        } else {
          console.log(error.response.data)
          this.addAlert({ message: error.response.data.message, title: 'ERROR', type: 'danger' })
        }
      }
    },
    getById(property, id) {
      if (property in this) {
        for (const element of this[property]) {
          if (element._id == id) {
            return element
          }
        }
        return false
      }
      return false
    },
    addAlert(alert) {
      alert = Object.assign(alert, { id: Math.random() })
      this.alerts.push(alert)
      setTimeout(() => {
        const index = this.alerts.findIndex((al) => {
          return al.id === alert.id
        })
        if (index !== -1) {
          this.alerts.splice(index, 1)
        }
      }, 5000)
    },
    dateTimeToHTMLInputString(date){
      const dateObject = new Date(date)
      const year = dateObject.getFullYear()
      const month = (dateObject.getMonth() + 1).toString().padStart(2, '0')
      const day = dateObject.getDate().toString().padStart(2, '0')
      const hour = dateObject.getHours().toString().padStart(2, '0')
      const minute = dateObject.getMinutes().toString().padStart(2, '0')
      const str = year +'-'+ month +'-'+ day +'T'+ hour +':'+ minute
      return str
    },
    dateToHTMLInputString(date){
      const dateObject = new Date(date)
      const year = dateObject.getFullYear()
      const month = (dateObject.getMonth() + 1).toString().padStart(2, '0')
      const day = dateObject.getDate().toString().padStart(2, '0')
      const str = year +'-'+ month +'-'+ day
      return str
    },
  },
  beforeMount() {
    document.title = this.$t('headlines.title') + ' ' + this.$t('headlines.emoji')
  },
}
</script>

<style>
@font-face {
  font-family: 'Twemoji Country Flags';
  unicode-range: U+1F1E6-1F1FF, U+1F3F4, U+E0062-E0063, U+E0065, U+E0067, U+E006C, U+E006E, U+E0073-E0074, U+E0077, U+E007F;
  src: url('https://cdn.jsdelivr.net/npm/country-flag-emoji-polyfill@0.1/dist/TwemojiCountryFlags.woff2') format('woff2');
}

body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.win {
  font-family: "Twemoji Country Flags", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  position: relative;
  min-height: 100%;
}
body {
  margin-bottom: 75px !important; /* Margin bottom by footer height */
}
footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60px; /* Set the fixed height of the footer here */
  z-index: -999;
}

@keyframes run {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

#alert-progress {
  animation-name: run;
  animation-duration: 5s;
  animation-timing-function: linear;
}
</style>
