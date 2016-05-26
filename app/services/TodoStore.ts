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

    export interface ITodoStore {
        state: ITodo[];
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
            public isUpdating: boolean = false
        ) {
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
        CREATE_COMPLETE,
        STATE_UPDATED
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

    class TodoStore implements ITodoStore {
        state: ITodo[] = [];
        todoDispatcher: Flux.Dispatcher<TodoPayload>;

        constructor() {
            angular.injector(['services']).invoke((todoDispatcher: Flux.Dispatcher<TodoPayload>) => {
                this.todoDispatcher = todoDispatcher;
                this.todoDispatcher.register((payload) => this.on(payload));
            });
        }

        private on(payload: TodoPayload) {
            if (isTodoCreatePayload(payload)) return this.triggerStateUpdated(() => this.onCreate(payload));
            if (isTodoDeletePayload(payload)) return this.triggerStateUpdated(() => this.onDelete(payload));
            if (isTodoToggleBoldPayload(payload)) return this.triggerStateUpdated(() => this.onToggleBold(payload));
            if (isTodoToggleDonePayload(payload)) return this.triggerStateUpdated(() => this.onToggleDone(payload));
        }

        private onToggleBold(payload: ITodoToggleBoldPayload) {
            if (payload.actionType === TodoActions.TOGGLE_BOLD) {
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
                return;
            }
            this.setIsUpdating(payload.name, false);
        }

        private onToggleDone(payload: ITodoToggleDonePayload) {
            if (payload.actionType === TodoActions.TOGGLE_DONE) {
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
                return;
            }
            this.setIsUpdating(payload.name, false);
        }

        private onDelete(payload: ITodoDeletePayload) {
            if (payload.actionType === TodoActions.DELETE) {
                randomDelay(() => this.todoDispatcher.dispatch(<TodoPayload>{
                    actionType: TodoActions.DELETE_COMPLETE,
                    name: payload.name
                }));
                this.setIsUpdating(payload.name);
                return;
            }

            let indexesToDelete = [];
            this.state.forEach((todo, index) => {
                if (todo.name === payload.name) {
                    indexesToDelete.unshift(index);
                }
            });

            indexesToDelete.forEach((i) => this.state.splice(i, 1));
        }

        private onCreate(payload: ITodoCreatePayload) {
            if (payload.actionType === TodoActions.CREATE) {
                this.state.push(new Todo(this.todoDispatcher, payload.name, false, false, true));
                randomDelay(() => this.todoDispatcher.dispatch(<TodoPayload>{
                    actionType: TodoActions.CREATE_COMPLETE,
                    name: payload.name
                }));
                this.setIsUpdating(payload.name);
                return;
            }

            this.setIsUpdating(payload.name, false);
        }

        private setIsUpdating(name: string, isUpdating: boolean = true) {
            this.state.forEach((todo) => {
                if (todo.name === name) {
                    todo.isUpdating = isUpdating;
                }
            });
        }
        
        private triggerStateUpdated(callback: Function) {
            callback();
            setTimeout(() => {
                this.todoDispatcher.dispatch(<ITodoStateUpdatedPayload>{
                    actionType: TodoActions.STATE_UPDATED,
                    state: this.state
                });
            }, 0);
        }
    }
    
    new TodoStore();
}