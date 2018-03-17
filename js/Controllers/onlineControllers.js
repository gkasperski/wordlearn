angular.module('starter.onlineControllers', [])


.controller('OnlineCtrl', function ($scope, Rest, Popup, $cordovaToast) {

    $scope.search = {
        mode: "0",
        phrase: ""
    };

    $scope.result = {
        done: false,
        quantity: 0,
        sets: []
    };

    $scope.searchSets = function () {
        Popup.showLoading("Wyszukiwanie");
        Rest.listSets($scope.search.mode, $scope.search.phrase).then(function (response) {
            $scope.result.done = true;
            if (response.data.status == true) {
                $scope.result.sets = response.data.response;
                $scope.result.quantity = $scope.result.sets.length;
                $cordovaToast.show('Znaleziono ' + $scope.result.quantity + ' zestawów spełniających kryteria wyszukiwania.', 'long', 'bottom');
            } else {
                $cordovaToast.show('Nie znaleziono zestawów spełniających kryteriów wyszukiwania.', 'long', 'bottom');
            }
            Popup.hideLoading();
        },
        function (error) {
            $cordovaToast.show('Problem z połączeniem. Spróbuj ponownie.', 'long', 'bottom');
            Popup.hideLoading();
        });
    };
})

.controller('OnlineDetailsCtrl', function ($scope, $stateParams, UserProfile, $cordovaSpinnerDialog, Rest, Popup, $cordovaToast) {

    $cordovaSpinnerDialog.show("Trwa ładowanie", "Proszę czekać.", true);

    $scope.set = {
        title: $stateParams.setTitle,
        id: $stateParams.setId,
        words: []
    };

    UserProfile.retrieveSetElements($stateParams.setId).then(function (response) {
        $scope.set.words = response.data.words;
        $cordovaSpinnerDialog.hide();
    });

    $scope.subscribe = function () {
        $cordovaSpinnerDialog.show("Proszę czekać", "Trwa subskrybowanie zestawu", true);
        Rest.subscribeSet($scope.set.id).then(function (response) {
            if (response.data.status == true) {
                UserProfile.retrieveSets().then(function () {
                    Popup.showAlert("Zrobione", response.data.response);
                    $cordovaSpinnerDialog.hide();
                });
                
            } else {
                Popup.showAlert("Błąd", response.data.error);
                $cordovaSpinnerDialog.hide();
            }
           
        }, function (error) {
            $cordovaToast.show('Problem z połączeniem. Spróbuj ponownie.', 'long', 'bottom');
        });
    };
   



})
