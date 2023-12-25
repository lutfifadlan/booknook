from flask import Flask, render_template, request, redirect, url_for, flash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, validators
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user, logout_user
from pymongo import MongoClient, errors
from bson import ObjectId
from langcodes import Language
import os, requests

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

mongdb_creds = os.environ['MONGO_URI']
client = MongoClient(mongdb_creds)
db = client['booknook']

GOOGLE_API_KEY = os.environ['GOOGLE_API_KEY']
GOOGLE_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

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
        user_books = db.books.find({ 'user_id': current_user.username })
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

@app.route('/search_book', methods=['GET', 'POST'])
def search_book():
    query = request.form.get('search_book_query')
    params = {'q': query, 'key': GOOGLE_API_KEY, 'maxResults': 40}
    response = requests.get(GOOGLE_BASE_URL, params=params)

    if response.status_code == 200:
        data = response.json()

        books = []
        for item in data.get('items', []):
            volume_info = item.get('volumeInfo', {})
            title = volume_info.get('title', '')
            authors = volume_info.get('authors', [])
            description = volume_info.get('description', '')
            rating = volume_info.get('averageRating', 0)
            published_date = volume_info.get('publishedDate', 'N/A')
            page_count = volume_info.get('pageCount', 0)
            iso_6391_language = volume_info.get('language', 'N/A')
            language = Language.get(iso_6391_language).autonym() if iso_6391_language != 'N/A' else 'N/A'
            books.append({
                'title': title,
                'authors': ', '.join(authors),
                'description': description,
                'rating': int(rating),
                'published_date': published_date,
                'page_count': int(page_count),
                'language': language
            })
        return render_template('search_book.html', books=books, search_book_query=query)
    else:
        return render_template('search_book.html')

if __name__ == '__main__':
    if os.environ['FLASK_ENV'] == 'development':
        app.run(debug=True, host='127.0.0.1', port=8000)
    else:
        app.run(host='0.0.0.0', port=80)
