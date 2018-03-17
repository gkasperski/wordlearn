angular.module('starter.setsControllers', [])

.controller('SetDetailsCtrl', function ($scope, $cordovaSpinnerDialog, $stateParams, UserProfile, $cordovaToast) {

    $scope.set = UserProfile.getTemp();

    $scope.refreshSet = function () {
        $cordovaSpinnerDialog.show("Prosze czekać", "Trwa odświeżanie zestawu.", true);
        UserProfile.retrieveSetElements($stateParams.setId).then(function (response) {
            $scope.set.words = response.data.words;
            UserProfile.setTemp($scope.set);
            window.localStorage.setItem("setCache: " + $stateParams.setId, JSON.stringify($scope.set));
            $cordovaSpinnerDialog.hide();
        }, function (error) {
            $cordovaSpinnerDialog.hide();
        });
    };

})

.controller('SetsCtrl', function ($scope, $ionicActionSheet, $ionicScrollDelegate, $location, $ionicPopup, Rest, Popup, $ionicHistory, UserProfile, $state, $cordovaToast, $cordovaSpinnerDialog) {

    // nawigacja
    $scope.nav = {
        showDelete: false
    };

    // zestawy
    $scope.sets = UserProfile.getSets();


    // nowy zestaw funkcje
    $scope.elements = [
        ["", ""]
    ];
    $scope.newSet = {
        title: window.localStorage.getItem("newSetTitleSave: " + UserProfile.getUserName()) || "",
        setVisibility: true
    };
    var setSave = window.localStorage.getItem("newSetSave: " + UserProfile.getUserName());
    if (setSave) {
        try {
            $scope.elements = JSON.parse(setSave);
        } catch (e) {
            console.log(e);
        }
    }

    $scope.loadSet = function (id, title) {
        var set = {
            title: title,
            id: id,
            words: []
        };
        var setCache = window.localStorage.getItem("setCache: " + id);
        if (setCache) {
            try {
                UserProfile.setTemp(JSON.parse(setCache));
                $state.go("logged.sets-set", { setId: id, setTitle: title });
            } catch (e) {
                console.log(e);
            }
        } else {
            $cordovaSpinnerDialog.show("Prosze czekać", "Trwa ładowanie zestawu.", true);
            UserProfile.retrieveSetElements(id).then(function (response) {
                if (response.data.status == true) {
                    set.words = response.data.words;
                    UserProfile.setTemp(set);
                    window.localStorage.setItem("setCache: " + id, JSON.stringify(set));
                    $state.go("logged.sets-set", { setId: id, setTitle: title });
                } else if (response.data.status == false && response.data.error_code != 700) {
                    Popup.showAlert("Błąd", response.data.error);
                }
                $cordovaSpinnerDialog.hide();
            }, function (error) {
                $cordovaSpinnerDialog.hide();
            });
        };
    }

    $scope.saveNewSet = function () {
        window.localStorage.setItem("newSetSave: " + UserProfile.getUserName(), JSON.stringify($scope.elements));
        window.localStorage.setItem("newSetTitleSave: " + UserProfile.getUserName(), $scope.newSet.title);
    };

    $scope.addNewElement = function () {
        $scope.elements.push(["", ""]);
        $ionicScrollDelegate.scrollBottom();
        $scope.saveNewSet();
    };

    $scope.appendAlternative = function (index) {
        $scope.elements[index].push("");
        $scope.saveNewSet();
        $location.hash('item' + index + '-' + $scope.elements[index].length);
        $ionicScrollDelegate.anchorScroll();
    };

    $scope.removeAlternative = function (fIndex, index) {
        $scope.elements[fIndex].splice(index, 1);
        $scope.saveNewSet();
    };

    $scope.removeElement = function (index) {
        $scope.elements.splice(index, 1);
        $scope.saveNewSet();
    };

    function deleteAllElements() {
        $scope.elements = Array(["", ""]);
        $scope.newSet.title = "";
        $scope.nav.showDelete = false;
        window.localStorage.removeItem("newSetSave: " + UserProfile.getUserName());
        window.localStorage.removeItem("newSetTitleSave: " + UserProfile.getUserName());
    }

    $scope.deleteAllElements = function () {
        var confirmPopup = $ionicPopup.show({
            title: 'Usuwanie',
            template: 'Czy napewno chcesz usunąć wszystkie elementy?',
            buttons: [{
                text: 'Anuluj',
                type: 'button-positive button-outline',
            }, {
                text: 'Usuń',
                type: 'button-assertive',
                onTap: function () {
                    deleteAllElements();
                }
            }]
        });
    };

    $scope.addTheSet = function () {
        $ionicPopup.show({
            template: '<ion-toggle ng-model="newSet.setVisibility" toggle-class="toggle-calm" checked="newSet.setVisibility">Widoczność zestawu: </ion-toggle>',
            title: 'Zatwierdź',
            subTitle: 'Widoczność zestawu określa czy inni użytkownicy mogą widzieć Twój zestaw i z niego korzystać.',
            scope: $scope,
            buttons: [
              { text: 'Anuluj', type: 'button-light' },
              {
                  text: '<b>Dodaj zestaw</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                      Popup.showLoading("Dodawanie zestawu...");
                      Rest.addTheSet($scope.newSet.title, $scope.newSet.setVisibility, $scope.elements).then(
                          function (response) {
                              if (response.data.status == true) {
                                  UserProfile.retrieveSets().then(function (response) {
                                      if (response.data.status == true) {
                                          Popup.showAlert("Zrobione!", response.data.response);
                                          $ionicHistory.goBack();
                                          deleteAllElements();
                                      }
                                      else {
                                          Popup.showAlert("Błąd!", response.data.error);
                                      }
                                  }, function (error) {
                                      Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!")
                                      Popup.hideLoading();
                                  });
                              } else {
                                  Popup.showAlert("Błąd!", response.data.error);
                              }
                              Popup.hideLoading();
                          },
                          function (error) {
                              Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!")
                              Popup.hideLoading();
                          });
                  }
              }
            ]
        });
    };
    // KONIEC - Tworzenie nowego zestawu funkcje

    // Edytowanie zestawu - funkcje - START

    $scope.editSetsElements = UserProfile.getSetElements($state.params.setId);

    $scope.saveEditSet = function () {
        window.localStorage.setItem("editSetSave: " + $state.params.setId, JSON.stringify($scope.editSetsElements));
    };

    $scope.deleteAllElementsE = function (title) {
        var confirmPopup = $ionicPopup.show({
            title: 'Usuwanie',
            template: 'Czy napewno chcesz usunąć wszystkie elementy?',
            buttons: [{
                text: 'Anuluj',
                type: 'button-positive button-outline',
            }, {
                text: 'Usuń',
                type: 'button-assertive',
                onTap: function () {
                    var set = {
                        id: $state.params.setId,
                        words: Array(["", ""]),
                        title: title
                    }
                    UserProfile.pushEditSave(set);
                    $scope.editSetsElements = UserProfile.getSetElements($state.params.setId);
                    $scope.nav.showDelete = false;
                }
            }]
        });
    };

    $scope.forgotEditing = function () {
        var confirmPopup = $ionicPopup.show({
            title: 'Usuwanie',
            template: 'Czy napewno chcesz porzucić wszystkie zmiany i przywrócić stan początkowy?',
            buttons: [{
                text: 'Anuluj',
                type: 'button-positive button-outline',
            }, {
                text: 'Porzuć zmiany',
                type: 'button-energized',
                onTap: function () {
                    Popup.showLoading("Porzucanie zmian...");
                    UserProfile.retrieveSetElements($state.params.setId).then(function (response) {
                        var set = {
                            id: $state.params.setId,
                            words: response.data.words,
                            title: response.data.title
                        }
                        UserProfile.pushEditSave(set);
                        $scope.editSetsElements = UserProfile.getSetElements($state.params.setId);
                        Popup.hideLoading();
                        $scope.nav.showDelete = false;
                    });
                }
            }]
        });
    };

    $scope.addNewElementE = function () {
        $scope.editSetsElements.words.push(["", ""]);
        $ionicScrollDelegate.scrollBottom();
        $scope.saveEditSet();
    };

    $scope.appendAlternativeE = function (index) {
        $scope.editSetsElements.words[index].push("");
        $scope.saveEditSet();
        $location.hash('item' + index + '-' + $scope.editSetsElements.words[index].length);
        $ionicScrollDelegate.anchorScroll();
    };

    $scope.removeAlternativeE = function (fIndex, index) {
        $scope.editSetsElements.words[fIndex].splice(index, 1);
        $scope.saveEditSet();
    };

    $scope.removeElementE = function (index) {
        $scope.editSetsElements.words.splice(index, 1);
        $scope.saveEditSet();
    };

    function setEditFinish(id, title, words) {
        Rest.editSet(id, words).then(function (response) {
            if (response.data.status == true) {
                Popup.showLoading("Odświeżanie zestawów");
                UserProfile.retrieveSets().then(function (response) {
                    if (response.data.status == true) {
                        Popup.showLoading("Odświeżanie elementów");
                        UserProfile.retrieveSetElements(id).then(function (response) {
                            if (response.data.status == true) {
                                var set = {
                                    title: title,
                                    id: id,
                                    words: response.data.words
                                };
                                localStorage.setItem("setCache: " + $scope.editSetsElements.id, JSON.stringify(set));
                                localStorage.removeItem("editSetSave: " + $scope.editSetsElements.id);
                                Popup.hideLoading();
                                $state.go("logged.sets");
                                $cordovaToast.show('Zmiany w zestawie zostały zapisane.', 'long', 'bottom');
                            } else if (response.data.status == false && response.data.error_code != 700) {
                                Popup.showAlert("Błąd", response.data.error);
                                Popup.hideLoading();
                            } else if (response.data.error_code == 700) {
                                Popup.hideLoading();
                            }
                        }, function (error) {
                            Popup.hideLoading();
                        })
                    } else if (response.data.status == false && response.data.error_code != 700) {
                        Popup.showAlert("Błąd", response.data.error);
                        Popup.hideLoading();
                    } else if (response.data.error_code == 700) {
                        Popup.hideLoading();
                    }
                }, function (error) {
                    Popup.hideLoading();
                })
            } else if (response.data.status == false && response.data.error_code != 700) {
                Popup.showAlert("Błąd", response.data.error);
                Popup.hideLoading();
            } else if (response.data.error_code == 700) {
                Popup.hideLoading();
            }
        }, function (error) {
            Popup.hideLoading();
        })
    };

    $scope.finishEditing = function () {
        var confirmPopup = $ionicPopup.show({
            title: 'Zatwierdź',
            template: 'Czy napewno chcesz zapisać wszystkie zmiany? Zmiań nie będzie można już odwrócić.',
            buttons: [{
                text: 'Anuluj',
                type: 'button-positive button-outline',
            }, {
                text: 'Tak, zapisz zmiany.',
                type: 'button-balanced',
                onTap: function () {
                    Popup.showLoading("Zapisywanie zmian w zestawie...");
                    if ($state.params.setTitle != $scope.editSetsElements.title) {
                        Rest.editSetTitle($scope.editSetsElements.id, $scope.editSetsElements.title).then(function (response) {
                            if (response.data.status == true) {
                                setEditFinish($scope.editSetsElements.id, $scope.editSetsElements.title, $scope.editSetsElements.words);
                            } else if (response.data.status == false && response.data.error_code != 700){
                                Popup.hideLoading();
                                Popup.showAlert("Błąd", response.data.error);
                            } else if (response.data.error_code == 700) {
                                Popup.hideLoading();
                            }
                        }, function (error) {
                            Popup.hideLoading();
                        })
                    } else {
                        setEditFinish($scope.editSetsElements.id, $state.params.setTitle, $scope.editSetsElements.words);
                    }
                }
            }]
        });
    };

    // Twoje zestawy funkcje
    $scope.mySetsOptions = function (item) {
        if (item.visibility == 0) {
            toggleVisibility = '<span class="icon ion-eye calm"></span> Włącz widoczność zestawu';
        } else if (item.visibility == 1) {
            toggleVisibility = '<span class="icon ion-eye-disabled"></span> Wyłącz widoczność zestawu';
        }
        $ionicActionSheet.show({
            buttons: [
              { text: toggleVisibility },
              { text: '<i class="icon ion-gear-a energized"></i> Edytuj zestaw <br/>' }
            ],
            destructiveText: '<i class="icon ion-android-remove-circle assertive"></i> Usuń zestaw',
            titleText: 'Wykonaj czynność: ',
            cancelText: 'Anuluj',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0: {
                        Popup.showLoading("Zmienianie widoczności zestawu...");
                        var visibility;
                        if (item.visibility == 1) {
                            visibility = 0;
                        } else visibility = 1;
                        Rest.changeSetVisibility(item.id, visibility).then(function (response) {
                            if (response.data.status == true) {
                                Popup.showLoading("Odświeżanie zestawów...");
                                UserProfile.retrieveSets().then(function () {
                                    $scope.sets = UserProfile.getSets();
                                    Popup.hideLoading();
                                })
                            } else if (response.data.status == false) {
                                Popup.showAlert("Błąd!", response.data.error);
                                Popup.hideLoading();
                            }
                        }),
                        function (error) {
                            Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!")
                            Popup.hideLoading();
                        }
                        return true;
                        break;
                    }
                    case 1: {
                        Popup.showLoading("Wczytywanie zestawu...");

                        // pobieranie danych o zestawie..
                        var editSetsElementsSave = window.localStorage.getItem("editSetSave: " + item.id);
                        var success = true;
                        if (editSetsElementsSave) {
                            try {
                                UserProfile.pushEditSave(JSON.parse(editSetsElementsSave));
                                Popup.hideLoading();
                                $state.go("logged.editset", { setId: item.id, setTitle: item.title });
                            } catch (e) {
                                success = false;
                                console.log(e);
                            }
                        }
                        if (!editSetsElementsSave || !success) {
                            console.log("!editSetsElementsSave || !success");
                            UserProfile.retrieveSetElements(item.id).then(function (response) {
                                if (response.data.status == true) {
                                    var set = {
                                        id: item.id,
                                        words: response.data.words,
                                        title: item.title
                                    }
                                    UserProfile.pushEditSave(set);
                                    $state.go("logged.editset", { setId: item.id, setTitle: item.title });
                                } else if (response.data.status == false && response.data.error_code != 700) {
                                    Popup.showAlert("Błąd", response.data.error);
                                }
                                Popup.hideLoading();                   
                            })
                        }
                        return true;
                        break;
                    }
                };
            },
            destructiveButtonClicked: function () {
                var confirmPopup = $ionicPopup.show({
                    title: 'Usuwanie',
                    template: 'Czy napewno chcesz usunąć zestaw "' + item.title + '"?',
                    buttons: [{
                        text: 'Anuluj',
                        type: 'button-positive button-outline',
                    }, {
                        text: 'Usuń',
                        type: 'button-assertive',
                        onTap: function () {
                            Popup.showLoading("Trwa usuwanie...");
                            Rest.removeTheSet(item.id).then(function (response) {
                                if (response.data.status == true) {
                                    localStorage.removeItem("editSetSave: " + item.id);
                                    Popup.showLoading("Odświeżanie zestawów...");
                                    UserProfile.retrieveSets().then(function () {
                                        $scope.sets = UserProfile.getSets();
                                        Popup.hideLoading();
                                    })
                                } else if (response.data.status == false) {
                                    Popup.showAlert("Błąd!", response.data.error);
                                    Popup.hideLoading();
                                }
                            }),
                            function (error) {
                                Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!")
                                Popup.hideLoading();
                            }
                        }
                    }]
                });
                return true;
            }
        });
    };
    $scope.copy = {
        title: ''
    };
    $scope.otherSetsOptions = function (item) {

        $ionicActionSheet.show({
            buttons: [
              { text: '<i class="icon ion-ios-photos-outline positive"></i> Skopiuj zestaw <br/>' }
            ],
            destructiveText: '<i class="icon ion-android-remove-circle assertive"></i> Unsubskrybuj zestaw',
            titleText: 'Wykonaj czynność: ',
            cancelText: 'Anuluj',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0: {
                        $ionicPopup.show({
                            template: '<input type="text" ng-model="copy.title" placeholder="Wpisz nowy tytuł dla zestawu"/>',
                            title: 'Kopiowanie zestawu',
                            subTitle: 'Wpisz nowy tytuł dla zestawu który chcesz skopiować:',
                            scope: $scope,
                            buttons: [
                              { text: 'Anuluj' },
                              {
                                  text: '<b>Skopiuj</b>',
                                  type: 'button-positive',
                                  onTap: function (e) {
                                      Popup.showLoading("Kopiowanie");
                                      UserProfile.retrieveSetElements(item.id).then(function (response) {
                                          if (response.data.status == true) {
                                              Rest.addTheSet($scope.copy.title, "0", response.data.words).then(function (response) {
                                                  if (response.data.status == true) {
                                                      Popup.showLoading("Odświeżanie zestawów");
                                                      UserProfile.retrieveSets().then(function (response) {
                                                          Popup.hideLoading();
                                                          Popup.showAlert("Zrobione", "Zestaw został skopiowany pomyślnie.");
                                                      }, function (error) {

                                                          Popup.hideLoading();
                                                          Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!");
                                                      });
                                                  } else {
                                                      Popup.hideLoading();
                                                      Popup.showAlert("Błąd", response.data.error);
                                                  }
                                              }, function (error) {
                                                  Popup.hideLoading();
                                                  Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!");
                                              });
                                          } else {
                                              Popup.hideLoading();
                                              Popup.showAlert("Błąd", response.data.message);
                                          }

                                      }, function (error) {
                                          Popup.hideLoading();
                                          Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!");
                                      });
                                  }
                              }
                            ]
                        });
                        break;
                    }
                }
                return true;
            },
            destructiveButtonClicked: function () {
                var confirmPopup = $ionicPopup.show({
                    title: 'Unsubskrybowanie',
                    template: 'Czy napewno chcesz unsubskrybować zestaw "' + item.title + '"?',
                    buttons: [{
                        text: 'Anuluj',
                        type: 'button-positive button-outline',
                    }, {
                        text: 'Usuń',
                        type: 'button-assertive',
                        onTap: function () {
                            Popup.showLoading("Unsubskrybowanie");
                            Rest.unsubscribeSet(item.id).then(function (response) {
                                if (response.data.status == true) {
                                    Popup.showLoading("Odświeżanie zestawów...");
                                    UserProfile.retrieveSets().then(function () {
                                        $scope.sets = UserProfile.getSets();
                                        Popup.hideLoading();
                                    })
                                } else if (response.data.status == false) {
                                    Popup.showAlert("Błąd!", response.data.error);
                                    Popup.hideLoading();
                                }
                            }),
                            function (error) {
                                Popup.showAlert("Błąd!", "Sprawdź połączenie z internetem i spróbuj ponownie!");
                                Popup.hideLoading();
                            }
                        }
                    }]
                });
                return true;
            }
        });
    };

    $scope.refreshSets = function () {
        Popup.showLoading("Odświeżanie...");
        UserProfile.retrieveSets().then(function () {
            $scope.sets = UserProfile.getSets();
            Popup.hideLoading();
        }, function () {
            Popup.hideLoading();
        });
    };
    // KONIEC - Twoje zestawy funkcje
})