(() => {
  const STORAGE_KEY = 'claude-todo-app:todos';

  const form = document.getElementById('new-form');
  const input = document.getElementById('new-input');
  const dueInput = document.getElementById('new-due');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const toast = document.getElementById('toast');
  const undoBtn = document.getElementById('undo');
  const list = document.getElementById('list');
  const empty = document.getElementById('empty');
  const count = document.getElementById('count');
  const clearDone = document.getElementById('clear-done');
  const filterButtons = document.querySelectorAll('.filters button');

  let todos = load();
  let filter = 'all';
  let lastDeleted = null; // { todo, index }
  let toastTimer = null;

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

  function addTodo(text, due) {
    todos.push({ id: makeId(), text, done: false, due });
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
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return;
    lastDeleted = { todo: todos[index], index };
    todos.splice(index, 1);
    save();
    render();
    showToast();
  }

  // 削除の取り消し：5 秒間だけ「元に戻す」を表示する
  function showToast() {
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
      lastDeleted = null;
    }, 5000);
  }

  function undoDelete() {
    if (!lastDeleted) return;
    todos.splice(Math.min(lastDeleted.index, todos.length), 0, lastDeleted.todo);
    lastDeleted = null;
    toast.hidden = true;
    clearTimeout(toastTimer);
    save();
    render();
  }

  function today() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatDue(due) {
    const [, m, d] = due.split('-');
    return `${Number(m)}/${Number(d)}`;
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

      li.append(check, span);

      // 期限：今日なら「今日」、過ぎていたら赤く表示
      if (todo.due) {
        const due = document.createElement('span');
        const t = today();
        const overdue = !todo.done && todo.due < t;
        due.className = 'due' + (overdue ? ' overdue' : '') + (!todo.done && todo.due === t ? ' today' : '');
        due.textContent = overdue ? `期限切れ ${formatDue(todo.due)}` : todo.due === t ? '今日まで' : `${formatDue(todo.due)} まで`;
        li.appendChild(due);
      }

      li.appendChild(del);
      list.appendChild(li);
    }

    const remaining = todos.filter(t => !t.done).length;
    count.textContent = `残り ${remaining} 件`;

    // 達成率
    const doneCount = todos.length - remaining;
    const rate = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
    progressFill.style.width = rate + '%';
    progressText.textContent = todos.length ? `${doneCount}/${todos.length} 件完了（${rate}%）` : '';
    empty.style.display = items.length ? 'none' : 'block';
    clearDone.style.visibility = todos.some(t => t.done) ? 'visible' : 'hidden';
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTodo(text, dueInput.value || null);
    input.value = '';
    dueInput.value = '';
    input.focus();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  });

  undoBtn.addEventListener('click', undoDelete);

  clearDone.addEventListener('click', () => {
    todos = todos.filter(t => !t.done);
    save();
    render();
  });

  render();
})();
