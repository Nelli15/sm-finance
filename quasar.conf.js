// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

module.exports = function (ctx) {
  return {
    // https://quasar.dev/quasar-cli/supporting-ts
    supportTS: {
      tsCheckerConfig: {
        eslint: {
          enabled: false,
          files: './src/**/*.{ts,tsx}',
          // files: './src/**/*.{ts,tsx,js,jsx,vue}',
        },
      },
    },
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/cli-documentation/boot-files
    boot: [],

    preFetch: true,

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: ['app.sass'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v4',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
      'material-icons-outlined',
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      // iconSet: 'ionicons-v4', // Quasar icon set
      // lang: 'de', // Quasar language pack

      // Possible values for "all":
      // * 'auto' - Auto-import needed Quasar components & directives
      //            (slightly higher compile time; next to minimum bundle size; most convenient)
      // * false  - Manually specify what to import
      //            (fastest compile time; minimum bundle size; most tedious)
      // * true   - Import everything from Quasar
      //            (not treeshaking Quasar; biggest bundle size; convenient)
      importStrategy: 'auto',

      components: [
        // 'QLayout',
        // 'QHeader',
        // // 'QDrawer',
        // 'QPageContainer',
        // 'QPage',
        // 'QPageSticky',
        // 'QToolbar',
        // 'QToolbarTitle',
        // 'QSpace',
        // 'QBtn',
        // 'QIcon',
        // 'QList',
        // 'QItem',
        // // 'QItemSection',
        // // 'QItemLabel',
        // // 'QSeparator',
        // 'QCard',
        // 'QCardSection',
        // // 'QCardActions',
        // 'QForm',
        // 'QSelect',
        // 'QInput',
        // 'QDate',
        // 'QPopupEdit',
        // 'QTabs',
        // 'QRouteTab',
        // // 'QTab',
        // 'QBadge',
        // 'QAvatar',
        // 'QBanner',
        // 'QTooltip',
        // 'QTable',
        // 'QTr',
        // 'QTd',
        // // 'QImg',
        // 'QDialog',
        // 'QPopupProxy',
        // 'QInnerLoading'
        // 'QSpinner',
        // 'QMenu'
        // // 'QFirebaseUploader'
      ],
      directives: [],

      // Quasar plugins
      plugins: ['Notify', 'Loading', 'ClosePopup', 'LocalStorage'],
      config: {
        brand: {
          primary: '#027BE3',
          secondary: '#26A69A',
          accent: '#abede9',

          dark: '#1d1d1d',

          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037',
        },
        cordova: {
          iosStatusBarPadding: true / false, // add the dynamic top padding on iOS mobile devices
          backButtonExit: true / false, // Quasar handles app exit on mobile phone back button
        },
        loading: {},
        notify: {
          timeout: 1000,
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }],
        },
      },
    },

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      distPath: 'dist',
      scopeHoisting: true,
      vueRouterMode: 'history',
      // showProgress: false,
      gzip: true,
      // analyze: true,
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
      extendWebpack(cfg) {
        // cfg.module.rules.push({
        //   enforce: 'pre',
        //   test: /\.(js|vue)$/,
        //   loader: 'eslint-loader',
        //   exclude: /node_modules/,
        //   options: {
        //     formatter: require('eslint').CLIEngine.getFormatter('stylish')
        //   }
        // })
      },
      chainWebpack(chain, { isServer, isClient }) {
        chain.output.globalObject('self')
      },
    },

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      // https: true,
      port: 5100,
      open: true, // opens browser window automatically
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: ['fadeIn', 'fadeOut'],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'InjectManifest',
      workboxOptions: {
        // Do not precache images
        exclude: [/\.(?:png|jpg|jpeg|svg)$/],

        // Define runtime caching rules.
        // runtimeCaching: [
        //   {
        //     // Match any request that ends with .png, .jpg, .jpeg or .svg.
        //     urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

        //     // Apply a cache-first strategy.
        //     handler: 'CacheFirst',

        //     options: {
        //       // Use a custom cache name.
        //       cacheName: 'images',

        //       // Only cache 10 images.
        //       expiration: {
        //         maxEntries: 10
        //       }
        //     }
        //   }
        // ],
        dontCacheBustURLsMatching: /.*\.(js|css)/,
        // exclude: [/^public/],
        maximumFileSizeToCacheInBytes: 3000000,
        // skipWaiting: true,
        // clientsClaim: true,
        // cleanupOutdatedCaches: true
      }, // only for GeneratedGW mode (default)
      manifest: {
        name: 'Summer Project Finances',
        short_name: 'SP Finances',
        description:
          'A finance keeping app for Power to Change Summer Missions',
        display: 'standalone',
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#027be3',
        start_url: '/dashboard',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },

    // https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // id: 'org.cordova.quasar.app',
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      // bundler: 'builder', // or 'packager'

      extendWebpack(cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      },

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        // appId: 'ptc-sm-finance'
      },
    },
  }
}
