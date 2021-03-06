namespace AngularFlux.Controllers {
    interface IMainControllerScope extends ng.IScope {
        greeting: string;
        onClick: Function;
        todos: AngularFlux.Services.ITodo[];
        create: Function;
        newTodoName: string;
    }

    class MainController {
        constructor(
            $scope: IMainControllerScope, 
            todoDispatcher: Flux.Dispatcher<AngularFlux.Services.TodoPayload>,
            todoStore: AngularFlux.Services.ITodoStore
        ) {
            $scope.greeting = "Amazing to-dos!!!";
            
            todoStore.registerStateChanged((state: AngularFlux.Services.TodoStoreState) => {
                $scope.$apply(() => {
                    $scope.todos = state;
                });
            }, $scope);
            
            $scope.create = () => {
                if ($scope.newTodoName) {
                    // This should be wrapped in a helper function
                    todoDispatcher.dispatch(<AngularFlux.Services.TodoPayload>{
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