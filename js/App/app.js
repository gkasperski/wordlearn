angular.module('starter',
    ['ionic', 'ngCordova', 'starter.titleControllers', 'starter.onlineControllers', 'starter.setsControllers', 'starter.auth', 'starter.shared',
        'starter.loggedControllers', 'starter.rest', 'starter.userData', 'starter.learningControllers'])

.run(function ($ionicPlatform, $rootScope, $state, $location, $ionicPopup, $ionicHistory, AuthService, Popup, UserProfile, Credentials) {
    $ionicPlatform.ready(function () {
        if (cordova.platformId === "ios" && window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });

    $ionicPlatform.registerBackButtonAction(function (e) {
        e.preventDefault();
        function showConfirm() {
            var confirmPopup = $ionicPopup.show({
                title: 'Wyjść z Wordlearn?',
                template: 'Czy napewno chcesz wyjść z aplikacji Wordlearn?',
                buttons: [{
                    text: 'Anuluj',
                    type: 'button-positive button-outline',
                }, {
                    text: 'Wyjdź',
                    type: 'button-positive',
                    onTap: function () {
                        ionic.Platform.exitApp();
                    }
                }]
            });
        };
        if ($ionicHistory.backView()) {
            $ionicHistory.backView().go();
        } else {
            showConfirm();
        }

        return false;
    }, 101);

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        $rootScope.authStatus = toState.authStatus;
        if (!$rootScope.authStatus && Credentials.isAuthenticated()) {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $state.transitionTo("logged.dashboard");
            $location.path('/logged/dashboard');
        } else if ($rootScope.authStatus && !Credentials.isAuthenticated()) {
            $state.transitionTo("login.main");
            $location.path('/login/main');
        }
    });

})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.backButton.text('').icon('ion-chevron-left');
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.tabs.position('bottom');

    $stateProvider
    //---------------LOGIN ABSTRACT---------------------------
      .state('login', {
          url: '/login',
          abstract: true,
          templateUrl: 'templates/login/login.html'
      })
     //---------------LOGIN STATES-----------------------------
    .state('login.main', {
        url: '/main',
        views: {
            'login-main': {
                templateUrl: 'templates/login/login-main.html',
                controller: 'LoginCtrl'
            }
        }, authStatus: false
    })

    .state('login.register', {
        url: '/register',
        views: {
            'login-register': {
                templateUrl: 'templates/login/login-register.html',
                controller: 'RegisterCtrl'
            }
        }, authStatus: false
    })
    //---------------LOGGED ABSTRACT---------------------------
      .state('logged', {
          url: '/logged',
          abstract: true,
          templateUrl: 'templates/logged/logged.html',
          controller: 'LoggedCtrl'
      })
    //------------------LOGGED STATES--------------------------

    .state('logged.dashboard', {
        cache: false,
        url: '/dashboard',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/logged-dashboard.html',
                controller: 'LoggedCtrl'
            }
        }, authStatus: true
    })

    .state('logged.about', {
        url: '/about',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/logged-about.html',
                controller: 'LoggedCtrl'
            }
        }, authStatus: true
    })

    .state('logged.sets', {
        url: '/sets',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/logged-sets.html',
                controller: 'SetsCtrl'
            }
        }, authStatus: true
    })

    .state('logged.sets-set', {
        url: '/sets/:setId/:setTitle',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/sets-set.html',
                controller: 'SetDetailsCtrl'
            }
        }, authStatus: true
    })

    .state('logged.online', {
        url: '/online',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/logged-online.html',
                controller: 'OnlineCtrl'
            }
        }, authStatus: true
    })

    .state('logged.online-set', {
        url: '/online/:setId/:setTitle',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/online-set.html',
                controller: 'OnlineDetailsCtrl'
            }
        }, authStatus: true
    })

    .state('logged.newset', {
        url: '/newset',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/logged-newset.html',
                controller: 'SetsCtrl'
            }
        }, authStatus: true
    })

    .state('logged.editset', {
        cache: false,
        url: '/editset/:setId/:setTitle',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/logged-editset.html',
                controller: 'SetsCtrl'
            }
        }, authStatus: true
    })

    .state('logged.set-flashcards', {
        cache: false,
        url: '/sets/flashcards',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/set-flashcards.html',
                controller: 'FlashcardsCtrl'
            }
        }, authStatus: true
    })

    .state('logged.set-pairs', {
        cache: false,
        url: '/sets/pairs',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/set-pairs.html',
                controller: 'PairsCtrl'
            }
        }, authStatus: true
    })

    .state('logged.set-abcd', {
        cache: false,
        url: '/sets/abcd',
        views: {
            'logged-dashboard': {
                templateUrl: 'templates/logged/set-abcd.html',
                controller: 'AbcdCtrl'
            }
        }, authStatus: true
    });


    //------------------LOGGED LEARNING STATES--------------------------

    $urlRouterProvider.otherwise('/login/main');

});