from flask import Flask
from flask_bootstrap import Bootstrap
from config import BaseConfig
import rq
import redis

app = Flask(__name__)
app.config.from_object(BaseConfig)
app.redis = redis.Redis.from_url(app.config['REDIS_URL'])
app.task_queue = rq.Queue(connection=app.redis)
app.app_context().push()
bootstrap = Bootstrap(app)


from views import *
