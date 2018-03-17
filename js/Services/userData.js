angular.module('starter.userData', [])

.service('UserProfile', function ($http, $ionicPopup, Popup, $timeout, $state, $location, $q, $cordovaToast, Credentials) {

    var _user = {
        avatar: 'img/0.png',
        email: '',
        name: '',
        lastLogin: '',
        registeredSince: ''
    };

    var _sets = {
        mine: [],
        foreign: []
    };

    this.getUserName = function () {
        return _user.name;
    };

    var _setsElements = [];

    var _temp = {};

    this.setTemp = function (data) {
        _temp = data;
    };

    this.getTemp = function () {
        return _temp;
    };

    this.pushEditSave = function (data) {
        var found = false;
        window.localStorage.setItem("editSetSave: " + data.id, JSON.stringify(data));
        for (var i = 0; i < _setsElements.length; i++) {
            if (parseInt(_setsElements[i].id) === parseInt(data.id)) {
                found = true;
                _setsElements[i].title = data.title;
                _setsElements[i].words = data.words;
            }
        }
        if (found == false) {
            _setsElements.push(data)
        }
    };

    this.retrieveSetElements = function (id) {
        return $http.post("https://wordlearn.pl/rest/client/data/listWords", {
            setId: id
        })
         .success(function (data) {
             if (data.error_code == 700) {
                 Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                     Credentials.destroy();
                     $state.go('login.main');
                 });
             }
         })
        .error(function () {
            $cordovaToast.show('Brak połączenia z internetem oraz kopii zestawu w pamięci aplikacji.', 'long', 'bottom');
        })
    };

    this.getSetElements = function (id) {
        for (var i = 0; i < _setsElements.length; i++) {
            if (parseInt(_setsElements[i].id) === parseInt(id)) {
                return _setsElements[i];
            }
        }
    };

    this.setSets = function (mine, foreign) {
        if (mine) {
            _sets.mine = mine;
        }
        if (foreign) {
            _sets.foreign = foreign;
        }
    };

    this.getProfile = function () {
        return _user;
    };

    this.getSets = function () {
        return _sets;
    };

    this.retrieveProfile = function () {
        return $http.get("https://wordlearn.pl/rest/client/data/getUserProfile")
        .success(function (data) {
            window.localStorage.setItem("Profile", JSON.stringify(data.response));
            if (data.status == false) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Sesja wygasła!',
                    template: 'Zostałeś wylogowany, ponieważ ktoś inny zalogował się na Twoje konto lub zalogowałeś się na nie z innego urządzenia.'
                });
            }
        });

    };

    this.retrieveSets = function () {
        return $http.get("https://wordlearn.pl/rest/client/data/listMySets")

        .success(function (data) {
            if (data.status == true) {
                _sets.mine = data.mine;
                _sets.foreign = data.foreign;
                window.localStorage.setItem("sets", JSON.stringify(data.mine));
                window.localStorage.setItem("setsForeign", JSON.stringify(data.foreign));
            } else if (data.status == false && data.error_code == 201) {
                _sets.mine = Array();
                _sets.foreign = Array();
            } else if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        })
        .error(function (data) {
            $cordovaToast.show('Wystąpił błąd. Brak połączenia z internetem.', 'long', 'bottom');
        });

    };

    this.setProfile = function (data) {
        _user.avatar = "img/" + data.avatar + ".png";
        _user.email = data.email;
        _user.name = data.nickname;
        _user.lastLogin = data.last_login;
        _user.registeredSince = data.registration_date;
    };


});

