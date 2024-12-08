import { addTodo, deleteTodo, getTodos, updateTodo} from './data.js' 

const input = {
  title: "Visit University friends",
  done: 0
};

// const res = await addTodo(input);
// const res = await deleteTodo(6);
const res = await getTodos("all");

// test update (Visit friends | 0 | 2024-01-15 to 2025)
// const res = await updateTodo(5, input);

console.log(res)