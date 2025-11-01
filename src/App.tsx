import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import { Construction } from "lucide-react";

type Priority = "Urgente" | "Moyenne" | "Basse";
type Todo = { id: number; text: string; priority: Priority };
type TodoList = { id: number; name: string; todos: Todo[] };

function App() {
  const savedLists = localStorage.getItem("todoLists");
  const [todoLists, setTodoLists] = useState<TodoList[]>(savedLists ? JSON.parse(savedLists) : []);
  const [activeListId, setActiveListId] = useState<number | null>(todoLists[0]?.id || null);
  const [newListName, setNewListName] = useState("");
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("Moyenne");
  const [filter, setFilter] = useState<Priority | "Tous">("Tous");
  const [selectedTodos, setSelectedTodos] = useState<Set<number>>(new Set());

  const activeList = todoLists.find((l) => l.id === activeListId);

  useEffect(() => localStorage.setItem("todoLists", JSON.stringify(todoLists)), [todoLists]);

  const addList = () => {
    if (!newListName.trim()) return;
    const newList: TodoList = { id: Date.now(), name: newListName.trim(), todos: [] };
    setTodoLists([newList, ...todoLists]);
    setNewListName("");
    setActiveListId(newList.id);
  };

  const updateActiveList = (updater: (todos: Todo[]) => Todo[]) => {
    if (!activeList) return;
    setTodoLists(todoLists.map(list => list.id === activeList.id ? { ...list, todos: updater(list.todos) } : list));
  };

  const addTodo = () => { if (!input.trim()) return; updateActiveList(todos => [{ id: Date.now(), text: input.trim(), priority }, ...todos]); setInput(""); };
  const deleteTodo = (id: number) => updateActiveList(todos => todos.filter(t => t.id !== id));
  const finishSelected = () => { updateActiveList(todos => todos.filter(t => !selectedTodos.has(t.id))); setSelectedTodos(new Set()); };
  const finishAll = () => updateActiveList(() => []);
  const toggleSelectTodo = (id: number) => { const newSet = new Set(selectedTodos); newSet.has(id) ? newSet.delete(id) : newSet.add(id); setSelectedTodos(newSet); };

  const filteredTodos = activeList ? (filter === "Tous" ? activeList.todos : activeList.todos.filter(t => t.priority === filter)) : [];
  const counts = { total: activeList?.todos.length || 0, Urgente: activeList?.todos.filter(t => t.priority === "Urgente").length || 0, Moyenne: activeList?.todos.filter(t => t.priority === "Moyenne").length || 0, Basse: activeList?.todos.filter(t => t.priority === "Basse").length || 0 };

  return (
    <div className="flex h-screen bg-base-200">
      <div className="w-1/4 bg-base-300 p-6 flex flex-col rounded-r-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-3">Listes</h2>
        <form onSubmit={e => { e.preventDefault(); addList(); }} className="flex gap-2 mb-4">
          <input className="input input-primary w-full" placeholder="Nouvelle liste" value={newListName} onChange={e => setNewListName(e.target.value)} />
          <button type="submit" className="btn btn-primary">+</button>
        </form>
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {todoLists.length ? todoLists.map(list => (
            <button key={list.id} onClick={() => setActiveListId(list.id)} className={`btn w-full ${activeListId === list.id ? "btn-primary" : "btn-soft"}`}>{list.name} ({list.todos.length})</button>
          )) : <p className="text-sm text-gray-400">Aucune liste</p>}
        </ul>
      </div>

      <div className="flex-1 flex justify-center overflow-y-auto p-10">
        {activeList ? (
          <div className="w-4/5 flex flex-col gap-4 bg-base-100 p-5 rounded-2xl shadow-md">
            <div className="flex gap-4">
              <input className="input input-primary w-full" placeholder="Ajouter une tâche" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} />
              <select className="select select-primary" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                <option value="Urgente">Urgente</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
              </select>
              <button className="btn btn-primary" onClick={addTodo}>Ajouter</button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className={`btn btn-soft ${filter === "Tous" ? "btn-primary" : ""}`} onClick={() => setFilter("Tous")}>Tous ({counts.total})</button>
              <button className={`btn btn-soft ${filter === "Urgente" ? "btn-primary" : ""}`} onClick={() => setFilter("Urgente")}>Urgente ({counts.Urgente})</button>
              <button className={`btn btn-soft ${filter === "Moyenne" ? "btn-primary" : ""}`} onClick={() => setFilter("Moyenne")}>Moyenne ({counts.Moyenne})</button>
              <button className={`btn btn-soft ${filter === "Basse" ? "btn-primary" : ""}`} onClick={() => setFilter("Basse")}>Basse ({counts.Basse})</button>

              <button onClick={finishSelected} className="btn btn-primary" disabled={selectedTodos.size === 0}>Finir sélection ({selectedTodos.size})</button>
              <button onClick={finishAll} className="btn btn-error btn-soft" disabled={counts.total === 0}>Tout terminer ({counts.total})</button>
            </div>

            {filteredTodos.length ? (
              <ul className="divide-y divide-primary/20">
                {filteredTodos.map(todo => <TodoItem key={todo.id} todo={todo} onDelete={() => deleteTodo(todo.id)} isSelected={selectedTodos.has(todo.id)} onToggleSelect={() => toggleSelectTodo(todo.id)} />)}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center p-5">
                <Construction className="w-40 h-40 text-primary" />
                <p>Aucune tâche dans cette liste.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 text-lg">
            <Construction className="w-40 h-40 text-primary" />
            <p>Sélectionne ou crée une liste à gauche.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
