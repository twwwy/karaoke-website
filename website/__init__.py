import logging
from logging.handlers import RotatingFileHandler
import os
from flask import Flask
from flask_bootstrap import Bootstrap
from config import BaseConfig
import rq
import redis

bootstrap = Bootstrap()

def create_app(config_class=BaseConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.redis = redis.Redis.from_url(app.config['REDIS_URL'])
    bootstrap.init_app((app))
    app.task_queue = rq.Queue(connection=app.redis)
    app.app_context().push()

    from website.main import bp as main_bp
    app.register_blueprint(main_bp)

    if not os.path.exists('logs'):
        os.mkdir('logs')

    file_handler = RotatingFileHandler('logs/karaoke.log',
                                       maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s ''[in %(pathname)s:%(lineno)d]'))
    file_handler.setLevel(logging.DEBUG)
    app.logger.addHandler(file_handler)

    app.logger.setLevel(logging.DEBUG)
    app.logger.info('Karaoke startup')

    return app

