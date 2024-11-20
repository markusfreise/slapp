const { default: axios } = require("axios");
import { createApp } from 'vue';
import ffstyles from './components/styles.vue';

window.addEventListener('load',function() {
    
    const app = createApp({
        delimiters: ['${', '}'],
        data() {
            return {
                brand: config?(config.brand?config.brand:'slam24'):'slam24',
                screen: 'logo',
                waitForApi: false,
                // Settings
                bgVideo: true,
                title: 'Poetry Slam',
                bgColor: '#242424',
                fgColor: '#ff0000',
                secColor: '#00ff00',
                bumperAnimation: false,
                rounds: 2,
                scoreBoards: 7,
                lowHighStrike: true,
                decimals: true,
                luckyloser: false,
                topPoets: 3,
                // Poets
                poets: [],
                // UI
                isSingle: true,
                isHost: true,
                keysLocked: false,
                showRound: 1,
                setRound: 0,
                top3Interval: false,
                localData: '',
                debug: false,
                currentPoet: 0,
                iteratePoet: 0,
                currentScoreEdit: 0,
                currentScoreDecimal : '',
                lastJSONPoets: '',
                screens: ["logo","poet","poetscores","poetscore"]
            }
        },
        methods: {
            /**
             * set the current round
             * @param {integer} index
             */
            setSetRound: function( ) {
                this.setRound = !this.setRound;
            },
            /**
             * set the current poet
             * @param {integer} index
             */
            setPoet: function( index ) {
                this.currentPoet = index;
                this.iteratePoet = index;
                this.screen = 'poet';
                this.updateAll();
            },
            /**
             * set page/screen to show
             * @param {string} screen - screen to show
             */
            setPage: function( screen ) {
                this.screen = screen;
                if(this.screen == 'poetscore') {
                    window.setTimeout(function() {
                        document.getElementById('total').classList.remove('show');
                        document.getElementById('total').classList.add('show');
                    }, 100);
                };
                if(this.screen == 'poetscores') {
                    window.setTimeout(function() {
                        document.getElementById('poetscores').focus();
                    }, 100);
                };
                window.clearInterval(this.top3Interval);
                document.querySelectorAll('.poetrank').forEach(function(poet) {
                    poet.classList.remove('show');
                });
                if(this.screen == 'top3') {
                    var index = 0;
                    window.setTimeout(function() {
                        document.querySelectorAll('.poetrank')[index].classList.add('show')
                        index++;
                        if(this.topPoets > 1) {
                            this.top3Interval = window.setInterval(function() {
                                document.querySelectorAll('.poetrank')[index].classList.add('show')
                                if(index < this.topPoets+1) {
                                    index++;
                                }
                            }.bind(this), 4000);
                        }
                    }.bind(this), 1000);
                };
                window.setTimeout(function() {
                    document.querySelector('section').classList.remove('show');
                    window.setTimeout(function() {
                        document.querySelector('section').classList.add('show');
                    }, 100);
                }, 100);
                this.updateAll();
            },
            /**
             * lock input from keyboard
             */
            lockKeys: function() {
                this.keysLocked = true;
            },
            /**
             * unlock input from keyboard
             */
            unlockKeys: function() {
                this.keysLocked = false;
            },
            /**
             * general key down handler
             * @param {object} ev - event from keydown
             */
            keyDown: function( ev ) {
                var key = ev.key.toUpperCase();
                var keysForScore = ["0","1","2","3","4","5","6","7","8","9",".","x","c"];
                if(this.keysLocked || (this.screen == 'poetscores' && (keysForScore.indexOf(key) != -1))) {
                    return;
                }
                switch(key) {
                    case "0":
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                    case "6":
                    case "7":
                    case "8":
                    case "9":
                        if(ev.key*1 <= this.poets.length || this.setRound ) {
                            if(ev.key == 0) {
                                ev.key = 10;
                            }
                            if(this.setRound) {
                                this.showRound = ev.key;
                                this.setRound = false;
                                this.updateAll();
                            }
                            this.currentPoet = ev.key*1-1;
                            this.iteratePoet = ev.key*1-1;
                            this.screen = 'poet';
                            this.updateAll();
                        }
                        break;
                    case "N":
                        var i = 0;
                        while( i < this.screens.length && this.screens[i] != this.screen ) {
                            i++;
                        }
                        if(i < this.screens.length-1) {
                            this.screen = this.screens[i+1];
                        } else {
                            this.screen = this.screens[0];
                        }
                        this.setPage(this.screen);
                        if(this.screen == 'poet') {
                            const poetWithScoreZero = this.poets.find(poet => poet.total === 0);
                            this.currentPoet = this.poets.indexOf(poetWithScoreZero);
                            if(this.currentPoet<0) {
                                this.currentPoet = this.iteratePoet;
                                this.iteratePoet = this.iteratePoet<this.poets.length-1?this.iteratePoet+1:0;
                            }
                            this.currentScoreEdit = 0;
                            this.currentScoreDecimal = '';
                        }
                        if(this.screen == 'poetscores') {
                            window.setTimeout(function() {
                                document.getElementById('poetscores').focus();
                            }, 100);
                        };
                        if(this.screen == 'poetscore') {
                            window.setTimeout(function() {
                                document.getElementById('total').classList.remove('show');
                                document.getElementById('total').classList.add('show');
                            }, 100);
                        };
                        this.updateAll();
                        break;
                    case "G":
                        this.setRound = !this.setRound;
                        this.updateAll();
                        break;
                    case "Y":
                        this.setPage('logo')
                        this.updateAll();
                        break;
                    case "A":
                        this.screen = "sponsor";
                        this.updateAll();
                        break;
                    case "I":
                        this.screen = "rules";
                        this.updateAll();
                        break;
                    case "H":
                        this.isHost = !this.isHost;
                        this.updateAll();
                        break;
                    case "L":
                        this.screen = 'poetlist';
                        this.updateAll();
                        break;
                    case "R":
                        this.setPage('ranking')
                        this.updateAll();
                        break;
                    case "F":
                        this.setPage('ranking-all')
                        this.updateAll();
                        break;
                    case "T":
                        this.setPage('top3')
                        this.updateAll();
                        break;
                    case "W":
                        this.setPage('winner')
                        this.updateAll();
                        break;
                    case "W":
                        this.makeFinale();
                        this.updateAll();
                        break;
                    case "P":
                        this.screen = 'poet';
                        this.updateAll();
                        break;
                    case "J":
                        this.screen = 'poetscores';
                        this.currentScoreDecimal = '';
                        this.updateAll();
                        window.setTimeout(function() {
                            document.getElementById('poetscores').focus();
                            document.getElementById('poetscores').click();
                        },124);
                        break;
                    case "S":
                        this.setPage('poetscore')
                        this.updateAll();
                        break;
                    case "M":
                        this.isSingle = !this.isSingle;
                        this.updateAll();
                        break;
                    case "X":
                        this.shufflePoets();
                        this.updateAll();
                        break;
                    case "Z":
                        this.rounds = 2;
                        this.poets = [];
                        this.luckyloser = true;
                        this.demoPoets(2,true);
                        this.updateAll();
                        this.setPage('poetlist');
                        break;
                    case "Ü":
                        this.rounds = 2;
                        this.poets = [];
                        this.luckyloser = true;
                        this.demoPoets(2,false);
                        this.updateAll();
                        this.setPage('poetlist');
                        break;
                    case "U":
                        this.rounds = 1;
                        this.luckyloser = false;
                        this.poets = [];
                        this.demoPoets(1);
                        this.updateAll();
                        this.setPage('poetlist');
                    break;
                    
                }
            },
            /**
             * adds a poet
             * @param {string} name - name of poet
             * @param {string} slam - home slam of poet
             * @param {boolean} scores - generate random scores
             * @param {integer} round - round number
             */
            addPoet: function( name, slam, scores, round ) {
                this.poets.push({name: name!=''?name:'Please enter name', slam: slam, scores: [], total: 0, notes: '', rank: 0, editing: false, round: round?round:1, random: Math.floor(Math.random() * 19860)});
                if(scores) {
                    for(var i = 1; i <= this.scoreBoards; i++) {
                        this.poets[this.poets.length-1].scores.push(Math.floor(Math.random() * 10) + 1);
                    }
                } else {
                    for(var i = 1; i <= this.scoreBoards; i++) {
                        this.poets[this.poets.length-1].scores.push(2.4);
                    }
                }
            },
            /**
             * looks if a poet needs to highlighted because groupwinner, lucky loser or overall winner
             * @param {integer} rounds - number of rounds (1 or 2)
             * @param {boolean} scores - generate random scores
             */
            demoPoets: function( rounds,scores) {
                this.addPoet('Bruce Wayne',"Wayne Manor",scores, 1);
                this.addPoet('Vicky Vale',"Gotham",scores, 1);
                this.addPoet('Clark Kent',"Smallville",scores, 1);
                this.addPoet('Lois Lane',"Metropolis",scores,rounds);
                this.addPoet('Steve Rogers',"Destroy Hydra",scores,rounds);
                this.addPoet('Wanda Maximov',"Multiverse",scores,rounds);
            },
            /**
             * shuffle all poets
             */
            shufflePoets: function() {
                this.poets.sort(() => Math.random() - 0.5);
            },
            /**
             * deletes a poet
             * @param {integer} index - index of poet
             */
            deletePoet: function(index) {
                this.poets.splice(index,1);
            },
            /**
             * looks if a poet needs to highlighted because groupwinner, lucky loser or overall winner
             * @param {string} mode - winner: get winner, top3: get top3, ranking: get ranking, finalists: get finalists
             * @param {object} poet - poet object
             * @returns {integer} index - index of poet
             */
            highlightPoet: function(poet, index) {
                if((index < this.topPoets && !this.luckyloser) || index == 0 ) {
                    return true;
                }
                if(!this.luckyloser) {
                    return false;
                }
                var roundWinners = [];
                for(var i = 1; i <= this.rounds; i++) {
                    roundWinners.push(this.getPoets('winner',i)[0]);
                };
                console.log(roundWinners);
                var secondPlace = [];
                for( var i = 1; i <= this.rounds; i++ ) {
                    var secondPlaceIs = this.getPoets('ranking',i)[1];
                    secondPlaceIs.diffToWinner = roundWinners[i-1].total-secondPlaceIs.total;
                    secondPlace.push(secondPlaceIs);
                }
                secondPlace.sort(function(a,b) {
                    return a.diffToWinner-b.diffToWinner;
                });
                if(secondPlace[0].diffToWinner == secondPlace[1].diffToWinner) {
                    if(secondPlace[0].random < secondPlace[1].random) {
                        secondPlace[0] = secondPlace[1];
                    }
                }
                console.log(secondPlace);
                return secondPlace[0] == poet;
            },
            /**
             * enter score for poet
             * @param {object} ev - event from keydown
             */
            enterScore: function( ev ) {
                if(this.screen != 'poetscores') {
                    return;
                }
                var key = ev.key;
                switch(key) {
                    case "x":
                        this.currentScoreEdit = 0;
                        this.getCurrentPoet.isHigh = 99;
                        this.getCurrentPoet.isLow = 99;
                        break;
                    case "c":
                        this.currentScoreEdit = 0;
                        this.getCurrentPoet.scores = [];
                        break;
                }
                if(key >= 0 && key <= 9) {
                    if(this.currentScoreEdit >= 0 && this.currentScoreEdit <= this.scoreBoards-1) {
                        if(!this.decimals || (key == "0" && this.currentScoreDecimal == '')) {
                                var score = parseInt(key);
                                score = score?score:10;
                                this.poets[this.currentPoet].scores[this.currentScoreEdit] = score;
                                this.currentScoreEdit++;
                        } else {
                            if(this.currentScoreDecimal == '') {
                                this.currentScoreDecimal = key;
                            } else {
                                this.currentScoreDecimal += "."+key;
                                this.poets[this.currentPoet].scores[this.currentScoreEdit] = this.currentScoreDecimal;
                                this.currentScoreEdit = (this.currentScoreEdit < this.scoreBoards-1)?this.currentScoreEdit+1:0;
                                this.currentScoreDecimal = '';
                            }                        
                        }
                    }
                    this.updateAll();
                }
            },
            /**
             * calculates the scores
             */
            calculateScores: function() {
                var score = 0;
                this.poets.forEach(function(poet) {
                    if(this.screen == 'poet' && this.currentScoreEdit<this.scoreBoards) {
                        return false;
                    }
                    // Total
                    var tmpScores = [...poet.scores];
                    tmpScores.sort(function(a,b) {
                        return a-b;
                    });
                    score = 0;
                    if( !this.lowHighStrike ) {
                        for(var i = 0; i <= tmpScores.length-1; i++) {
                            score += 1*tmpScores[i];
                        }
                    } else {
                        for(var i = 1; i < tmpScores.length-1; i++) {
                            score += 1*tmpScores[i];
                        }
                    }
                    if(this.decimals) {
                        poet.total = score.toFixed(1);
                    }
                    // Find high and low and set poet.isHigh and poet.isLow
                    var high = 0;
                    var low = 11;
                    var highIndex = 99;
                    var lowIndex = 99;
                    poet.isHigh = 99;
                    poet.isLow = 99;
                    if(this.lowHighStrike) {
                        for(var i = 0; i <= poet.scores.length-1; i++) {
                            if(poet.scores[i] > high && i!=lowIndex) {
                                high = poet.scores[i];
                                highIndex = i;
                            }
                        }
                        for(var i = 0; i <= poet.scores.length-1; i++) {
                            if(poet.scores[i] < low && i!=highIndex) {
                                low = poet.scores[i];
                                lowIndex = i;
                            }
                        }
                        poet.isHigh = highIndex;
                        poet.isLow = lowIndex;
                        poet.total_sort = ("0000"+poet.total*10).slice(-5)+"_"+("00"+high*10).slice(-3)+"_"+("00"+low*10).slice(-3)+"_"+Math.floor(Math.random() * 10);
                    } else {
                        poet.total_sort = ("0000"+poet.total*10).slice(-5);
                    }
                }.bind(this));
                this.poetsTmp = [...this.poets];
                this.poetsTmp.sort(function(a,b) {
                    if(b.total_sort > a.total_sort) {
                        return 1
                    }
                    return -1;
                });
                this.poetsTmp.forEach(function(poet,i) {
                    console.log(` ${poet.rank} ${poet.name} ${poet.total_sort}`);
                });
                this.poets.forEach(function(poet) {
                    if(poet.editing) {
                        return false;
                    }
                    poet.rank = this.poetsTmp.indexOf(poet)+1;
                }.bind(this));
                console.log('Ranking ---------------------------------------');
            },
            /**
             * recalcs everything
             */
            recalc: function() {
                this.updateAll();
            },
            /**
             * get list of poets
             * @param {string} mode - winner: get winner, top3: get top3, ranking: get ranking, finalists: get finalists
             * @param {number} round - round number
             * @returns {array} - list of poets
             */
            getPoets: function(mode,round) {
                if( round == undefined ) {
                    round = this.rounds>1?this.showRound:1;
                }
                var poetsTmp = [...this.poets];
                poetsTmp.forEach(function(poet,i) {
                    poet.index = i;
                });
                poetsTmp = poetsTmp.filter(function(poet) {
                    return poet.round == round || this.rounds == 1 || round == 0
                }.bind(this));
                if(mode == 'ranking') {
                    poetsTmp.sort(function(a,b) {
                        return a.rank-b.rank;
                    });
                }
                if(mode == 'winner') {
                    poetsTmp.sort(function(a,b) {
                        return a.rank-b.rank;
                    });
                    poetsTmp = poetsTmp.slice(0,1);
                }
                if(mode == 'top3' || (mode == 'finalists' && !this.luckyloser)) {
                    poetsTmp.sort(function(a,b) {
                        return b.total-a.total;
                    });
                    poetsTmp = poetsTmp.slice(0,this.topPoets);
                    poetsTmp.sort(function(a,b) {
                        return a.total-b.total;
                    });
                }
                if(mode == 'finalists') {
                    var groupwinners = [];
                    for(var i = 1; i <= this.rounds; i++) {
                        groupwinners.push(this.getPoets('winner',i)[0]);
                    };
                    groupwinners.forEach(function(poet,i) {
                        poet.sortKey = i;
                    });
                    var overAllWinners = this.getPoets('ranking',0);
                    var overAllWinnersWithOutGroupWinners = overAllWinners.filter(function(winner) {
                        return groupwinners.indexOf(winner) == -1;
                    });
                    if(this.luckyloser) {
                        var secondPlace = [];
                        for( var i = 1; i <= this.rounds; i++ ) {
                            var secondPlaceIs = this.getPoets('ranking',i)[1];
                            secondPlaceIs.diffToWinner = groupwinners[i-1].total-secondPlaceIs.total;
                            secondPlace.push(secondPlaceIs);
                        }
                        secondPlace.sort(function(a,b) {
                            return a.diffToWinner-b.diffToWinner;
                        });
                        if(secondPlace[0].diffToWinner == secondPlace[1].diffToWinner) {
                            if(secondPlace[0].random < secondPlace[1].random) {
                                secondPlace[0] = secondPlace[1];
                            }
                        }
                        secondPlace[0].sortKey = groupwinners.length;
                        groupwinners.push(secondPlace[0]);
                    }
                    poetsTmp = groupwinners;
                    poetsTmp.sort(function(a,b) {
                        return b.sortKey-a.sortKey;
                    });
                }
                return poetsTmp;
            },
            /**
             * clean up scores of poet
             * @param {oject} poet - poet object
             */
            onlyValidScores: function(poet) {
                if(!poet?.scores) {
                    return [];
                }
                var validScores = [];
                poet.scores.forEach(function(score) {
                    if(score > 0) {
                        validScores.push(score);
                    }
                });
                return validScores;
            },
            /**
             * Generate the finale based on the set rules
             */
            makeFinale: function() {
                if( this.rounds == 1 ) {
                    this.poets = this.getPoets('top3');
                    this.poets.forEach(function(poet) {
                        poet.round = 1;
                        poet.scores = [];
                    });
                    this.setPage('ranking');
                    return;
                } else {
                    this.roundWinners = [];
                    for( var i = 1; i <= this.rounds; i++ ) {
                        this.roundWinners.push(this.getPoets('winner',i)[0]);
                    };
                    if( this.luckyloser ) {                        
                        this.allPoetsWithoutRoundWinners = this.poets.filter(function(poet) {
                            return this.roundWinners.indexOf(poet) == -1;
                        }.bind(this));
                        var secondPlace = [];
                        for( var i = 1; i <= this.rounds; i++ ) {
                            var secondPlaceIs = this.getPoets('ranking',i)[1];
                            secondPlaceIs.diffToWinner = this.roundWinners[i-1].total-secondPlaceIs.total;
                            secondPlace.push(secondPlaceIs);
                        }
                        secondPlace.sort(function(a,b) {
                            return a.diffToWinner-b.diffToWinner;
                        });
                        console.log(secondPlace[0].diffToWinner,secondPlace[1].diffToWinner);
                        if(secondPlace[0].diffToWinner == secondPlace[1].diffToWinner) {
                            this.roundWinners.push(secondPlace[2*Math.floor(Math.random() * 2)]);
                        }
                        console.log(secondPlace);
                        this.roundWinners.push(secondPlace[0]);
                    }
                    this.poets = this.roundWinners;
                    this.poets.forEach(function(poet) {
                        poet.round = 1;
                        poet.scores = [];
                    });
                    this.rounds = 1;
                    this.luckyloser = false;
                    this.setPage('ranking');
                    return;
                }
            },
            /**
             * updates all data
             */
            updateAll: function() {
                var poetsJSON = JSON.stringify(this.poets);
                if(poetsJSON != this.lastJSONPoets) {
                    this.calculateScores();
                    this.lastJSONPoets = poetsJSON;
                }
                if(this.isHost || this.isSingle) {
                    var data = JSON.stringify({
                        poets: this.poets,
                        screen: this.screen,
                        title: this.title,
                        bgColor: this.bgColor,
                        fgColor: this.fgColor,
                        secColor: this.secColor,
                        bumperAnimation: this.bumperAnimation,
                        scoreBoards: this.scoreBoards,
                        lowHighStrike: this.lowHighStrike,
                        decimals: this.decimals,
                        currentPoet: this.currentPoet,
                    });
                    if(data != localStorage.getItem('data')) {
                        localStorage.setItem('data', data);
                    }
                }
            },
            /**
             * Gets data from local storage
             */
            fetchData: function() {
                if(localStorage.getItem('data')==this.localData) {
                    return;
                }
                this.localData = localStorage.getItem('data');
                if(this.localData) {
                    var data = JSON.parse(this.localData);
                    if(data.poets) {
                        this.poets = data.poets;
                    }
                    if(data.screen) {
                        this.setPage(data.screen);
                    }
                    if(data.title) {
                        this.title = data.title;
                    }
                    if(data.bgColor) {
                        this.bgColor = data.bgColor;
                    }
                    if(data.fgColor) {
                        this.fgColor = data.fgColor;
                    }
                    if(data.secColor) {
                        this.secColor = data.secColor;
                    }
                    if(data.bumperAnimation) {
                        this.bumperAnimation = data.bumperAnimation;
                    }
                    if(data.currentPoet) {
                        this.currentPoet = data.currentPoet;
                    }
                }
            }
        },
        computed: {
            isTouch: function() {
                return supportsTouch;
            },
            showPoet: function() {
                return this.screen == 'poet';
            },
            showPoetScores: function() {
                return this.screen == 'poetscores';
            },
            showPoetScore: function() {
                return this.screen == 'poetscore';
            },
            showPoetList: function() {
                return this.screen == 'poetlist' && (this.isHost || this.isSingle);
            },
            showSponsor: function() {
                return this.screen == 'sponsor';
            },
            showRules: function() {
                return this.screen == 'rules';
            },
            showLogo: function() {
                return this.screen == 'logo' || (this.screen == 'poetlist' && !this.isHost && !this.isSingle);
            },
            showRanking: function() {
                return this.screen == 'ranking';
            },
            showRankingAll: function() {
                return this.screen == 'ranking-all';
            },
            showWinner: function() {
                return this.screen == 'winner';
            },
            showTop3: function() {
                return this.screen == 'top3';
            },
            getCurrentPoet: function() {
                if(this.currentPoet!==false && this.poets[this.currentPoet]) {
                    return this.poets[this.currentPoet]
                } else {
                    return false;
                }
            },
            scoreMissing: function() {
                var isMissing = this.onlyValidScores(this.getCurrentPoet).length < this.scoreBoards;
                return isMissing;
            }
        },
        updated: function() {
        },
        mounted: function() {
            localStorage.setItem('data','');
            document.addEventListener( "keydown", this.keyDown );
            window.setInterval(function() {
                if(!this.isHost) {
                    this.fetchData();
                }
            }.bind(this), 100);    
            document.querySelector('body').classList.remove('hide');
            this.setPage(this.screen);
        }
    });

    app.mount('#app');

})