angular.module('starter.shared', [])

.factory('Popup', function ($ionicPopup, $ionicLoading) {

    return {
        showAlert: function (title, msg) {
            return $ionicPopup.alert({
                title: title,
                template: msg
            });
        },
        showLoading: function (msg) {
            $ionicLoading.show({
                template: '<ion-spinner icon="android"></ion-spinner><p>' + msg + '</p>',
                noBackdrop: false,
                animation: 'fade-in',
                maxWidth: 200
            });
        },
        hideLoading: function () {
            $ionicLoading.hide();
        }
    }
})

.factory('Storage', function () {

    function patternRemove(pattern) {
        var i = localStorage.length;
        while (i--) {
            var key = localStorage.key(i);
            if (pattern.test(key)) {
                localStorage.removeItem(key);
            }
        }
    };

    return {
        patternRemove: patternRemove
    };
})


.factory('MyMath', function () {
    function roundedToFixed(_float, _digits) {
        var rounder = Math.pow(10, _digits);
        return (Math.round(_float * rounder) / rounder).toFixed(_digits);
    }

    function shuffleArray(array) {
        var m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return {
        roundedToFixed: roundedToFixed,
        shuffleArray: shuffleArray,
        randomIntFromInterval: randomIntFromInterval
    }
})

.factory('Credentials', function ($http, $ionicHistory, Storage) {
    var isAuthenticated = false;

    function destroy() {
        var email = localStorage.getItem("email");
        authToken = undefined;
        isAuthenticated = false;
        $http.defaults.headers.common['Authorization'] = undefined;
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        Storage.patternRemove(/setCache: /);
        localStorage.removeItem("authToken");
        localStorage.removeItem("sets");
        localStorage.removeItem("setsForeign");
        localStorage.removeItem("Profile");
        localStorage.setItem("email", email);
    }
    return {
        destroy: destroy,
        isAuthenticated: function () { return isAuthenticated; },
        setAuthenticated: function (bool) { isAuthenticated = bool; }
    }
});
