namespace AngularFlux.Controllers {
    interface IMainControllerScope extends ng.IScope {
        greeting: string;
        onClick: Function;
        todos: AngularFlux.Services.ITodo[];
        create: Function;
        newTodoName: string;
    }
    
    enum TestActionTypes {
        test1,
        test2
    }
    
    interface ICustomPayload extends AngularFlux.Services.IDispatchPayload<TestActionTypes> {
        blah: string;
    }

    class MainController {
        constructor(
            $scope: IMainControllerScope, 
            dispatcher: AngularFlux.Services.IDispatcher<AngularFlux.Services.TodoActions>,
            todoStore: AngularFlux.Services.ITodoStore,
            $interval: ng.IIntervalService
        ) {
            $scope.greeting = "Howdy Peeps!!!";
            
            $scope.$watch('todoStore.state', function () {
                $scope.todos = todoStore.state;
            });
            
            $scope.create = () => {
                if ($scope.newTodoName) {
                    // This should be wrapped in a helper function
                    dispatcher.dispatch({
                        actionType: AngularFlux.Services.TodoActions.CREATE,
                        name: $scope.newTodoName
                    });
                    $scope.newTodoName = '';
                }
            }
        }
    }

    AngularFlux.Controllers.Module.controller('mainCtrl', MainController);
}