from flask import Flask, render_template, request, redirect, url_for, flash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, validators
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user, logout_user
from pymongo import MongoClient

app = Flask(__name__)
app.config['SECRET_KEY'] = 'sprm7B6hLM'
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

client = MongoClient('mongodb+srv://prod-read-write:7FSfayMKn0HUEvAY@tryout.qidzm.mongodb.net/?retryWrites=true&w=majority')
db = client['booknook']

class User(UserMixin):
    def __init__(self, username):
        self.username = username
    def get_id(self):
        return (self.username)
    def is_authenticated(self):
        return True

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
    app.run(debug=True, host='0.0.0.0')
