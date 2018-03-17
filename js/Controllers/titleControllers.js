angular.module('starter.titleControllers', [])


// Kontroler strony głównej LOGOWANIA
.controller('LoginCtrl', function ($scope, Popup, $http, $location, $ionicPopup, $rootScope, AuthService) {

    // Przycisk "ZAPOMNIAŁEM HASŁA"
    $scope.forgotPassword = function () {
        $scope.data = {};

        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.email" placeholder="Wprowadź adres e-mail"/>',
            title: 'Przypomnienie hasła',
            subTitle: 'Na Twój adres pocztowy zostanie wysłany mail w którym po kliknięciu na link rozpocznie się proces resetowania hasła. Następnie nowo-wygenerowane hasło zostanie do Ciebie wysłane.',
            scope: $scope,
            buttons: [
              { text: 'Anuluj' },
              {
                  text: '<b>Wyślij</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                      if (!$scope.data.email) {
                          e.preventDefault();
                          Popup.showAlert("Niepoprawny adres e-mail", "Wprowadź poprawny adres e-mail, a następnie zatwierdź wysłanie zapytania o resetowanie hasła.");
                      } else {
                          Popup.showLoading("Wysyłanie zapytania...");
                          $http.post("https://wordlearn.pl/rest/client/recover/forgotPassword", {
                              "email": $scope.data.email
                          })
                          .success(function (data) {
                              Popup.hideLoading();
                              if (data.status == false) {
                                  Popup.showAlert("Błąd żądania", data.error);
                              } else if (data.status == true) {
                                  Popup.showAlert("Zapytanie o zresetowanie hasła zostało wysłane", data.response);
                              }

                          })
                          .error(function (data) {
                              Popup.hideLoading();
                              Popup.showAlert("Brak połączenia z internetem!", "Sprawdź swoje połączenie z internetem i spróbuj ponownie.")
                          });
                          return $scope.data.email;
                      }
                  }
              }
            ]
        });
    };

    // Przycisk ponownego wysyłania linku aktywacyjnego
    $scope.resendKey = function () {
        $scope.data = {};

        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.email" placeholder="Wprowadź adres e-mail">',
            title: 'Wysyłanie linku aktywacyjnego',
            subTitle: 'Przed prośbą o ponownie wysłanie kodu aktywacyjnego odczekaj 30 minut i sprawdź w folderze SPAM czy nie ma tam zagubionej wiadomości z wcześniej wysłanym kluczem aktywacyjnym.',
            scope: $scope,
            buttons: [
              { text: 'Anuluj' },
              {
                  text: '<b>Wyślij ponownie</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                      if (!$scope.data.email) {
                          e.preventDefault();
                          Popup.showAlert("Niepoprawny adres e-mail", "Wprowadź poprawny adres, a następnie nacisnij przycisk \"Wyślij ponownie\".");
                      } else {
                          Popup.showLoading("Wysyłanie linku aktywacyjnego...");
                          $http.post("https://wordlearn.pl/rest/client/register/resendActivationKey", {
                              "email": $scope.data.email
                          })
                          .success(function (data) {
                              Popup.hideLoading();
                              if (data.status == false) {
                                  Popup.showAlert("Błąd żądania", data.error);
                              } else if (data.status == true) {
                                  Popup.showAlert("Link został wysłany", data.response);
                              }

                          })
                          .error(function (data) {
                              Popup.hideLoading();
                              Popup.showAlert("Brak połączenia z internetem!", "Sprawdź swoje połączenie z internetem i spróbuj ponownie.")
                          });
                          return $scope.data.email;
                      }
                  }
              }
            ]
        });
    };

    $scope.user = {
        email: window.localStorage.getItem('email'),
        password: ''
    }

    // Przycisk logowania
    $scope.login = function (user) {
        Popup.showLoading("Logowanie...");
        AuthService.login(user).then(
            function (response) {
                Popup.hideLoading();
                if (response.data.status == false) {
                    Popup.showAlert("Błąd logowania", response.data.error);
                    if (response.data.error_code == 101) {
                        $scope.accountActivated = false;
                    }
                } else {
                    window.localStorage.setItem('email', user.email);
                    AuthService.storeUserCredentials(response.data.token);
                }
            }, function (error) {
                Popup.hideLoading();
                Popup.showAlert("Błąd połączenia!", "Nie można się połączyć z serwerem. Sprawdź połączenie z internetem.");
            });
    }
})
// Kontroler strony rejestracji
.controller('RegisterCtrl', function ($scope, $location, $http, Popup) {

    // potrzebne do resetowania formularza
    $scope.form = {};
    $scope.newUser = {};

    // przycisk Zarejestruj się
    $scope.register = function (newUser) {
        Popup.showLoading("Trwa rejestracja...")

        $http.post("https://wordlearn.pl/rest/client/register/newuser", {
            "email": newUser.email,
            "password": newUser.password,
            "nickname": newUser.nickname,
            "avatar": newUser.avatar
        })
            .success(function (data) {
                Popup.hideLoading();
                if (data.status == false) {
                    Popup.showAlert("Problemy przy rejestracji", data.errors);
                } else if (data.status == true) {
                    Popup.showAlert("Rejestracja powiodła się", data.response);
                    $location.path('/login/main');
                    $scope.newUser = {};
                    $scope.form.registerForm.$setPristine();
                    $scope.form.registerForm.$setUntouched();
                }

            })
            .error(function (data) {
                $Popup.hideLoading();
                Popup.showAlert("Błąd połączenia!", "Nie można się połączyć z serwerem. Sprawdź połączenie z internetem.");
            });

    };
})