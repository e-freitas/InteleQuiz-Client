/* global angular */
(function () {
    'use strict';
    angular
        .module('intelequiz')
        .controller('publicarQuizCtrl', publicarQuizCtrl);
    publicarQuizCtrl.$inject = ['DADOS', 'SERVICE', 'CLASSES', '$state', '$scope', '$timeout', 'ionicMaterialMotion'];
    function publicarQuizCtrl(DADOS, SERVICE, CLASSES, $state, $scope, $timeout, ionicMaterialMotion) {
        var publicarQuizCtrl = this;

        init();

        function init() {
            publicarQuizCtrl.init = init;
            publicarQuizCtrl.usuarioLogado = DADOS.USUARIO_LOGADO;
            publicarQuizCtrl.arrayTurma = [];
            publicarQuizCtrl.arrayQuizPublicado = [];
            publicarQuizCtrl.quiz = $state.params.quiz;

            publicarQuizCtrl.selecionarData = selecionarData;
            publicarQuizCtrl.publicarQuiz = publicarQuiz;
            configDatepicker();
            listTurmasByProfessorByDisciplina(publicarQuizCtrl.usuarioLogado, publicarQuizCtrl.quiz);

            $scope.$broadcast('scroll.refreshComplete');
        }

        function selecionarData() {
            var ipObj1 = {
                callback: function (val) {  //Mandatory
                    publicarQuizCtrl.tsEncerramento = val;
                },
                from: new Date(),           //Optional
                inputDate: new Date(),      //Optional
                closeOnSelect: true,        //Optional
                dateFormat: 'dd MMMM yyyy',
                templateType: 'popup'       //Optional
            };
            ionicDatePicker.openDatePicker(ipObj1);
        }

        function listTurmasByProfessorByDisciplina(professor, quiz) {
            if (professor && professor.matricula && quiz && quiz.disciplina && quiz.disciplina.id) {
                SERVICE.listTurmasByProfessorByDisciplina(publicarQuizCtrl.usuarioLogado.matricula, quiz.disciplina.id).then(function (response) {
                    if (response.data && response.data.length > 0) {
                        publicarQuizCtrl.arrayTurma = response.data;
                        publicarQuizCtrl.filtroTurma = publicarQuizCtrl.arrayTurma[0];
                        listQuizPublicadoByTurma(publicarQuizCtrl.filtroTurma);
                    }
                });
            }
        }

        function listQuizPublicadoByTurma(turma) {
            if (turma && turma.id) {
                SERVICE.listQuizPublicadoByTurma(turma.id).then(function(response){
                    if(response && response.data){
                        publicarQuizCtrl.arrayQuizPublicado = response.data;
                        $timeout(function () {
                            ionicMaterialMotion.blinds({
                                startVelocity: 1000
                            });
                        });
                    }
                });
            }
        }

        function publicarQuiz(turma) {
            var turmaQuiz = new CLASSES.TurmaQuiz();
            turmaQuiz.turma = turma;
            turmaQuiz.quiz = publicarQuizCtrl.quiz;
            turmaQuiz.tsEncerramento = publicarQuizCtrl.tsEncerramento;

            console.log(turmaQuiz);
            if (validarTurmaQuiz(turmaQuiz)) {
                SERVICE.publicarQuiz(turmaQuiz).then(function (response) {
                    if (response.message && response.message.type == "success") {
                        $state.go('menu.quiz');
                    }
                });
            }
        }

        function validarTurmaQuiz(turmaQuiz) {
            if (!turmaQuiz.turma || !turmaQuiz.turma.id) {
                var message = {
                    type: 'warning',
                    text: 'Selecione uma turma'
                };
                SERVICE.showToaster(message);
                return false;
            }
            if (!turmaQuiz.quiz || !turmaQuiz.quiz.id) {
                var message = {
                    type: 'warning',
                    text: 'Selecione um quiz'
                };
                SERVICE.showToaster(message);
                return false;
            }
            if (!turmaQuiz.tsEncerramento || turmaQuiz.tsEncerramento === "") {
                var message = {
                    type: 'warning',
                    text: 'Selecione uma data de encerramento'
                };
                SERVICE.showToaster(message);
                return false;
            }
            return true;
        }


        function configDatepicker() {
            var startDate = new Date();
            startDate.setDate(startDate.getDate() + 1);
            var dataFim = new Date();
            dataFim.setDate(dataFim.getDate() + 15);
            
            publicarQuizCtrl.tsEncerramento = startDate;

            publicarQuizCtrl.onezoneDatepicker = {
                date: startDate, // MANDATORY                     
                mondayFirst: false,
                months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                daysOfTheWeek: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
                // startDate: new Date(),
                // endDate: dataFim,
                disablePastDays: true,
                disableSwipe: false,
                disableWeekend: false,
                // disableDates: [new Date()],
                // disableDaysOfWeek: disableDaysOfWeek,
                showDatepicker: false,
                showTodayButton: true,
                calendarMode: false,
                hideCancelButton: false,
                hideSetButton: false,
                // highlights: highlights,
                callback: function (value) {
                    publicarQuizCtrl.tsEncerramento = value;
                }
            }
        }
    }
})();