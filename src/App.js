import React from "react";
import "./styles.css";

const todoInitialState = {
  todos: []
};

const todoReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case "add":
      return { ...state, todos: [...state.todos, action.payload.todo] };
    case "done": {
      const newTodos = [...state.todos];
      newTodos[action.payload.id] = {
        ...newTodos[action.payload.id],
        done: true
      };
      return { ...state, todos: newTodos };
    }
    case "delete": {
      const newTodos = [...state.todos];
      newTodos.splice(action.payload.id, 1);
      return {
        ...state,
        todos: newTodos
      };
    }
    default:
      return state;
  }
};

const TodoStateContext = React.createContext();
const TodoDispatchContext = React.createContext();

const TodosProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(todoReducer, todoInitialState);
  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
};

const useTodosProvider = () => {
  const state = React.useContext(TodoStateContext);
  const dispatch = React.useContext(TodoDispatchContext);
  if (state === undefined || dispatch === undefined) {
    throw Error("useTodosProvider must be used within a TodosProvider");
  }
  return [state, dispatch];
};

function connect(mapStateToProps, mapDispatchToProps) {
  return function(Component) {
    return function(props) {
      const [state, dispatch] = useTodosProvider();
      const stateToProps = mapStateToProps(state);
      const dispatchToProps = mapDispatchToProps(dispatch);
      const newProps = { ...props, ...stateToProps, ...dispatchToProps };
      return <Component {...newProps} />;
    };
  };
}

function mapStateToProps({ todos }) {
  return {
    todos
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addTodo: todo => dispatch({ type: "add", payload: { todo } }),
    doneTodo: id => dispatch({ type: "done", payload: { id } }),
    deleteTodo: id => dispatch({ type: "delete", payload: { id } })
  };
}

const UnConnectedMain = React.memo(
  ({ todos, addTodo, doneTodo, deleteTodo }) => {
    const [todo, setTodo] = React.useState("");
    const handleSubmit = e => {
      addTodo({ description: todo, done: false });
      setTodo("");
      e.preventDefault();
    };

    const handleChange = e => {
      setTodo(e.target.value);
    };

    const handleDone = e => {
      doneTodo(e.target.dataset.id);
    };

    const handleDelete = e => {
      deleteTodo(e.target.dataset.id);
    };

    return (
      <div>
        <div>
          <form onSubmit={handleSubmit} name="todos-form">
            <input
              type="text"
              name="todo"
              value={todo}
              onChange={handleChange}
            />
            <input type="submit" value="add" />
          </form>
        </div>
        <div>
          {todos.map(({ description, done }, index) => (
            <div key={index}>
              <span style={done ? { textDecoration: "line-through" } : {}}>
                {description}
              </span>
              <input
                type="button"
                value="done"
                data-id={index}
                onClick={handleDone}
              />
              <input
                type="button"
                value="delete"
                data-id={index}
                onClick={handleDelete}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(UnConnectedMain);

export default function App() {
  return (
    <div className="App">
      <TodosProvider>
        <Main />
      </TodosProvider>
    </div>
  );
}
