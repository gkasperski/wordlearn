angular.module('starter.auth', [])

.factory('AuthService', function ($http, $rootScope, UserProfile, $location, $ionicHistory, $state, Popup, Storage, $ionicPopup, $timeout, Credentials) {

    // zmienna tokenu w localstorage
    var LOCAL_TOKEN_KEY = 'authToken';
    var authToken;


    // funkcja wywoluje sie po wlaczeniu aplikacji i pobiera dane uzytkownika jezeli byl wczesniej zalogowany (sprawdza token z localstorage)
    function loadUserCredentials() {
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        if (token) {
            Credentials.setAuthenticated(true);
            useCredentials(token);
        }
    }

    function storeUserCredentials(token) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
        Credentials.setAuthenticated(true);
        useCredentials(token);
    }

    function useCredentials(token) {
        authToken = token;
        $http.defaults.headers.common['Authorization'] = token;
        var error = false;
        var profile = localStorage.getItem("Profile");
        if (profile) {
            try {
                UserProfile.setProfile(JSON.parse(profile));
            } catch (error) {
                console.log(error);
                error = true;
            }
        }
        var sets = localStorage.getItem("sets");
        if (sets && !error) {
            try {
                UserProfile.setSets(JSON.parse(sets), null);
            } catch (error) {
                console.log(error);
                error = true;
            }
        }
        var setsForeign = localStorage.getItem("setsForeign");
        if (setsForeign && !error) {
            try {
                UserProfile.setSets(null, JSON.parse(setsForeign));
                $ionicHistory.nextViewOptions({
                    disableBack: true
                })
                $state.go('logged.dashboard', {}, { reload: true });
            } catch (error) {
                console.log(error);
                error = true;
            }
        }
        if (error || !profile || !sets || !setsForeign) {
            Popup.showLoading("Ładowanie profilu");
            var retrieveProfile = function () {
                UserProfile.retrieveProfile().then(function (response) {
                    if (response.data.status == true) {
                        UserProfile.setProfile(response.data.response);
                        UserProfile.retrieveSets().then(function () {
                            $ionicHistory.nextViewOptions({
                                disableBack: true
                            })
                            $state.go('logged.dashboard', {}, { reload: true });
                            Popup.hideLoading();
                        })
                    } else {
                        $state.go('login.main');
                        logout();
                        Popup.hideLoading();
                    }
                }, function (error) {
                    Popup.hideLoading();
                    $ionicPopup.show({
                        title: 'Nie można było pobrać danych profilu.',
                        subTitle: '<br/>Przywróć połączenie z internetem i spróbuj ponownie',
                        buttons: [
                          {
                              text: '<b>Spróbuj ponownie</b>',
                              type: 'button-positive',
                              onTap: function () {
                                  Popup.showLoading("Ładowanie profilu");
                                  $timeout(function () {
                                      retrieveProfile();
                                  },1000);
                                  
                              }
                          },
                        ]
                    });
                });
            };
            retrieveProfile();
        }
    }

    var logout = function () {
        Credentials.destroy();
        Credentials.setAuthenticated(false);
    };

    function login(user) {
        return $http.post("https://wordlearn.pl/rest/client/login", {
            "email": user.email,
            "password": user.password
        })
    };

    loadUserCredentials();

    return {
        logout: logout,
        login: login,
        getToken: function () { return authToken; },
        storeUserCredentials: storeUserCredentials,
        loadUserCredentials: loadUserCredentials
    };


})