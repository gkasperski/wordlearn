angular.module('starter.rest', [])

.factory('Rest', function ($http, Popup, Credentials, $state) {

    function changeAvatar(avatar) {
        return $http.post("https://wordlearn.pl/rest/client/edit/changeAvatar", {
            newAvatar: avatar
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    function changePassword(oldPassword, newPassword) {
        return $http.post("https://wordlearn.pl/rest/client/edit/changePassword", {
            oldPassword: oldPassword,
            newPassword: newPassword
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    function addTheSet(title, visibility, elements) {
        return $http.post("https://wordlearn.pl/rest/client/data/createNewSet", {
            title: title,
            visibility: visibility,
            words: elements
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    function removeTheSet(id) {
        return $http.post("https://wordlearn.pl/rest/client/data/deleteSet", {
            setId: id
        })
    };

    function changeSetVisibility(id, visibility) {
        return $http.post("https://wordlearn.pl/rest/client/data/editSetVisibility", {
            setId: id,
            visibility: visibility
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    function editSet(id, words) {
        return $http.post("https://wordlearn.pl/rest/client/data/editSet", {
            setId: id,
            words: words
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    function editSetTitle(id, title) {
        return $http.post("https://wordlearn.pl/rest/client/data/editSetTitle", {
            setId: id,
            title: title
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    function editSetTitle(id, title) {
        return $http.post("https://wordlearn.pl/rest/client/data/editSetTitle", {
            setId: id,
            title: title
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    function listSets(mode, keyword) {
        if (mode == 0) {
            return $http.post("https://wordlearn.pl/rest/client/data/listSets", {
                keyword: keyword
            })
            .success(function (data) {
                if (data.error_code == 700) {
                    Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                        Credentials.destroy();
                        $state.go('login.main');
                    });
                }
            });
        } else if (mode == 1) {
            return $http.post("https://wordlearn.pl/rest/client/data/listSets", {
                author: keyword
            })
            .success(function (data) {
                if (data.error_code == 700) {
                    Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                        Credentials.destroy();
                        $state.go('login.main');
                    });
                }
            });
        }

    };

    function subscribeSet(setId) {
        return $http.post("https://wordlearn.pl/rest/client/data/addForeignSet", {
            setId: setId
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    function unsubscribeSet(setId) {
        return $http.post("https://wordlearn.pl/rest/client/data/deleteForeignSet", {
            setId: setId
        })
        .success(function (data) {
            if (data.error_code == 700) {
                Popup.showAlert("Nieważne logowanie", data.error).then(function () {
                    Credentials.destroy();
                    $state.go('login.main');
                });
            }
        });
    };

    return {
        changeAvatar: changeAvatar,
        changePassword: changePassword,
        addTheSet: addTheSet,
        removeTheSet: removeTheSet,
        changeSetVisibility: changeSetVisibility,
        editSet: editSet,
        editSetTitle: editSetTitle,
        listSets: listSets,
        subscribeSet: subscribeSet,
        unsubscribeSet: unsubscribeSet
    };

})

