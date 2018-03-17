angular.module('starter.learningControllers', [])

.directive('flipContainer', function () {
    return {
        restrict: 'C',
        link: function ($scope, $elem, $attrs) {
            $scope.flip = function () {
                $elem.toggleClass('flip');
            }
        }
    };
})

.directive('toggleClass', function () {
    return {
        restrict: 'C',
        link: function ($scope, $elem, $attrs) {
            $scope.selectCard = function () {
                $elem.toggleClass('card-selected');
            }
        }
    };
})

.controller('FlashcardsCtrl', function ($scope, UserProfile, $ionicSlideBoxDelegate, $timeout, $ionicScrollDelegate) {

    // deklaracje
    $scope.set = {
        title: '',
        id: '',
        words: []
    };
    $scope.max;
    $scope.current = 0;
    $scope.flipped = [];
    //------------

    $scope.set = UserProfile.getTemp();
    $timeout(function () {
        var slider = $ionicSlideBoxDelegate.$getByHandle("slider");
        var contentScroll = $ionicScrollDelegate.$getByHandle("content");

        $scope.max = slider.slidesCount()
        $scope.current = slider.currentIndex() + 1;

        // freezuje scroll, gdy w zestawie sa mniej niz 2 slowka
        //contentScroll.freezeScroll(($scope.set.words[0].length <= 2));

        if ($scope.set.words[0].length <= 2) {
            contentScroll.freezeScroll(true);
        } else contentScroll.freezeScroll(false);


        $scope.goToFirstOne = function () {
            slider.slide(0);
        };

        $scope.goToLastOne = function () {
            slider.slide($scope.max - 1);
        };

    }, 100);

    $scope.slideHasChanged = function (index) {
        $scope.current = index + 1;
        $ionicScrollDelegate.scrollTop();
        $timeout(function () {
            var contentScroll = $ionicScrollDelegate.$getByHandle("content");
            if ($scope.set.words[index].length <= 2) {
                contentScroll.freezeScroll(true);
            } else contentScroll.freezeScroll(false);
        }, 100);
    };

    $scope.isFlipped = function (index) {
        var myEl = angular.element(document.querySelector('#flip' + index));
        if (myEl.hasClass('flip')) {
            return true;
        } else return false;
    };

    $scope.resize = function () {
        $timeout(function () {
            $ionicScrollDelegate.scrollTop();
            $ionicScrollDelegate.resize();
        }, 100)

    };




})

.controller('PairsCtrl', function ($scope, UserProfile, $timeout, $interval, MyMath, Popup) {
    // definicje
    $scope.set = UserProfile.getTemp();
    $scope.wordsToPair = [];
    $scope.translations = [];
    $scope.best = "0";
    var bestTime = 9999 * 1000;
    var max;
    var matched;
    var isWordSelected;
    var isTranslationSelected;
    var initialTime;
    var time;
    var timer;

    // losowanie slow
    $scope.randomize = function () {
        initialTime = (new Date()).getTime();
        $scope.timeRounded = 0;
        isTranslationSelected = false;
        isWordSelected = false;
        matched = 0;
        if (timer) $interval.cancel(timer);
        timer = $interval(function () { time = (new Date()).getTime() - initialTime; $scope.timeRounded = MyMath.roundedToFixed(parseFloat(time / 1000), 2); }, 10);

        // Fisher-Yates algorytm
        var shuffleArray = MyMath.shuffleArray;

        var randomWords = angular.copy($scope.set.words); // kopia tablicy slow na potrzeby potasowania
        shuffleArray(randomWords);

        for (var i = 0; i < randomWords.length ; i++) {
            $scope.wordsToPair[i] = {}; // zeby kazde slowo mialo osobny parametr isSelected
            $scope.wordsToPair[i].word = randomWords[i][0];
            $scope.wordsToPair[i].isSelected = false;
            tempArray = []; // tablica dla wszystkich slow z wyjatkie indeksu 0.. pozniej losowane sa z niej odpowiedzi
            for (var j = 1 ; j < randomWords[i].length ; j++) {
                tempArray[j - 1] = randomWords[i][j];
            }
            $scope.translations[i] = {}; // jw
            $scope.translations[i].word = tempArray[Math.floor(Math.random() * tempArray.length)];
            $scope.translations[i].isSelected = false;
            max = i + 1;
            if (i == 5) break; // max 6 slow ale moze byc tez mniej
        }
        shuffleArray($scope.translations); // zeby tlumaczenia mialy inna kolejnosc niz elementy
    };

    var uncheckWords = function () {
        for (i = 0; i < $scope.wordsToPair.length ; i++) {
            $scope.wordsToPair[i].isSelected = false;
        }
    };

    var uncheckTranslations = function () {
        for (i = 0; i < $scope.translations.length ; i++) {
            $scope.translations[i].isSelected = false;
        }

    };

    var uncheckAll = function () {
        uncheckTranslations();
        uncheckWords();
        isTranslationSelected = false;
        isWordSelected = false;
    };

    var setIfMatch = function () {
        if (isWordSelected && isTranslationSelected) {
            var element = null;
            var translation = null;
            var match = false;

            // znajdz wybrany element
            for (i = 0 ; i < $scope.wordsToPair.length ; i++) {
                if ($scope.wordsToPair[i].isSelected) {
                    element = $scope.wordsToPair[i];
                    break;
                }
            }
            // znajdz wybrane tlumaczenie
            for (i = 0 ; i < $scope.translations.length ; i++) {
                if ($scope.translations[i].isSelected) {
                    translation = $scope.translations[i];
                    break;
                }
            }
            // sprawdz czy sie zgadzaja ze soba
            for (i = 0 ; i < $scope.set.words.length ; i++) {
                if ($scope.set.words[i][0] == element.word) {
                    for (j = 1 ; j < $scope.set.words[i].length ; j++) {
                        if ($scope.set.words[i][j] == translation.word) {
                            match = true;
                            break;
                        }
                    }
                    break;
                }
            }

            $timeout(function () {
                if (match) {
                    element.isMatched = true;
                    translation.isMatched = true;
                    if (++matched == max) {
                        $interval.cancel(timer);
                        var popup = Popup.showAlert("<b>Zrobione!</b></hr>", "Udało Ci się dobrać ze sobą wszystkie elementy w czasie <b>" + $scope.timeRounded + " sekund!</b>").then(function () {
                            if (bestTime > time) {
                                bestTime = time;
                                $scope.best = $scope.timeRounded;
                            }
                        });

                    }
                } else if (!match) { // jesli sie nie zgadzają zaświeć je na 0.25s na kolor czerwony i usun wszystkie zaznaczone
                    element.isWronglyMatched = true;
                    translation.isWronglyMatched = true;
                    matched = 0;
                    $timeout(function () { element.isWronglyMatched = false, translation.isWronglyMatched = false; }, 250);
                    $timeout(function () {
                        for (i = 0 ; i < $scope.wordsToPair.length ; i++) {
                            $scope.wordsToPair[i].isMatched = false;
                        }
                    }, 250);
                    $timeout(function () {
                        for (i = 0 ; i < $scope.translations.length ; i++) {
                            $scope.translations[i].isMatched = false;
                        }
                    }, 250);
                }

                element.isSelected = false;
                translation.isSelected = false;
            }, 250);
            isTranslationSelected = false;
            isWordSelected = false;
        }
    };

    $scope.selectWord = function (item) {
        if (!item.isMatched) {
            if (item.isSelected) {
                item.isSelected = false;
                isWordSelected = false;
            } else if (isWordSelected) {
                uncheckWords();
                item.isSelected = true;
            } else {
                isWordSelected = true;
                item.isSelected = true;
            }
            setIfMatch();
        }
    };

    $scope.selectTranslation = function (item) {
        if (!item.isMatched) {
            if (item.isSelected) {
                item.isSelected = false;
                isTranslationSelected = false;
            } else if (isTranslationSelected) {
                uncheckTranslations();
                item.isSelected = true;
            } else {
                isTranslationSelected = true;
                item.isSelected = true;
            }
            setIfMatch();
        }
    };
    Popup.showAlert("Gotowy do gry?", "Po naciśnieciu <u><b>OK</u></b> dobierz w pary elementy rozmieszczone na górze ekranu z ich odpowiednikami na dole tak, aby każdy element miał swoją parę. Jeżeli się pomylisz zaczynasz od początku. <b>Powodzenia!</b>").then(function () {
        $scope.randomize();
    });
    $scope.$on('$destroy', function () {
        $interval.cancel(timer);
    });
})

.controller('AbcdCtrl', function ($scope, UserProfile, Popup, MyMath, $timeout, $ionicPopup, $state, $interval) {
    $scope.set = UserProfile.getTemp();
    $scope.started = false;
    $scope.timeLeftRounded = "20.0";
    $scope.score = 0;
    $scope.bestScore = 0;

    $scope.round = {
        question: "",
        answer: []
    };

    var timeLeft = null;
    var bonusTime = null;
    var timer = null;

    var goodAnswer = null;

    var wordsToPick;
    var shuffleArray = MyMath.shuffleArray;

    var randomQuestionIndex; // losowe pytanie
    var lastQuestionIndex;

    var randomAnswerIndex; // losowa odpowiedz z dostepnych w pytaniu

    var randomGoodAnswerIndex; // jako która ma być dobra odpowiedź 1-5

    $scope.submitAnswer = function (answer) {
        if ($scope.set.words[lastQuestionIndex].indexOf(answer) !== -1) { // jest uzywana tablica set.words gdyz z wordsToPick sa wycinane elementy i indeksy niebylyby zgodne
            bonusTime += 3000;
            $scope.score += 100;
            nextQuestion();
        } else gameOver("Zła odpowiedź!", "<p>Zaznaczono: <span style='text-decoration: line-through;'>" + answer + "</span>.</p>");
    };

    function gameOver(title, additionalInfo) {
        stopTimer();
        // rozny komunikat w zaleznosci od tego czy odpowiedz jest jedna czy kilka.. jesli jest kilka do wypisuje wszystkie po przecinku.
        var template = '';
        if ($scope.set.words[lastQuestionIndex].length == 2) {
            template += ('Prawidłowa odpowiedź dla <b>' + $scope.round.question + '</b> to <b>' + goodAnswer + '</b>.' + additionalInfo + '<p>Twój wynik to: <b>' + $scope.score + ' pkt.</b></p><p><u>Czy chcesz spróbować ponownie?</b></u></p>');
        } else {
            template += ('Prawidłowe odpowiedzi dla <b>' + $scope.round.question + '</b> to: <b><p>');
            for (var i = 1; i < $scope.set.words[lastQuestionIndex].length; i++) {
                template += ($scope.set.words[lastQuestionIndex][i]);
                if (i + 1 < $scope.set.words[lastQuestionIndex].length)
                    template += ", "; else template += ".";
            }
            template += '</p></b>' + additionalInfo + '<p>Twój wynik to: <b>' + $scope.score + ' pkt.</b></p><p><u>Czy chcesz spróbować ponownie?</b></u></p>';
        }
        $ionicPopup.show({
            title: title,
            template: template,
            buttons: [
                {
                    text: "Nie",
                    onTap: function () {
                        $state.go("logged.sets-set", { setId: $scope.set.id, setTitle: $scope.set.title });
                        stopTimer();
                    }
                },
                {
                    text: "Tak",
                    type: "button-positive",
                    onTap: function () {
                        startTheGame();
                    }
                }
            ]
        });
    }

    function startTimer() {
        var initialTime = (new Date()).getTime();
        timer = $interval(function () {
            timeLeft = ((initialTime + bonusTime) - (new Date()).getTime());
            $scope.timeLeftRounded = MyMath.roundedToFixed(parseFloat(timeLeft / 1000), 1);
            if ((initialTime + bonusTime) < (new Date()).getTime()) {
                gameOver("Czas się skończył!", "");
            }
        }, 10);
    }

    function stopTimer() {
        $interval.cancel(timer);
    }

    function nextQuestion() {
        wordsToPick = angular.copy($scope.set.words); // tworzy kopie slow na ktorej bedzie pracowac
        do {
            randomQuestionIndex = MyMath.randomIntFromInterval(0, wordsToPick.length - 1); // wybiera losowe pytanie (indeks do niego)
        } while (randomQuestionIndex == lastQuestionIndex); // wybiera je dopoki nie jest takie samo jak ostatnie
        lastQuestionIndex = angular.copy(randomQuestionIndex); // po wybraniu zapisuje do innej zmiennej co zostalo wybrane zeby pozniej nie wybrac dwa razy tego samego pod rzad
        $scope.round.question = wordsToPick[randomQuestionIndex][0]; // przypisuje pytanie do widoku
        randomAnswerIndex = MyMath.randomIntFromInterval(1, wordsToPick[randomQuestionIndex].length - 1); // wybiera odpowiedz z dostepnych w pytaniu
        goodAnswer = wordsToPick[randomQuestionIndex][randomAnswerIndex]; // przypisuje ta odpowiedz jako dobra
        randomGoodAnswerIndex = MyMath.randomIntFromInterval(0, 4); // losuje w ktorym miejscu w tablicy dostepnych odpowiedzi znajdzie sie dobra odpowiedz

        for (var i = 0 ; i < 5 ; i++) { // for dla 5 odpowiedzi
            if (i == randomGoodAnswerIndex) { // jezeli pod tym indeksem ma byc dobra odpowiedz
                $scope.round.answer[i] = goodAnswer;
                for (j = 0 ; j < wordsToPick.length ; j++) {
                    if (wordsToPick[j][0] == $scope.round.question) { // usuwa element zeby zapobiec duplikowanym odpowiedziom
                        wordsToPick.splice(j, 1);
                    }
                }
            } else { // jezeli pod tym indeksem ma byc losowa zla odpowiedz
                var x;
                var randomAnswer;
                do { // wybiera element dopoki trafi na inny niz ten z pytania (zeby uniknac wiekszej ilosci niz 1 poprawnych odpowiedzi)
                    x = MyMath.randomIntFromInterval(0, wordsToPick.length - 1);
                    randomElement = wordsToPick[x];
                    randomAnswer = randomElement[MyMath.randomIntFromInterval(1, randomElement.length - 1)];
                } while (randomElement[0] == $scope.round.question);
                $scope.round.answer[i] = randomAnswer
                ;
                wordsToPick.splice(x, 1); // usuwa wybrana odpowiedz zeby pozniej nie wybrano tej samej
            }
        }
    }

    function startTheGame() {
        if ($scope.score > $scope.bestScore) {
            $scope.bestScore = $scope.score;
        }
        $scope.score = 0;
        bonusTime = 20000;
        startTimer();
        nextQuestion();
    }

    if ($scope.set.words.length >= 5) {
        Popup.showAlert("Gotowy do gry?", "Po naciśnieciu <u><b>OK</u></b> wybierz prawidłową odpowiedź w jak najszybszym czasie. Gra się skończy gdy się pomylisz lub minie czas. Za każdą prawidłową odpowiedź Twój czas zwiększy się o 3 sekundy. <p><b>Powodzenia!</b></p>").then(function () {
            startTheGame();
            $scope.started = true;
        });
    } else {
        Popup.showAlert("Za mały zestaw!", "Aby rozpocząć grę w ABCD zestaw musi zawierać <b>minimum 5 elementów</b>.").then(function () {
            $state.go("logged.sets-set", { setId: $scope.set.id, setTitle: $scope.set.title });
        })
    }
    $scope.$on('$destroy', function () {
        stopTimer();
    });
});