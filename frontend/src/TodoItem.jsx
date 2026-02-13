import './App.css'
import { useState } from 'react'

function TodoItem({ todo, toggleDone, deleteTodo, addNewComment }) {
  const [commentInput, setCommentInput] = useState(""); 

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;

    const success = await addNewComment(todo.id, commentInput);
    
    if (success) {
        setCommentInput(""); 
    }
  }

  return (
    <li style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span 
                className={todo.done ? "done" : ""} 
                style={{ textDecoration: todo.done ? 'line-through' : 'none', flexGrow: 1 }}
              >
                {todo.title}
              </span>
              {/* เรียกใช้ฟังก์ชันผ่าน props */}
              <button onClick={() => toggleDone(todo.id)}>
                {todo.done ? "Undo" : "Done"}
              </button>
              <button onClick={() => deleteTodo(todo.id)}>❌</button>
            </div>

            {/* ส่วนแสดง Comments */}
	    {(!todo.comments || todo.comments.length === 0) && (
  <div style={{ marginTop: '10px', marginLeft: '20px', fontSize: '0.9em' }}>
    <b>Comment:</b>
    <ul>
      <li>No comments</li>
    </ul>
  </div>
)}
            {(todo.comments && todo.comments.length > 0) && (
              <div style={{ marginTop: '10px', marginLeft: '20px', fontSize: '0.9em' }}>
                <b>{todo.comments.length} Comments: </b>
                <ul>
                  {todo.comments.map(comment => (
                    <li key={comment.id}>{comment.message} </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ส่วนฟอร์มเพิ่ม Comment */}
            <div className="new-comment-forms" style={{ marginTop: '10px', marginLeft: '20px' }}>
              <input
                type="text"
                placeholder="Add a comment..."
                // ผูกกับ State ภายในตัวลูกเอง
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <button onClick={handleAddComment}>Add Comment</button>
            </div>
          </li>
  )
}

export default TodoItem
