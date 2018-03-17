angular.module('starter.loggedControllers', [])

.controller('LoggedCtrl', function ($scope, AuthService, $location, $ionicPopup, $ionicSideMenuDelegate, Popup, Rest, UserProfile, $ionicHistory) {


    $scope.userData = {
    };

    $scope.userData = UserProfile.getProfile();

    $scope.logout = function () {

        var confirmPopup = $ionicPopup.show({
            title: 'Wylogować się?',
            template: 'Czy napewno chcesz się wylogować?',
            buttons: [{
                text: 'Anuluj',
                type: 'button-positive button-outline',
            }, {
                text: 'Wyloguj się',
                type: 'button-positive',
                onTap: function () {
                    $ionicSideMenuDelegate.toggleLeft(false);
                    AuthService.logout();
                    $location.path("/login/main");
                    $ionicHistory.clearCache();
                    $ionicHistory.clearHistory();
                }
            }]
        });
    };

    $scope.changeAvatar = function () {
        $scope.data = {
            avatar: '0'
        };
        $ionicPopup.show({
            template: '<ion-radio class="avatar-choose" ng-model="data.avatar" ng-value="1" required><img class="center" src="img/1.png"></ion-radio><ion-radio class="avatar-choose" ng-model="data.avatar" ng-value="2" required><img class="center" src="img/2.png"></ion-radio>',
            title: 'Zmiana avataru',
            subTitle: 'Wybierz jeden z dwóch dostępnych avatarów:',
            scope: $scope,
            buttons: [
              { text: 'Anuluj' },
              {
                  text: '<b>Zmień</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                      if (!$scope.data.avatar) {
                          e.preventDefault();
                          Popup.showAlert("Nie wybrano avataru", "Aby zmienić avatar musisz go najpierw wybrać!");
                      } else {
                          Popup.showLoading("Zmienianie avataru...");
                          Rest.changeAvatar($scope.data.avatar).then(
                              function (response) {
                                  if (response.data.status == true) {
                                      UserProfile.retrieveProfile().then(function (response) {
                                          $scope.userData.avatar = "img/" + $scope.data.avatar + ".png";
                                          Popup.showAlert("Zrobione!", "Avatar został zmieniony!");
                                          Popup.hideLoading();
                                      });
                                  } else {
                                      Popup.showAlert("Błąd!", response.data.error);
                                      Popup.hideLoading();
                                  }

                              },
                              function (error) {
                                  Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!");
                                  Popup.hideLoading();
                              });
                          

                      }
                  }
              }
            ]
        });
    }

    $scope.changePassword = function () {
        $scope.data = {
            oldPassword: "",
            password: "",
            rePassword: ""
        };

        $ionicPopup.show({
            templateUrl: 'templates/partials/changePasswordPopup.html',
            title: 'Zmiana hasła',
            subTitle: 'Wpisz swoje stare hasło, nowe hasło oraz powtórz je, aby zmienić hasło na nowe:',
            scope: $scope,
            buttons: [
              { text: 'Anuluj' },
              {
                  text: '<b>Zmień</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                      if (!$scope.data.oldPassword || !$scope.data.password || !$scope.data.repassword) {
                          e.preventDefault();
                          Popup.showAlert("Nie uzupełniono wszystkich pól!", "Aby zmienić hasło musisz uzupełnić wszystkie pola!");
                      } else {
                          Popup.showLoading("Zmienianie hasła...");
                          Rest.changePassword($scope.data.oldPassword, $scope.data.password).then(
                              function (response) {
                                  if (response.data.status == true) {
                                      Popup.hideLoading();
                                      Popup.showAlert("Zrobione!", response.data.response);
                                      $ionicSideMenuDelegate.toggleLeft(false);
                                      AuthService.logout();
                                      $location.path("/login/main");
                                  } else {
                                      Popup.hideLoading();
                                      Popup.showAlert("Błąd!", response.data.error)
                                  }

                              },
                              function (error) {
                                  Popup.hideLoading();
                                  Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!")
                              });

                      }
                  }
              }
            ]
        });
    }

    $scope.showAbout = function () {
        $location.path("/logged/about");
    }

})

