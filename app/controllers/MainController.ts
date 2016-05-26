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
            todoStore: AngularFlux.Services.ITodoStore // only pulled in here to create the instance.
        ) {
            $scope.greeting = "Amazing to-dos!!!";
            
            const onStateUpdated = todoDispatcher.register((payload: AngularFlux.Services.ITodoStateUpdatedPayload) => {
                if (payload.actionType !== AngularFlux.Services.TodoActions.STATE_UPDATED) {
                    return;
                }
                
                $scope.$apply(() => {
                    $scope.todos = payload.state;
                });
            });
            
            $scope.$on('$destroy', () => {
                todoDispatcher.unregister(onStateUpdated);
            })
            
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