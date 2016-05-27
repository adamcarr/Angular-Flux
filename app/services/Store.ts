namespace AngularFlux.Services {
    export type StoreStateChangedCallback<TState> = (state: TState) => void;
    export interface IStore<TState> {
        registerStateChanged(callback: StoreStateChangedCallback<TState>, $scope?: ng.IScope): string;
        unregisterStateChanged(id: string): void;
    }
    
    let StoreEventIdCounter = 0;

    export class Store<TState> implements IStore<TState> {
        private stateChangedListeners: { [id: string]: StoreStateChangedCallback<TState> } = {};
        
        constructor(protected state: TState) {}

        registerStateChanged(callback: StoreStateChangedCallback<TState>, $scope?: ng.IScope): string {
            const id = `${StoreEventIdCounter++}`;
            
            this.stateChangedListeners[id] = callback;
            if ($scope) {
                $scope.$on('$destroy', () => this.unregisterStateChanged(id));
            }
            
            return id;
        }
        
        unregisterStateChanged(id: string): void {
            delete this.stateChangedListeners[id];
        }
        
        protected triggerStateChanged(stateCloner: (state: TState) => TState, preStateChangedAction?: Function): void {
            if (preStateChangedAction) {
                preStateChangedAction();
            }
            const clonedState = stateCloner(this.state);
            setTimeout(() => Object.keys(this.stateChangedListeners)
                .forEach(key => this.stateChangedListeners[key](clonedState))
                , 0);
        }
    }
}