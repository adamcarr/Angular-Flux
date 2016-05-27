namespace AngularFlux.Services {
    export interface ITodo {
        name: string;
        isDone: boolean;
        isBold: boolean;
        isUpdating: boolean;
        getTodoActions(): ITodoAction[];
    }

    export interface ITodoAction {
        name: string;
        execute: () => void;
    }

    export type TodoStoreState = ITodo[];
    export interface ITodoStore extends IStore<TodoStoreState> {
    }

    function fiftyFifty(): boolean {
        return Math.random() > .5;
    }

    class Todo implements ITodo {
        private actions: ITodoAction[] = [];

        constructor(
            private dispatcher: Flux.Dispatcher<TodoPayload>,
            public name: string,
            public isDone: boolean = false,
            public isBold: boolean = false,
            public isUpdating: boolean = false,
            actions?: ITodoAction[]
        ) {
            if (actions) {
                this.actions = actions;
            } else {
                if (fiftyFifty()) {
                    this.actions.push({
                        name: TodoActions[TodoActions.DELETE],
                        execute: () => {
                            this.dispatcher.dispatch(<TodoPayload>{
                                actionType: TodoActions.DELETE,
                                name: this.name
                            });
                        }
                    })
                }

                if (fiftyFifty()) {
                    this.actions.push({
                        name: TodoActions[TodoActions.TOGGLE_BOLD],
                        execute: () => {
                            this.dispatcher.dispatch(<TodoPayload>{
                                actionType: TodoActions.TOGGLE_BOLD,
                                name: this.name
                            });
                        }
                    })
                }

                if (fiftyFifty()) {
                    this.actions.push({
                        name: TodoActions[TodoActions.TOGGLE_DONE],
                        execute: () => {
                            this.dispatcher.dispatch(<TodoPayload>{
                                actionType: TodoActions.TOGGLE_DONE,
                                name: this.name
                            });
                        }
                    })
                }
            }
        }

        public getTodoActions(): ITodoAction[] {
            return this.actions;
        }
    }

    export enum TodoActions {
        TOGGLE_DONE,
        TOGGLE_DONE_COMPLETE,
        TOGGLE_BOLD,
        TOGGLE_BOLD_COMPLETE,
        DELETE,
        DELETE_COMPLETE,
        CREATE,
        CREATE_COMPLETE
    }

    export interface ITodoToggleDonePayload extends TodoPayload {
        name: string;
    }
    export interface ITodoToggleBoldPayload extends TodoPayload {
        name: string;
    }
    export interface ITodoDeletePayload extends TodoPayload {
        name: string;
    }
    export interface ITodoCreatePayload extends TodoPayload {
        name: string;
    }
    export interface ITodoStateUpdatedPayload extends TodoPayload {
        state: ITodo[];
    }

    function isTodoToggleBoldPayload(payload: TodoPayload): payload is ITodoToggleBoldPayload {
        return payload.actionType === TodoActions.TOGGLE_BOLD ||
            payload.actionType === TodoActions.TOGGLE_BOLD_COMPLETE;
    }
    function isTodoToggleDonePayload(payload: TodoPayload): payload is ITodoToggleDonePayload {
        return payload.actionType === TodoActions.TOGGLE_DONE ||
            payload.actionType === TodoActions.TOGGLE_DONE_COMPLETE;
    }
    function isTodoDeletePayload(payload: TodoPayload): payload is ITodoDeletePayload {
        return payload.actionType === TodoActions.DELETE ||
            payload.actionType === TodoActions.DELETE_COMPLETE;
    }
    function isTodoCreatePayload(payload: TodoPayload): payload is ITodoCreatePayload {
        return payload.actionType === TodoActions.CREATE ||
            payload.actionType === TodoActions.CREATE_COMPLETE;
    }

    function randomDelay(callback: (...args) => any): void {
        setTimeout(callback, Math.random() * 5000);
    }
    function cloneTodo(dispatcher: Flux.Dispatcher<TodoPayload>, todo: ITodo): ITodo {
        return new Todo(dispatcher, todo.name, todo.isDone, todo.isBold, todo.isUpdating, todo.getTodoActions());
    }
    function todoStateCloner(dispatcher: Flux.Dispatcher<TodoPayload>, state: TodoStoreState): TodoStoreState {
        return state.map(x => cloneTodo(dispatcher, x));
    }

    class TodoStore extends Store<TodoStoreState> implements ITodoStore {
        private stateCloner: (state: TodoStoreState) => TodoStoreState;

        constructor(private todoDispatcher: Flux.Dispatcher<TodoPayload>) {
            super([]);
            this.todoDispatcher.register((payload) => this.on(payload));
            this.stateCloner = (state) => todoStateCloner(this.todoDispatcher, state);
        }

        private on(payload: TodoPayload) {
            if (isTodoCreatePayload(payload)) return this.triggerStateChanged(this.stateCloner, () => this.onCreate(payload));
            if (isTodoDeletePayload(payload)) return this.triggerStateChanged(this.stateCloner, () => this.onDelete(payload));
            if (isTodoToggleBoldPayload(payload)) return this.triggerStateChanged(this.stateCloner, () => this.onToggleBold(payload));
            if (isTodoToggleDonePayload(payload)) return this.triggerStateChanged(this.stateCloner, () => this.onToggleDone(payload));
        }

        private onToggleBold(payload: ITodoToggleBoldPayload) {
            if (payload.actionType === TodoActions.TOGGLE_BOLD_COMPLETE) {
                this.setIsUpdating(payload.name, false);
                return;
            }
            
            randomDelay(() => this.todoDispatcher.dispatch(<TodoPayload>{
                actionType: TodoActions.TOGGLE_BOLD_COMPLETE,
                name: payload.name
            }));
            this.setIsUpdating(payload.name);

            this.state.forEach((todo) => {
                if (todo.name === payload.name) {
                    todo.isBold = !todo.isBold;
                }
            });
        }

        private onToggleDone(payload: ITodoToggleDonePayload) {
            if (payload.actionType === TodoActions.TOGGLE_DONE_COMPLETE) {
                this.setIsUpdating(payload.name, false);
                return;
            }
            
            randomDelay(() => this.todoDispatcher.dispatch(<TodoPayload>{
                actionType: TodoActions.TOGGLE_DONE_COMPLETE,
                name: payload.name
            }));
            this.setIsUpdating(payload.name);

            this.state.forEach((todo) => {
                if (todo.name === payload.name) {
                    todo.isDone = !todo.isDone;
                }
            });
        }

        private onDelete(payload: ITodoDeletePayload) {
            if (payload.actionType === TodoActions.DELETE_COMPLETE) {
                let indexesToDelete = [];
                this.state.forEach((todo, index) => {
                    if (todo.name === payload.name) {
                        indexesToDelete.unshift(index);
                    }
                });

                indexesToDelete.forEach((i) => this.state.splice(i, 1));
                return;
            }
                
            randomDelay(() => this.todoDispatcher.dispatch(<TodoPayload>{
                actionType: TodoActions.DELETE_COMPLETE,
                name: payload.name
            }));
            this.setIsUpdating(payload.name);
        }

        private onCreate(payload: ITodoCreatePayload) {
            if (payload.actionType === TodoActions.CREATE_COMPLETE) {
                this.setIsUpdating(payload.name, false);
                return;
            }
            
            this.state.push(new Todo(this.todoDispatcher, payload.name, false, false, true));
            randomDelay(() => this.todoDispatcher.dispatch(<TodoPayload>{
                actionType: TodoActions.CREATE_COMPLETE,
                name: payload.name
            }));
            this.setIsUpdating(payload.name);
        }

        private setIsUpdating(name: string, isUpdating: boolean = true) {
            this.state.forEach((todo) => {
                if (todo.name === name) {
                    todo.isUpdating = isUpdating;
                }
            });
        }
    }

    AngularFlux.Services.Module.service('todoStore', TodoStore);
}