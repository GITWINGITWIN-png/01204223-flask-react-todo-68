from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
# Import ตัวแปร db และ Models มาจาก models.py
from models import db, TodoItem, Comment, User
import click 
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_jwt_extended import JWTManager

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['JWT_SECRET_KEY'] = 'fdsjkfjioi2rjshr2345hrsh043j5oij5545mairubnakrub'
jwt = JWTManager(app)

# เชื่อมต่อ db กับ app ที่นี่
db.init_app(app)
migrate = Migrate(app, db)

# --- Routes ---

@app.route('/api/todos/', methods=['GET'])
@jwt_required()
def get_todos():
    todos = TodoItem.query.all()
    return jsonify([todo.to_dict() for todo in todos])

def new_todo(data):
    return TodoItem(title=data['title'], 
                    done=data.get('done', False))

@app.route('/api/todos/', methods=['POST'])
def add_todo():
    data = request.get_json()
    # ตรวจสอบว่ามี title ส่งมาหรือไม่
    if not data or 'title' not in data:
         return jsonify({'error': 'Title is required'}), 400
         
    todo = new_todo(data)
    if todo:
        db.session.add(todo)
        db.session.commit()
        return jsonify(todo.to_dict())
    else:
        return (jsonify({'error': 'Invalid todo data'}), 400)    

@app.route('/api/todos/<int:id>/toggle/', methods=['PATCH'])
def toggle_todo(id):
    todo = TodoItem.query.get_or_404(id)
    todo.done = not todo.done
    db.session.commit()
    return jsonify(todo.to_dict())

@app.route('/api/todos/<int:id>/', methods=['DELETE'])
def delete_todo(id):
    todo = TodoItem.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Todo deleted successfully'})

@app.route('/api/todos/<int:todo_id>/comments/', methods=['POST'])
def add_comment(todo_id):
    todo_item = TodoItem.query.get_or_404(todo_id)

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Comment message is required'}), 400

    comment = Comment(
        message=data['message'],
        todo=todo_item # ใช้ object assignment จะปลอดภัยกว่า todo_id โดยตรง
    )
    db.session.add(comment)
    db.session.commit()
 
    return jsonify(comment.to_dict())

@app.cli.command("create-user")
@click.argument("username")
@click.argument("full_name")
@click.argument("password")
def create_user(username, full_name, password):
    user = User.query.filter_by(username=username).first()
    if user:
        click.echo("User already exists.")
        return
    user = User(username=username, full_name=full_name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    click.echo(f"User {username} created successfully.")

@app.route('/api/login/', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=user.username)
    return jsonify(access_token=access_token)

# *** ลบ Code ส่วน Class Definition ด้านล่างทิ้งทั้งหมด ***
# เพราะเรา import มาจาก models.py แล้ว
