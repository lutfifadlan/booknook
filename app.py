from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, validators
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user, logout_user
from pymongo import MongoClient, errors
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

class BookForm(FlaskForm):
    title = StringField('Title', [validators.Length(min=1, max=100)])
    author = StringField('Author', [validators.Length(min=1, max=100)])
    rating = StringField('Rating', [validators.Length(min=1, max=1), validators.regexp(r'[1-5]', message='Rating must be between 1 and 5')])
    current_read_page = StringField('Current Read Page', [validators.Length(min=1, max=5), validators.regexp(r'^[1-9]$', message='Current Read Page must be between 1 and 99999')])

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
    if current_user.is_authenticated:
        books = db.books.find()
        user_books = [book for book in books if book['user_id'] == current_user.username]
        return render_template('index.html', books=user_books)
    else:
        return render_template('index.html')

@app.route('/add_book', methods=['POST'])
@login_required
def add_book():
    title = request.form.get('title')
    author = request.form.get('author')
    rating = int(request.form.get('rating'))
    current_read_page = int(request.form.get('current_read_page')) if request.form.get('current_read_page') else 0

    db.books.insert_one({
        'user_id': current_user.username,
        'title': title,
        'author': author,
        'rating': rating,
        'current_read_page': current_read_page
    })

    return redirect(url_for('index'))

@app.route('/edit_book/<string:book_id>', methods=['GET', 'POST'])
@login_required
def edit_book(book_id):
    book = db.books.find_one({'_id': ObjectId(book_id), 'user_id': current_user.username })

    if not book:
        return redirect(url_for('index'), error='Book not found')

    form = BookForm(request.form)

    if request.method == 'POST':
        if form.validate():
            title = form.title.data
            author = form.author.data
            rating = int(form.rating.data)

            if form.current_read_page.data and type(form.current_read_page.data) == int:
                current_read_page = int(form.current_read_page.data)
            else:
                current_read_page = 0

            db.books.update_one({'_id': ObjectId(book_id)}, {'$set': {'title': title, 'author': author, 'rating': rating, 'current_read_page': current_read_page}})
            return redirect(url_for('index'))
        else:
            return redirect(url_for('index'), error=form.errors)

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
        try:
            db.users.insert_one({'username': form.username.data, 'password': hashed_password})
        except errors.DuplicateKeyError:
            error_message='Username already exists. Please choose another username.'
            return render_template('register.html', form=form, error=error_message)
        except:
            error_message='Error when inserting user'
            return render_template('register.html', form=form, error=error_message)

        user = User(form.username.data)
        login_user(user)
        return redirect(url_for('index'))

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
            return redirect(url_for('index'))
        else:
            return render_template('login.html', form=request.form, error='Login unsuccessful. Please check your username and password.')

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=False)
