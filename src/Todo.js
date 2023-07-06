import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  TextField,
  Chip,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  Modal,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import classNames from "classnames";

const Alert = React.forwardRef((props, ref) => {
  return <MuiAlert {...props} ref={ref} variant="filled" />;
});

function useTodosState() {
  const [todos, setTodos] = useState([]);
  const lastTodoIdRef = useRef(0);

  const addTodo = (newContent) => {
    const id = ++lastTodoIdRef.current;

    const newTodo = {
      id,
      content: newContent,
      regDate: dateToStr(new Date()),
    };

    setTodos((todos) => [newTodo, ...todos]);

    return id;
  };

  const modifyTodo = (index, newContent) => {
    const newTodos = todos.map((todo, _index) =>
      _index != index ? todo : { ...todo, content: newContent }
    );
    setTodos(newTodos);
  };

  const modifyTodoById = (id, newContent) => {
    const index = findTodoIndexById(id);

    if (index == -1) {
      return;
    }
    modifyTodo(index, newContent);
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, _index) => _index != index);
    setTodos(newTodos);
  };

  const removeTodoById = (id) => {
    const index = findTodoIndexById(id);
    return removeTodo(index);
  };

  const findTodoById = (id) => {
    const index = findTodoIndexById(id);
    if (index == -1) {
      return null;
    }

    return todos[index];
  };

  const findTodoIndexById = (id) => {
    return todos.findIndex((todo) => todo.id == id);
  };

  return {
    todos,
    addTodo,
    modifyTodo,
    removeTodo,
    removeTodoById,
    findTodoById,
    modifyTodoById,
  };
}

const muiThemePaletteKeys = [
  "background",
  "common",
  "error",
  "grey",
  "info",
  "primary",
  "secondary",
  "success",
  "text",
  "warning",
];

function NewTodoForm({ todosState, noticeSnackBarState }) {
  const onSubmit = (e) => {
    e.preventDefault();

    const form = e.target;

    form.content.value = form.content.value.trim();

    if (form.content.value.length == 0) {
      alert("Enter a new task.");
      form.content.focus();
      return;
    }

    const newTodoId = todosState.addTodo(form.content.value);
    form.content.value = "";
    form.content.focus();
    noticeSnackBarState.open(`Added to-do number ${newTodoId}.`);
  };
  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col mt-4 px-4 gap-2">
        <TextField
          minRows={3}
          maxRows={10}
          multiline
          autoComplete="off"
          name="content"
          label="Enter a new task."
          variant="outlined"
        />
        <Button type="submit" variant="contained">
          Add
        </Button>
      </form>
    </>
  );
}

function useTodoOptionDrawerState() {
  const [todoId, setTodoId] = useState(null);
  const opened = useMemo(() => todoId !== null, [todoId]);
  const close = () => setTodoId(null);
  const open = (id) => setTodoId(id);
  return {
    todoId,
    opened,
    close,
    open,
  };
}

function EditTodoModal({
  state,
  todo,
  todosState,
  closeDrawer,
  noticeSnackBarState,
}) {
  const close = () => {
    state.close();
    closeDrawer();
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    form.content.value = form.content.value.trim();

    if (form.content.value.length == 0) {
      alert("Enter a new task.");
      form.content.focus();
      return;
    }
    todosState.modifyTodoById(todo.id, form.content.value);
    close();
    noticeSnackBarState.open(`Changed to-do number ${todo.id}.`, "info");
  };
  return (
    <>
      <Modal
        open={state.opened}
        onClose={close}
        className="flex justify-center items-center"
      >
        <div className="bg-white p-10 rounded-[20px]">
          <form onSubmit={onSubmit} className="flex flex-col mt-4 px-4 gap-2">
            <TextField
              minRows={3}
              maxRows={10}
              multiline
              autoComplete="off"
              name="content"
              label="Enter a task."
              variant="outlined"
              defaultValue={todo?.content}
            />
            <Button type="submit" variant="contained">
              Change
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}

function useEditTodoModalState() {
  const [opened, setOpened] = useState(false);
  const open = () => {
    setOpened(true);
  };

  const close = () => {
    setOpened(false);
  };
  return {
    opened,
    open,
    close,
  };
}

function TodoOptionDrawer({ state, todosState, noticeSnackBarState }) {
  const editTodoModalState = useEditTodoModalState();
  const removeTodo = () => {
    if (window.confirm(`Delete to-do number ${state.todoId}?`) == false) {
      state.close();
      return;
    }
    todosState.removeTodoById(state.todoId);
    state.close();
    noticeSnackBarState.open(`Deleted to-do number${todo.id}.`, "info");
  };
  const todo = todosState.findTodoById(state.todoId);

  return (
    <>
      <EditTodoModal
        noticeSnackBarState={noticeSnackBarState}
        state={editTodoModalState}
        todo={todo}
        todosState={todosState}
        closeDrawer={state.close}
      />
      <SwipeableDrawer
        anchor={"bottom"}
        onOpen={() => {}}
        open={state.opened}
        onClose={state.close}
      >
        <List className="!py-0 ">
          <ListItem className="!p-5 !pt-5">
            Number
            <span>&nbsp;</span>
            <span className="text-[color:var(--mui-color-primary-main)] font-bold ">
              {state.todoId}
            </span>
            <span>&nbsp;</span>
            Menu
          </ListItem>
          <ListItemButton
            className="!p-5 !pt-5"
            onClick={editTodoModalState.open}
          >
            <span>
              <i className="fa-solid fa-pen-to-square pr-2 "></i>
            </span>
            Change
          </ListItemButton>
          <ListItemButton className="!p-5 !pt-5" onClick={removeTodo}>
            <span>
              <i className="fa-solid fa-trash-can pr-2"></i>
            </span>
            Delete
          </ListItemButton>
        </List>
      </SwipeableDrawer>
    </>
  );
}

function TodoList({ todosState, noticeSnackBarState }) {
  const todoOptionDrawerState = useTodoOptionDrawerState();

  return (
    <>
      <TodoOptionDrawer
        state={todoOptionDrawerState}
        todosState={todosState}
        noticeSnackBarState={noticeSnackBarState}
      />
      <div className="mt-4 px-4">
        <ul>
          {todosState.todos.map((todo, index) => (
            <TodoListItem
              noticeSnackBarState={noticeSnackBarState}
              key={todo.id}
              todo={todo}
              index={index}
              openDrawer={todoOptionDrawerState.open}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function TodoListItem({ todo, index, openDrawer }) {
  return (
    <>
      <li key={todo.id} className="mt-8">
        <div className="flex gap-2">
          <Chip
            label={`No. ${todo.id} `}
            variant="outlined"
            className="!pt-1"
          />

          <Chip label={todo.regDate} variant="filled" color="primary" />
        </div>
        <div className="flex shadow mt-4 rounded-[20px]">
          <Button
            className=" w-[130px] flex-shrink-0 !items-start !rounded-[20px_0_0_20px]"
            color="inherit"
          >
            <span
              className={classNames(
                "text-3xl",
                "flex items-center",
                "h-[50px]",
                {
                  "text-[color:var(--mui-color-primary-main)]": index % 2 == 0,
                }
              )}
            >
              <i className="fa-solid fa-check"></i>
            </span>
          </Button>
          <div className="flex-shrink-0 w-[2px] bg-[#b0b0b0] my-5 mr-6"></div>
          <div className="whitespace-pre-wrap leading-relaxed hover:text-[color:var(--mui-color-primary-main)] flex-grow my-5 flex items-center">
            {todo.content}
          </div>
          <Button
            onClick={() => openDrawer(todo.id)}
            className=" w-[130px] flex-shrink-0 !rounded-[0_20px_20px_0] !items-start"
            color="inherit"
          >
            <span className=" text-xl text-[#b0b0b0] flex items-center h-[50px]">
              <i className="fa-solid fa-ellipsis"></i>
            </span>
          </Button>
        </div>
      </li>
    </>
  );
}

function useNoticeSnackBarState() {
  const [opened, setOpened] = useState(false);
  const [autoHideDuration, setAutoHideDuration] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [msg, setMsg] = useState(null);

  const open = (msg, severity = "success", autoHideDuration = 6000) => {
    setOpened(true);
    setAutoHideDuration(autoHideDuration);
    setSeverity(severity);
    setMsg(msg);
  };

  const close = () => {
    setOpened(false);
  };

  return {
    opened,
    autoHideDuration,
    severity,
    msg,
    open,
    close,
  };
}

function NoticeSnackBar({ state }) {
  return (
    <>
      <Snackbar
        open={state.opened}
        autoHideDuration={state.autoHideDuration}
        onClose={state.close}
      >
        <Alert severity={state.severity}>{state.msg}</Alert>
      </Snackbar>
    </>
  );
}

function Todo({ theme }) {
  const todosState = useTodosState();
  const noticeSnackBarState = useNoticeSnackBarState();

  useEffect(() => {
    todosState.addTodo("운동\n스트레칭\n유산소\n런지\n스쿼트");
    todosState.addTodo("요리");
    todosState.addTodo("공부");
  }, []);

  useEffect(() => {
    const r = document.querySelector(":root");

    muiThemePaletteKeys.forEach((paletteKey) => {
      const themeColorObj = theme.palette[paletteKey];

      for (const key in themeColorObj) {
        if (Object.hasOwnProperty.call(themeColorObj, key)) {
          const colorVal = themeColorObj[key];
          r.style.setProperty(`--mui-color-${paletteKey}-${key}`, colorVal);
        }
      }
    });
  }, []);

  return (
    <>
      <AppBar position="static">
        <Toolbar className="justify-center">
          <div className="flex-1"></div>
          <div className="font-bold">NOTE PAD</div>
          <div className="flex-1"></div>
        </Toolbar>
      </AppBar>
      <NoticeSnackBar state={noticeSnackBarState} />
      <NewTodoForm
        todosState={todosState}
        noticeSnackBarState={noticeSnackBarState}
      />
      <TodoList
        todosState={todosState}
        noticeSnackBarState={noticeSnackBarState}
      />
    </>
  );
}

function dateToStr(d) {
  const pad = (n) => {
    return n < 10 ? "0" + n : n;
  };

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds())
  );
}

export default Todo;
