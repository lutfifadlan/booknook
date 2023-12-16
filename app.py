from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length
from pymongo import MongoClient

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['MONGO_URI'] = 'your_mongodb_uri'
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
mongo = MongoClient(app.config['MONGO_URI'])
db = mongo.get_database('bookshelf')

class User(UserMixin):
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password = password
        self.books = []

class Book:
    def __init__(self, title, author):
        self.title = title
        self.author = author

@login_manager.user_loader
def load_user(user_id):
    user_data = db.users.find_one({"_id": user_id})
    if user_data:
        return User(username=user_data['username'], email=user_data['email'], password=user_data['password'])
    return None

@app.route('/')
@login_required
def index():
    user_data = db.users.find_one({"_id": current_user.get_id()})
    books = user_data.get('books', [])
    return render_template('index.html', books=books)

@app.route('/add_book', methods=['POST'])
@login_required
def add_book():
    title = request.form['title']
    author = request.form['author']
    
    new_book = Book(title=title, author=author)
    db.users.update_one({"_id": current_user.get_id()}, {"$push": {"books": {"title": title, "author": author}}})

    return redirect(url_for('index'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user_data = db.users.find_one({"email": form.email.data})
        if user_data and bcrypt.check_password_hash(user_data['password'], form.password.data):
            user = User(username=user_data['username'], email=user_data['email'], password=user_data['password'])
            login_user(user)
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Login unsuccessful. Please check your email and password.', 'danger')
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
