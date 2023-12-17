from flask import Flask, render_template, request, redirect, url_for, flash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, validators
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user, logout_user
from pymongo import MongoClient
from bson import ObjectId
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

mongdb_creds = os.environ['MONGO_URI']
client = MongoClient(mongdb_creds)
db = client['booknook']

class User(UserMixin):
    def __init__(self, username):
        self.username = username
    def get_id(self):
        return (self.username)
    # def is_authenticated(self):
    #     return True

class BookForm(FlaskForm):
    title = StringField('Title', [validators.Length(min=1, max=100)])
    author = StringField('Author', [validators.Length(min=1, max=100)])
    rating = StringField('Rating', [validators.NumberRange(min=1, max=5)])

@login_manager.user_loader
def load_user(username):
    return User(username)

class RegistrationForm(FlaskForm):
    username = StringField('Username', [validators.Length(min=4, max=25)])
    password = PasswordField('Password', [
        validators.DataRequired(),
        validators.EqualTo('confirm_password', message='Passwords must match')
    ])
    confirm_password = PasswordField('Confirm Password')

@app.route('/')
def index():
    books = db.books.find()
    return render_template('index.html', books=books)

@app.route('/add_book', methods=['POST'])
@login_required
def add_book():
    title = request.form.get('title')
    author = request.form.get('author')
    rating = int(request.form.get('rating'))

    db.books.insert_one({'title': title, 'author': author, 'rating': rating})

    return redirect(url_for('index'))

@app.route('/edit_book/<string:book_id>', methods=['GET', 'POST'])
@login_required
def edit_book(book_id):
    book = db.books.find_one({'_id': ObjectId(book_id)})

    if not book:
        flash('Book not found', 'danger')
        return redirect(url_for('index'))

    form = BookForm(request.form)

    if request.method == 'POST' and form.validate():
        title = form.title.data
        author = form.author.data
        rating = int(form.rating.data)

        db.books.update_one({'_id': ObjectId(book_id)}, {'$set': {'title': title, 'author': author, 'rating': rating}})
        flash('Book updated successfully', 'success')
        return redirect(url_for('index'))

    return render_template('edit_book.html', form=form, book=book)

@app.route('/delete_book/<string:book_id>', methods=['POST'])
@login_required
def delete_book(book_id):
    db.books.delete_one({'_id': ObjectId(book_id)})
    flash('Book deleted successfully', 'success')
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        db.users.insert_one({'username': form.username.data, 'password': hashed_password})
        flash('Your account has been created!', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user_data = db.users.find_one({'username': username})

        if user_data and bcrypt.check_password_hash(user_data['password'], password):
            user = User(username)
            login_user(user)
            flash('Login successful!', 'success')
            print('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Login unsuccessful. Please check your username and password.', 'danger')
            print('Login unsuccessful. Please check your username and password.', 'danger')

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run()
