(() => {
  const STORAGE_KEY = 'claude-todo-app:todos';

  const form = document.getElementById('new-form');
  const input = document.getElementById('new-input');
  const list = document.getElementById('list');
  const empty = document.getElementById('empty');
  const count = document.getElementById('count');
  const clearDone = document.getElementById('clear-done');
  const filterButtons = document.querySelectorAll('.filters button');

  let todos = load();
  let filter = 'all';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* ストレージが使えない環境ではメモリ上だけで動作 */
    }
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function addTodo(text) {
    todos.push({ id: makeId(), text, done: false });
    save();
    render();
  }

  function toggleTodo(id) {
    const t = todos.find(t => t.id === id);
    if (t) t.done = !t.done;
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function editTodo(id, text) {
    const t = todos.find(t => t.id === id);
    if (!t) return;
    if (text) t.text = text;
    else todos = todos.filter(x => x.id !== id);
    save();
    render();
  }

  function visibleTodos() {
    if (filter === 'active') return todos.filter(t => !t.done);
    if (filter === 'done') return todos.filter(t => t.done);
    return todos;
  }

  function startEdit(li, todo) {
    const span = li.querySelector('.text');
    const edit = document.createElement('input');
    edit.className = 'edit-input';
    edit.value = todo.text;
    span.replaceWith(edit);
    edit.focus();
    edit.select();

    let finished = false;
    const finish = commit => {
      if (finished) return;
      finished = true;
      if (commit) editTodo(todo.id, edit.value.trim());
      else render();
    };
    edit.addEventListener('keydown', e => {
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    edit.addEventListener('blur', () => finish(true));
  }

  function render() {
    list.innerHTML = '';
    const items = visibleTodos();

    for (const todo of items) {
      const li = document.createElement('li');
      li.className = 'item' + (todo.done ? ' done' : '');

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = todo.done;
      check.setAttribute('aria-label', '完了');
      check.addEventListener('change', () => toggleTodo(todo.id));

      const span = document.createElement('span');
      span.className = 'text';
      span.textContent = todo.text;
      span.title = 'ダブルクリックで編集';
      span.addEventListener('dblclick', () => startEdit(li, todo));

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete';
      del.textContent = '✕';
      del.setAttribute('aria-label', '削除');
      del.addEventListener('click', () => deleteTodo(todo.id));

      li.append(check, span, del);
      list.appendChild(li);
    }

    const remaining = todos.filter(t => !t.done).length;
    count.textContent = `残り ${remaining} 件`;
    empty.style.display = items.length ? 'none' : 'block';
    clearDone.style.visibility = todos.some(t => t.done) ? 'visible' : 'hidden';
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTodo(text);
    input.value = '';
    input.focus();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  });

  clearDone.addEventListener('click', () => {
    todos = todos.filter(t => !t.done);
    save();
    render();
  });

  render();
})();
