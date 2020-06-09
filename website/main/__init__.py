from flask import Blueprint

bp = Blueprint('main', __name__)

from website.main import views