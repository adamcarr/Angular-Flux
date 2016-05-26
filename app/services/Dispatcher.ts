/// <reference path="Services.ts" />

namespace AngularFlux.Services {
    export interface IDispatchPayload<TActionType> {
        actionType: TActionType;
    }

    export type TodoPayload = IDispatchPayload<AngularFlux.Services.TodoActions>;
    AngularFlux.Services.Module.value('todoDispatcher', new Flux.Dispatcher<TodoPayload>());
}