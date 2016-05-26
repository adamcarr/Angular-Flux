/// <reference path="Services.ts" />

namespace AngularFlux.Services {
    export interface IDispatchPayload<TActionType> {
        actionType: TActionType;
    }
    export type IDispatcherListener<TActionType> = (payload: IDispatchPayload<TActionType>) => void;
    
    export interface IDispatcher<TActionType> {
        dispatch<TPayload extends IDispatchPayload<TActionType>>(payload: TPayload): void;
        register($scope: ng.IScope, callback: IDispatcherListener<TActionType>);
    }
    
    class Dispatcher<TActionType> implements IDispatcher<TActionType> {
        private name: 'dispatcher';
        
        constructor(private $rootScope: ng.IRootScopeService) {
        }
        
        dispatch<TPayload extends IDispatchPayload<TActionType>>(payload: TPayload) {
            this.$rootScope.$emit(this.name, payload);
        }
        
        register($scope: ng.IScope, callback: IDispatcherListener<TActionType>): void {
            const unbind = this.$rootScope.$on(this.name, (event, payload) => callback(payload));
            $scope.$on('$destroy', () => {
                unbind();
            });
        }
    }
    
    AngularFlux.Services.Module.service('dispatcher', Dispatcher);
}