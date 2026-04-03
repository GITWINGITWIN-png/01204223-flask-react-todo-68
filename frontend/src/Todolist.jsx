import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext.jsx';
import './App.css'

import TodoItem from './TodoItem.jsx'


function TodoList({apiUrl}) {
  const TODOLIST_API_URL = apiUrl;

  const [todoList, setTodoList] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const { username, accessToken, logout } = useAuth();
  const token = localStorage.getItem('token');
  // newComments จะเก็บ object ในรูปแบบ { todo_id: "ข้อความ", ... }
  //const [newComments, setNewComments] = useState({});

  useEffect(() => {
    fetchTodoList();
  }, [username]);

  async function fetchTodoList() {
    try {
      const response = await fetch(TODOLIST_API_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Network error');
      }
      const data = await response.json();
      setTodoList(data);
    } catch (err) {
      alert("Failed to fetch todo list. Make sure backend is running.");
      setTodoList([]);
    }
  }

  async function toggleDone(id) {
    const toggle_api_url = `${TODOLIST_API_URL}${id}/toggle/`
    try {
      const response = await fetch(toggle_api_url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const updatedTodo = await response.json();
        // อัปเดต state โดยแทนที่ตัวเดิมด้วยตัวใหม่ที่ได้จาก server
        setTodoList(todoList.map(todo => todo.id === id ? updatedTodo : todo));
      }
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  }

  async function addNewTodo() {
    try {
      const response = await fetch(TODOLIST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 'title': newTitle }),
      });
      if (response.ok) {
        const newTodo = await response.json();
        // เพิ่ม todo ใหม่เข้าไปใน list และเคลียร์ช่อง input
        setTodoList([...todoList, newTodo]);
        setNewTitle("");
      }
    } catch (error) {
      console.error("Error adding new todo:", error);
    }
  }

  async function deleteTodo(id) {
    const delete_api_url = `${TODOLIST_API_URL}${id}/`
    try {
      const response = await fetch(delete_api_url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setTodoList(todoList.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  // ย้ายฟังก์ชันนี้เข้ามาข้างใน App component เพื่อให้เรียกใช้ state ได้
  async function addNewComment(todoId, message) {
    try {
      const url = `${TODOLIST_API_URL}${todoId}/comments/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 'message': message }), // ใช้ message ที่รับมา
      });
      
      if (response.ok) {
        await fetchTodoList(); // โหลดข้อมูลใหม่
        return true; // ส่งค่ากลับบอกว่าสำเร็จ
      }
    } catch (error) {
      console.error("Error adding new comment:", error);
    }
    return false;
  }

  return (
    <>
      <h1>Todo List</h1>
      <ul>
        {todoList.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo}
            // *** ต้องส่งฟังก์ชันพวกนี้ลงไปให้ลูก ***
            toggleDone={toggleDone}
            deleteTodo={deleteTodo}
            addNewComment={addNewComment} 
          />
          ))}
      </ul>
      
      {/* ส่วน Add New Task เหมือนเดิม */}
      <div style={{ marginTop: '20px', borderTop: '2px solid black', paddingTop: '10px' }}>
        <h3>New Task</h3>
        <input 
          type="text" 
          placeholder="New task title..."
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
        />
        <button onClick={addNewTodo}>Add Task</button>
      </div>
      <br/>
      <a href="/about">About</a>
      <br/>
      {username && (
        <a href="#" onClick={(e) => {e.preventDefault(); logout();}}>Logout</a>
      )}
    </>
  )
}

export default TodoList;
